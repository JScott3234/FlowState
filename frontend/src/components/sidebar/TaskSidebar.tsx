import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { type Task, CATEGORIES, type CategoryId } from '../../types/calendarTypes';
import { TASK_TEMPLATES, type TaskTemplate } from '../../data/templates';
import { Plus, GripVertical, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { cn } from '../../lib/utils';

interface TaskSidebarProps {
    recentTasks: Task[];
    onOpenCreateModal: () => void;
    isOpen: boolean;
    onToggle: () => void;
    filter: CategoryId | 'all';
    onFilterChange: (filter: CategoryId | 'all') => void;
}

export const TaskSidebar: React.FC<TaskSidebarProps> = ({
    recentTasks,
    onOpenCreateModal,
    isOpen,
    onToggle,
    filter,
    onFilterChange
}) => {
    const [isFilterExpanded, setIsFilterExpanded] = React.useState(false);

    return (
        <motion.aside
            animate={{ width: isOpen ? 320 : 70 }}
            className={cn(
                "relative h-full transition-all duration-300 z-40",
                !isOpen && "items-center"
            )}
        >
            {/* Toggle Button - Square with Arrow */}
            <button
                onClick={onToggle}
                className={cn(
                    "absolute top-6 -right-4 w-8 h-8 bg-slate-800 border border-white/10 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors z-[60] cursor-pointer shadow-lg"
                )}
            >
                {isOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>

            {/* Main Sidebar Container with Glass effect */}
            <div className={cn(
                "flex flex-col gap-6 p-4 glass-panel rounded-2xl h-full w-full overflow-hidden border border-white/10",
                !isOpen && "p-2 items-center"
            )}>
                {/* Content Container */}
                <div className={cn("flex flex-col h-full gap-6", !isOpen && "items-center w-full")}>

                    {/* Templates Section */}
                    <div className="flex-shrink-0 flex flex-col overflow-hidden max-h-[40%] w-full">
                        {isOpen ? (
                            <>
                                <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-4 flex items-center justify-between px-1">
                                    <span>Task Templates</span>
                                </h2>
                                <div className="flex flex-col gap-3 overflow-y-auto pr-2 scrollbar-hide flex-1">
                                    {TASK_TEMPLATES.map((template) => (
                                        <DraggableTemplate key={template.id} template={template} />
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="mt-12 flex flex-col gap-4 items-center w-full">
                                {/* Icons only for collapsed state could go here */}
                            </div>
                        )}
                    </div>

                    {/* Filter Section */}
                    {isOpen && (
                        <div className="flex-shrink-0 w-full px-1">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2 text-slate-400">
                                    <Filter className="w-4 h-4" />
                                    <span className="text-xs uppercase font-bold tracking-wider">Filters</span>
                                </div>
                                <button
                                    onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                                    className="p-1 hover:bg-white/10 rounded-md transition-colors text-slate-400 hover:text-white"
                                >
                                    <motion.div animate={{ rotate: isFilterExpanded ? 180 : 0 }}>
                                        <ChevronRight className="w-4 h-4" />
                                    </motion.div>
                                </button>
                            </div>

                            <motion.div
                                initial={false}
                                animate={{
                                    height: isFilterExpanded ? 'auto' : 0,
                                    opacity: isFilterExpanded ? 1 : 0
                                }}
                                className="overflow-hidden"
                            >
                                <div className="flex flex-wrap gap-2 pb-2">
                                    <FilterChip
                                        label="All"
                                        active={filter === 'all'}
                                        onClick={() => onFilterChange('all')}
                                    />
                                    {CATEGORIES.map((cat: { id: CategoryId, label: string, color: string }) => (
                                        <FilterChip
                                            key={cat.id}
                                            label={cat.label}
                                            color={cat.color}
                                            active={filter === cat.id}
                                            onClick={() => onFilterChange(cat.id)}
                                        />
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    )}


                    {/* Recent Tasks */}
                    <div className="flex-1 overflow-hidden flex flex-col w-full">
                        {isOpen && <h2 className="text-lg font-semibold text-slate-300 mb-4 px-1">Recent Tasks</h2>}
                        <div className={cn("flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide w-full", !isOpen && "hidden")}>
                            {recentTasks.map((task) => (
                                <div key={task.id} className="p-3 rounded-lg bg-white/5 border border-white/5 text-sm">
                                    <div className="font-medium text-slate-200">{task.title}</div>
                                    <div className="flex justify-between mt-2 text-xs text-slate-500">
                                        <span>{task.category}</span>
                                        <span>{task.duration}m</span>
                                    </div>
                                </div>
                            ))}
                            {recentTasks.length === 0 && (
                                <div className="text-sm text-slate-600 text-center py-4">
                                    No recent tasks
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Add Button */}
                    {isOpen ? (
                        <button
                            onClick={onOpenCreateModal}
                            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors flex items-center justify-center gap-2 mt-auto shadow-lg shadow-blue-900/20"
                        >
                            <Plus className="w-5 h-5" />
                            Quick Add Task
                        </button>
                    ) : (
                        <button
                            onClick={onOpenCreateModal}
                            className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center mt-auto mb-4 shadow-lg shadow-blue-900/20"
                            title="Quick Add"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>
        </motion.aside>
    );
};

// Helper Components

const FilterChip = ({ label, active, onClick, color }: { label: string, active: boolean, onClick: () => void, color?: string }) => (
    <button
        onClick={onClick}
        className={cn(
            "px-2 py-1 rounded-md text-xs font-medium transition-all border",
            active
                ? "bg-white/10 text-white border-white/20"
                : "bg-transparent text-slate-500 border-transparent hover:bg-white/5 hover:text-slate-300"
        )}
        style={active && color ? { borderColor: color, color: color, backgroundColor: `${color}20` } : {}}
    >
        {label}
    </button>
);

const DraggableTemplate = ({ template }: { template: TaskTemplate }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: template.id,
        data: {
            type: 'template',
            template,
        },
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all cursor-grab active:cursor-grabbing group shadow-md"
        >
            <div className="flex items-center gap-3">
                <div
                    className="w-2 h-8 rounded-full"
                    style={{ backgroundColor: template.color }}
                />
                <div className="flex-1">
                    <h3 className="font-medium text-slate-200 group-hover:text-white transition-colors">
                        {template.title}
                    </h3>
                    <p className="text-xs text-slate-500">
                        {template.duration} min • {template.category}
                    </p>
                </div>
                <GripVertical className="w-5 h-5 text-slate-600 group-hover:text-slate-400" />
            </div>
        </div>
    );
};
