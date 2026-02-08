import type { CategoryId } from '../types/calendarTypes';

export interface TaskTemplate {
    id: string;
    title: string;
    duration: number;
    category: CategoryId;
    color: string;
}

export const TEMPLATES: TaskTemplate[] = [
    { id: 'template-1', title: 'Deep Work', duration: 120, category: 'work', color: '#3b82f6' },
    { id: 'template-2', title: 'Quick Meeting', duration: 30, category: 'work', color: '#3b82f6' },
    { id: 'template-3', title: 'Study Session', duration: 90, category: 'school', color: '#8b5cf6' },
    { id: 'template-4', title: 'Gym', duration: 60, category: 'hobbies', color: '#f97316' },
    { id: 'template-5', title: 'Lunch Break', duration: 45, category: 'hobbies', color: '#f97316' },
];
