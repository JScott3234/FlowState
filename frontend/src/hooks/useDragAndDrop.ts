import { useState, useCallback } from 'react';
import {
    useSensor,
    useSensors,
    MouseSensor,
    TouchSensor,
    PointerSensor,
    type DragStartEvent,
    type DragEndEvent
} from '@dnd-kit/core';
import type { Task } from '../types/calendar';
import type { TaskTemplate } from '../data/templates';

interface UseDragAndDropProps {
    tasks: Task[];
    onTaskMove: (taskId: string, newStartTime: Date, newCategory: string) => void;
    onTaskCreate?: (template: TaskTemplate, startTime: Date, category: string) => void;
}

export function useDragAndDrop({ tasks, onTaskMove, onTaskCreate }: UseDragAndDropProps) {
    const [activeId, setActiveId] = useState<string | null>(null);
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [activeTemplate, setActiveTemplate] = useState<TaskTemplate | null>(null);

    // Use mouse sensor with distance constraint to prevent accidental drags
    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 5, // Must move 5px before drag starts
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250, // Touch and hold for 250ms
                tolerance: 5,
            },
        }),
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        })
    );

    const handleDragStart = useCallback((event: DragStartEvent) => {
        const { active } = event;
        const data = active.data.current as { type?: string; task?: Task; template?: TaskTemplate };

        if (data?.type === 'template' && data.template) {
            setActiveId(active.id as string);
            setActiveTemplate(data.template);
        } else {
            const taskId = active.id as string;
            const task = tasks.find(t => t.id === taskId);

            if (task) {
                setActiveId(taskId);
                setActiveTask(task);
            }
        }
    }, [tasks]);

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) {
            setActiveId(null);
            setActiveTask(null);
            setActiveTemplate(null);
            return;
        }

        const overData = over.data.current as {
            type: string;
            date?: Date;
            category?: string
        } | undefined;

        if (overData?.type === 'calendar-cell' && overData.date) {
            // Handle template drop (create new task)
            if (activeTemplate && onTaskCreate) {
                // For templates, we simply snap to the dropped slot's time
                // The TimeBlock now provides the exact start time in overData.date
                onTaskCreate(activeTemplate, overData.date, overData.category || activeTemplate.category);
            }
            // Handle existing task move
            else if (activeTask) {
                // For existing tasks, it's also safer to snap to the target slot
                // We can use the delta if we want sub-slot precision, but snapping to grid is better UX for this view
                onTaskMove(
                    active.id as string,
                    overData.date,
                    overData.category || activeTask.category
                );
            }
        }

        setActiveId(null);
        setActiveTask(null);
        setActiveTemplate(null);
    }, [activeTask, activeTemplate, onTaskMove, onTaskCreate]);

    return {
        sensors,
        activeId,
        activeTask,
        activeTemplate,
        handleDragStart,
        handleDragEnd,
    };
}
