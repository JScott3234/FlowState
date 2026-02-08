import type { CategoryId } from "../types/calendarTypes";

export interface TaskTemplate {
    id: string;
    title: string;
    duration: number; // minutes
    category: CategoryId;
    color: string;
    recurrence?: string;
}

export const TASK_TEMPLATES: TaskTemplate[] = [
    { id: 'template-work', title: 'Work Task Template', duration: 60, category: 'work', color: '#3b82f6' },
    { id: 'template-school', title: 'School Task Template', duration: 60, category: 'school', color: '#8b5cf6' },
    { id: 'template-hobby', title: 'Hobby Task Template', duration: 60, category: 'hobbies', color: '#f97316' },
];
