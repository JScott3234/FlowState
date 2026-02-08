import React from 'react';
import {
    startOfYear,
    eachMonthOfInterval,
    format,
    isSameMonth,
    isSameDay,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isToday
} from 'date-fns';
import { cn } from '../../lib/utils';
import { type Task } from '../../types/calendarTypes';

interface YearViewProps {
    currentDate: Date;
    tasks: Task[];
    onMonthSelect?: (date: Date) => void;
}

export const YearView: React.FC<YearViewProps> = ({ currentDate, tasks, onMonthSelect }) => {
    const yearStart = startOfYear(currentDate);
    const months = eachMonthOfInterval({
        start: yearStart,
        end: new Date(yearStart.getFullYear(), 11, 31)
    });

    return (
        <div className="h-full overflow-y-auto bg-slate-950 p-6">
            <h2 className="text-3xl font-bold text-slate-200 mb-8 sticky top-0 bg-slate-950/90 backdrop-blur-sm p-4 border-b border-white/10 z-10 w-full text-center">
                {yearStart.getFullYear()}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
                {months.map((month) => {
                    const active = isSameMonth(month, currentDate);
                    const monthStart = startOfMonth(month);
                    const monthEnd = endOfMonth(month);
                    const startDate = startOfWeek(monthStart);
                    const endDate = endOfWeek(monthEnd);

                    const days = eachDayOfInterval({ start: startDate, end: endDate });

                    return (
                        <div
                            key={month.toISOString()}
                            onClick={() => onMonthSelect?.(month)}
                            className={cn(
                                "bg-slate-900/40 rounded-2xl p-4 border transition-all hover:bg-slate-900/60 cursor-pointer group",
                                active ? "border-blue-500/30 ring-1 ring-blue-500/20" : "border-white/5 hover:border-white/10"
                            )}
                        >
                            <h3 className="text-lg font-semibold text-slate-200 mb-4 px-2 group-hover:text-blue-400 transition-colors">
                                {format(month, 'MMMM')}
                            </h3>

                            <div className="grid grid-cols-7 gap-1 text-center">
                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                                    <div key={d} className="text-[10px] font-medium text-slate-500 mb-2">{d}</div>
                                ))}

                                {days.map(day => {
                                    const isCurrentMonth = isSameMonth(day, month);
                                    const isTodayDate = isToday(day);
                                    const hasTasks = tasks.some(t => isSameDay(t.startTime, day));

                                    return (
                                        <div
                                            key={day.toISOString()}
                                            className={cn(
                                                "aspect-square flex items-center justify-center text-xs rounded-full transition-colors relative",
                                                !isCurrentMonth && "opacity-0", // Hide non-current month days? or dim: "text-slate-800"
                                                isCurrentMonth && "text-slate-400",
                                                isTodayDate && "bg-blue-600 text-white font-bold",
                                                !isTodayDate && hasTasks && isCurrentMonth && "bg-white/10 text-slate-200"
                                            )}
                                        >
                                            {day.getDate()}
                                            {/* Dot indicator for tasks */}
                                            {!isTodayDate && hasTasks && isCurrentMonth && (
                                                <div className="absolute bottom-1 w-0.5 h-0.5 bg-blue-400 rounded-full" />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
