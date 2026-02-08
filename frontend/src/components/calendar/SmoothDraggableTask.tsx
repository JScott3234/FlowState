import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '../../types/calendarTypes';
import { cn } from '../../lib/utils';

interface SmoothDraggableTaskProps {
    task: Task;
    isOverlay?: boolean;
}

export const SmoothDraggableTask: React.FC<SmoothDraggableTaskProps> = ({
    task,
    isOverlay = false
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useDraggable({
        id: task.id,
        data: {
            task,
            type: 'task'
        },
    });

    // Use CSS transform for GPU-accelerated smooth movement
    const style = {
        transform: CSS.Translate.toString(transform),
        transition: isOverlay ? undefined : transition,
        zIndex: isOverlay ? 9999 : isDragging ? 100 : 1,
    };

    // Calculate height based on duration (60px = 1 hour)
    const height = (task.duration / 60) * 60;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "absolute w-[90%] left-[5%] rounded-lg p-2 cursor-grab select-none",
                "shadow-sm border border-white/20",
                "transition-shadow duration-150",
                isDragging && "opacity-40 cursor-grabbing shadow-lg",
                isOverlay && "opacity-95 cursor-grabbing shadow-2xl rotate-1 scale-105 ring-2 ring-white/50",
                "backdrop-blur-md"
            )}
            {...listeners}
            {...attributes}
        >
            {/* Task content */}
            <div
                className="h-full rounded-md p-2"
                style={{ backgroundColor: `${task.color}90` }}
            >
                <div className="text-xs font-semibold text-white truncate drop-shadow-md">
                    {task.title}
                </div>
                <div className="text-[10px] text-white/80 font-medium">
                    {formatTime(task.startTime)} - {task.duration}min
                </div>
            </div>

            {/* Resize handle at bottom */}
            {!isOverlay && (
                <div
                    className="absolute bottom-0 left-2 right-2 h-2 cursor-ns-resize 
                     hover:bg-white/30 rounded-full transition-colors"
                    onMouseDown={(e) => {
                        e.stopPropagation();
                        // TODO: Implement resize
                    }}
                />
            )}
        </div>
    );
};

function formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}
