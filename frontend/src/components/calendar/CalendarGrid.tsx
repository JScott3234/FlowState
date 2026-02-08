import React, { useState } from 'react';
import { DayCell } from './DayCell';
import { type Task, type CategoryId, CATEGORIES } from '../../types/calendarTypes';
import { cn } from '../../lib/utils';
import type { TaskTemplate } from '../../data/templates';
import { TaskDetailsModal } from '../modals/TaskDetailsModal';
import { isSameDay } from 'date-fns';

interface CalendarGridProps {
    tasks: Task[];
    onTaskMove: (taskId: string, newStartTime: Date, newCategory: CategoryId) => void;
    onTaskCreate?: (template: TaskTemplate, startTime: Date, category: CategoryId) => void;
    onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
    onTaskDelete: (taskId: string) => void;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
    tasks,
    onTaskMove,
    onTaskCreate,
    onTaskUpdate,
    onTaskDelete
}) => {
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    // Get current week
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + i);
        return d;
    });

    return (
        <>
            <div className="flex flex-col h-full bg-slate-950 text-slate-100">
                {/* Header */}
                <div className="flex border-b border-white/10 bg-slate-900/50">
                    <div className="w-20 p-3 text-xs font-medium text-slate-400">Time</div>
                    {days.map((day) => (
                        <div
                            key={day.toISOString()}
                            className={cn(
                                "flex-1 p-3 text-center border-l border-white/10",
                                isToday(day) && "bg-blue-500/10"
                            )}
                        >
                            <div className="text-xs text-slate-400 uppercase">
                                {day.toLocaleDateString('en-US', { weekday: 'short' })}
                            </div>
                            <div className={cn(
                                "text-lg font-bold",
                                isToday(day) ? "text-blue-400" : "text-slate-200"
                            )}>
                                {day.getDate()}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Calendar Body */}
                <div className="flex flex-1 overflow-auto">
                    {/* Time Labels */}
                    <div className="w-20 flex-shrink-0 border-r border-white/10 bg-slate-900/30">
                        {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                            <div
                                key={hour}
                                className="h-[60px] text-xs text-slate-500 text-right pr-3 pt-1 font-medium transform -translate-y-2"
                            >
                                {hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                            </div>
                        ))}
                    </div>

                    {/* Days */}
                    <div className="flex flex-1 min-w-[800px]">
                        {days.map((day) => (
                            <div key={day.toISOString()} className="flex flex-1 flex-col">
                                {/* Category Rows */}
                                <div className="flex flex-col flex-1">
                                    {CATEGORIES.map((cat) => (
                                        <div
                                            key={cat.id}
                                            className="flex-1 border-b border-white/5 last:border-b-0"
                                            style={{
                                                backgroundColor: `${cat.color}05`
                                            }}
                                        >
                                            <DayCell
                                                day={day}
                                                category={cat.id as CategoryId}
                                                tasks={tasks.filter(t =>
                                                    (t.category === cat.id || t.tagNames?.includes(cat.id)) && isSameDay(t.startTime, day)
                                                )}
                                                onEdit={setEditingTask}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {editingTask && (
                <TaskDetailsModal
                    isOpen={!!editingTask}
                    onClose={() => setEditingTask(null)}
                    task={editingTask}
                    onSave={onTaskUpdate}
                    onDelete={onTaskDelete}
                />
            )}
        </>
    );
};

function isToday(date: Date): boolean {
    return isSameDay(date, new Date());
}

// isSameDay is imported from date-fns now

