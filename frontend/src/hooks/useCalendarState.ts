import { useState, useCallback, useEffect } from 'react';
import type { Task, CategoryId } from '../types/calendarTypes';
import { addMinutes, isSameDay } from 'date-fns';
import { taskAPI } from '../api/flowstate';

// Hardcoded for dev/demo purposes
const DEMO_EMAIL = "test@mulino.com";

export function useCalendarState() {
    const [tasks, setTasks] = useState<Task[]>([]);

    const fetchTasks = useCallback(async () => {
        try {
            const fetchedTasks = await taskAPI.getAllForUser(DEMO_EMAIL);
            // Transform API tasks to frontend Task format
            const formattedTasks: Task[] = fetchedTasks.map((t: any) => ({
                id: t._id || t.id,
                title: t.title,
                description: t.description,
                startTime: t.start_time ? new Date(t.start_time) : new Date(), // Fallback
                endTime: t.end_time ? new Date(t.end_time) : addMinutes(new Date(), 30),
                category: (t.tag_names?.[0] as CategoryId) || 'work',
                duration: t.duration || 30,
                color: t.color || '#3b82f6',
                isCompleted: t.is_completed || false,
                estimatedTime: t.estimatedTime || 30,
                recurrence: t.recurrence,
                tagNames: t.tag_names || []
            }));
            setTasks(formattedTasks);
        } catch (error) {
            console.error("Failed to fetch tasks:", error);
        }
    }, []);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const addTask = useCallback(async (task: Task) => {
        // Optimistic update
        setTasks((prev) => [...prev, task]);
        try {
            await taskAPI.create(
                DEMO_EMAIL,
                task.title,
                task.description,
                [task.category],
                task.startTime,
                task.endTime,
                task.recurrence,
                task.color
            );
            // Refresh to get ID
            fetchTasks();
        } catch (e) {
            console.error("Failed to add task", e);
        }
    }, [fetchTasks]);

    const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
        setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
        try {
            const backendUpdates: any = { ...updates };
            // Map frontend keys to backend keys
            if (updates.startTime) backendUpdates.start_time = updates.startTime.toISOString();
            if (updates.endTime) backendUpdates.end_time = updates.endTime.toISOString();
            if (updates.tagNames) backendUpdates.tag_names = updates.tagNames;
            if (updates.isCompleted !== undefined) backendUpdates.is_completed = updates.isCompleted;
            if (updates.color) backendUpdates.color = updates.color;

            await taskAPI.update(id, backendUpdates);
        } catch (e) {
            console.error("Failed to update task", e);
        }
    }, []);

    const moveTask = useCallback((id: string, newStartTime: Date, newCategory?: CategoryId) => {
        setTasks((prev) => prev.map((t) => {
            if (t.id !== id) return t;

            const duration = t.duration;
            const endTime = addMinutes(newStartTime, duration);

            // Trigger API update
            const updates: Partial<Task> = {
                startTime: newStartTime,
                endTime,
                category: newCategory || t.category
            };

            // We call the API asynchronously but update state immediately
            taskAPI.update(id, {
                start_time: newStartTime.toISOString(),
                end_time: endTime.toISOString(),
                tag_names: [newCategory || t.category]
            }).catch(console.error);

            return {
                ...t,
                ...updates
            };
        }));
    }, []);

    const resizeTask = useCallback((id: string, newDuration: number) => {
        setTasks((prev) => prev.map((t) => {
            if (t.id !== id) return t;

            const endTime = addMinutes(t.startTime, newDuration);

            // Trigger API update
            taskAPI.update(id, {
                end_time: endTime.toISOString(),
                // We might need to store duration explicitly if backend supports it,
                // otherwise it's derived from start/end
            }).catch(console.error);

            return {
                ...t,
                duration: newDuration,
                endTime,
                estimatedTime: newDuration,
            };
        }));
    }, []);

    const deleteTask = useCallback(async (id: string) => {
        setTasks((prev) => prev.filter((t) => t.id !== id));
        try {
            await taskAPI.deleteById(id);
        } catch (e) {
            console.error("Failed to delete task", e);
            // Optionally revert state here if needed
        }
    }, []);

    const getTasksForDayAndCategory = useCallback((date: Date, categoryId: CategoryId) => {
        return tasks.filter((t) =>
            (t.category === categoryId || t.tagNames?.includes(categoryId)) && isSameDay(t.startTime, date)
        );
    }, [tasks]);

    return {
        tasks,
        addTask,
        updateTask,
        moveTask,
        resizeTask,
        deleteTask,
        getTasksForDayAndCategory,
    };
}
