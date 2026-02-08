import React from 'react';
import type { Task, CategoryId } from '../../types/calendar';
import { SmoothDraggableTask } from './SmoothDraggableTask';
import { SnapGrid } from './SnapGrid';

interface DayCellProps {
    day: Date;
    category: CategoryId;
    tasks: Task[];
    onEdit?: (task: Task) => void;
}

export const DayCell: React.FC<DayCellProps> = ({
    day,
    category,
    tasks,
    onEdit
}) => {
    return (
        <SnapGrid date={day} category={category}>
            <div className="relative h-full">
                {tasks.map((task) => (
                    <div
                        key={task.id}
                        className="absolute w-full"
                        style={{
                            top: `${getYPosition(task.startTime)}px`,
                        }}
                    >
                        <SmoothDraggableTask task={task} onEdit={onEdit} />
                    </div>
                ))}
            </div>
        </SnapGrid>
    );
};

function getYPosition(date: Date): number {
    const hour = date.getHours();
    const minute = date.getMinutes();
    return (hour + minute / 60) * 60;
}