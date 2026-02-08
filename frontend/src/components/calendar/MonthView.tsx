import React from 'react';
import {
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    isToday
} from 'date-fns';
import { cn } from '../../lib/utils';
import { type Task } from '../../types/calendarTypes';

interface MonthViewProps {
    currentDate: Date;
    tasks: Task[];
    onDateSelect?: (date: Date) => void;
}

export const MonthView: React.FC<MonthViewProps> = ({ currentDate, tasks, onDateSelect }) => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden">
            {/* Header: Week Days */}
            <div className="grid grid-cols-7 border-b border-white/10 bg-slate-900/50">
                {weekDays.map((day) => (
                    <div key={day} className="py-2 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                        {day}
                    </div>
                ))}
            </div>

            {/* Grid */}
            <div className="flex-1 grid grid-cols-7 grid-rows-5 md:grid-rows-6">
                {days.map((day) => {
                    const dayTasks = tasks.filter(t => isSameDay(t.startTime, day));
                    const isCurrentMonth = isSameMonth(day, monthStart);

                    return (
                        <div
                            key={day.toISOString()}
                            onClick={() => onDateSelect?.(day)}
                            className={cn(
                                "min-h-[80px] border-b border-r border-white/5 p-2 transition-colors relative group hover:bg-white/5 cursor-pointer",
                                !isCurrentMonth && "bg-slate-900/20 text-slate-600",
                                isToday(day) && "bg-blue-500/5"
                            )}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <span className={cn(
                                    "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full",
                                    isToday(day)
                                        ? "bg-blue-600 text-white"
                                        : (isCurrentMonth ? "text-slate-300" : "text-slate-600")
                                )}>
                                    {day.getDate()}
                                </span>
                                {dayTasks.length > 0 && (
                                    <span className="text-xs text-slate-500 font-medium">{dayTasks.length}</span>
                                )}
                            </div>

                            <div className="flex flex-col gap-1 overflow-hidden max-h-[calc(100%-30px)]">
                                {dayTasks.slice(0, 3).map((task) => (
                                    <div
                                        key={task.id}
                                        className="text-[10px] px-1.5 py-0.5 roundedtruncate border border-white/5 truncate"
                                        style={{ backgroundColor: `${task.color || '#3b82f6'}20`, color: task.color || '#3b82f6', borderColor: `${task.color}30` }}
                                    >
                                        {task.title}
                                    </div>
                                ))}
                                {dayTasks.length > 3 && (
                                    <div className="text-[10px] text-slate-500 pl-1">
                                        + {dayTasks.length - 3} more
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
