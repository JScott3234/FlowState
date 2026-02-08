import { useState } from 'react';
import { CalendarGrid } from '../components/calendar/CalendarGrid';
import { TaskSidebar } from '../components/sidebar/TaskSidebar';
import { CreateTaskModal } from '../components/modals/CreateTaskModal';
import { useCalendarState } from '../hooks/useCalendarState';
import type { CategoryId } from '../types/calendarTypes';
import { CATEGORIES } from '../types/calendarTypes';
import { DndContext, DragOverlay, defaultDropAnimationSideEffects } from '@dnd-kit/core';
import { useDragAndDrop } from '../hooks/useDragAndDrop';
import { SmoothDraggableTask } from '../components/calendar/SmoothDraggableTask';

export const Dashboard = () => {
    const {
        tasks,
        addTask,
        updateTask,
        moveTask,
        deleteTask
    } = useCalendarState();

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [filterCategory, setFilterCategory] = useState<CategoryId | 'all'>('all');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Get recent tasks (sorted by creation/start time, most recent first)
    const recentTasks = [...tasks]
        .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
        .slice(0, 5);

    // Filter tasks for the calendar
    const filteredTasks = filterCategory === 'all'
        ? tasks
        : tasks.filter(t => t.category === filterCategory || t.tagNames?.includes(filterCategory));


    const { sensors, activeTask, activeTemplate, handleDragStart, handleDragEnd } = useDragAndDrop({
        tasks,
        onTaskMove: moveTask,
        onTaskCreate: (template, startTime, category) => {
            addTask({
                id: `temp-${Date.now()}`,
                title: template.title,
                category: category as CategoryId,
                startTime,
                endTime: new Date(startTime.getTime() + template.duration * 60000),
                duration: template.duration,
                color: template.color,
                isCompleted: false,
                estimatedTime: template.duration,
                recurrence: template.recurrence
            });
        }
    });

    const dropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({
            styles: {
                active: {
                    opacity: '0.5',
                },
            },
        }),
    };

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex-1 mt-4 flex gap-4 overflow-hidden h-full">
                <TaskSidebar
                    recentTasks={recentTasks}
                    onOpenCreateModal={() => setIsCreateModalOpen(true)}
                    isOpen={isSidebarOpen}
                    onToggle={() => setIsSidebarOpen(prev => !prev)}
                    filter={filterCategory}
                    onFilterChange={setFilterCategory}
                />
                <main className="flex-1 overflow-hidden relative glass-panel rounded-2xl flex flex-col">
                    <CalendarGrid
                        tasks={filteredTasks}
                        onTaskMove={(id, time, cat) => moveTask(id, time, cat as CategoryId)}
                        onTaskUpdate={updateTask}
                        onTaskDelete={deleteTask}
                    // onTaskCreate is handled via DnD hook directly or we can pass it if Grid needs it
                    />
                </main>
            </div>

            <CreateTaskModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSave={(title, duration, startTime, category) => {
                    const categoryColor = CATEGORIES.find(c => c.id === category)?.color || '#3b82f6';
                    const endTime = new Date(startTime);
                    endTime.setMinutes(endTime.getMinutes() + duration);

                    addTask({
                        id: `task-${Date.now()}`, // Temporary ID
                        title,
                        category,
                        startTime,
                        endTime,
                        duration,
                        color: categoryColor,
                        isCompleted: false,
                        estimatedTime: duration,
                        recurrence: undefined // or default
                    });
                    setIsCreateModalOpen(false);
                }}
            />

            {/* Drag Overlay */}
            <DragOverlay dropAnimation={dropAnimation}>
                {activeTask ? (
                    <div style={{ width: '200px' }}>
                        <SmoothDraggableTask task={activeTask} isOverlay />
                    </div>
                ) : activeTemplate ? (
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 shadow-2xl w-64 ring-2 ring-blue-500/50 backdrop-blur-xl">
                        <div className="flex items-center gap-300">
                            <div
                                className="w-2 h-8 rounded-full"
                                style={{ backgroundColor: activeTemplate.color }}
                            />
                            <div className="flex-1">
                                <h3 className="font-medium text-white">{activeTemplate.title}</h3>
                                <p className="text-xs text-white/60">
                                    {activeTemplate.duration} min • {activeTemplate.category}
                                </p>
                            </div>
                        </div>
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
};
