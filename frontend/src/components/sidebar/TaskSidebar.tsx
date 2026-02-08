import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ChevronLeft, ChevronRight, Clock, Tag } from 'lucide-react';
import { TEMPLATES } from '../../data/templates';
import { SidebarTemplateItem } from './SidebarTemplateItem';
import { CATEGORIES } from '../../types/calendarTypes';
import type { CategoryId, Task } from '../../types/calendarTypes';
import { cn } from '../../lib/utils';

interface TaskSidebarProps {
    recentTasks: Task[];
    onCreateTask: (title: string, duration: number, category: CategoryId) => void;
}

export const TaskSidebar: React.FC<TaskSidebarProps> = ({ recentTasks, onCreateTask }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [showQuickAdd, setShowQuickAdd] = useState(false);
    const [title, setTitle] = useState('');
    const [duration, setDuration] = useState(60);
    const [category, setCategory] = useState<CategoryId>('work');

    // Load collapse state from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('sidebar-collapsed');
        if (saved !== null) {
            setIsCollapsed(saved === 'true');
        }
    }, []);

    // Save collapse state to localStorage
    const toggleCollapse = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        localStorage.setItem('sidebar-collapsed', String(newState));
    };

    const handleCreateTask = () => {
        if (title.trim()) {
            onCreateTask(title, duration, category);
            setTitle('');
            setDuration(60);
            setCategory('work');
            setShowQuickAdd(false);
        }
    };

    return (
        <motion.div
            initial={false}
            animate={{ width: isCollapsed ? 60 : 280 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="flex-shrink-0 h-full glass-panel rounded-2xl overflow-hidden relative"
        >
            {/* Collapse Toggle */}
            <button
                onClick={toggleCollapse}
                className="absolute top-4 right-2 z-10 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
                {isCollapsed ? (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                ) : (
                    <ChevronLeft className="w-4 h-4 text-slate-400" />
                )}
            </button>

            <AnimatePresence mode="wait">
                {isCollapsed ? (
                    // Collapsed View
                    <motion.div
                        key="collapsed"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-full flex flex-col items-center pt-16 gap-4"
                    >
                        <button
                            onClick={() => {
                                setIsCollapsed(false);
                                setShowQuickAdd(true);
                            }}
                            className="p-3 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 transition-colors"
                            title="Create New Task"
                        >
                            <Plus className="w-5 h-5 text-blue-400" />
                        </button>
                    </motion.div>
                ) : (
                    // Expanded View
                    <motion.div
                        key="expanded"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-full flex flex-col p-4 pt-14 overflow-hidden"
                    >
                        {/* Create New Task Button */}
                        <button
                            onClick={() => setShowQuickAdd(!showQuickAdd)}
                            className={cn(
                                "w-full p-3 rounded-lg flex items-center justify-center gap-2",
                                "font-semibold text-sm transition-all",
                                showQuickAdd
                                    ? "bg-blue-500/30 text-blue-300"
                                    : "bg-blue-500/20 hover:bg-blue-500/30 text-blue-400"
                            )}
                        >
                            <Plus className="w-4 h-4" />
                            Create New Task
                        </button>

                        {/* Quick Add Form */}
                        <AnimatePresence>
                            {showQuickAdd && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                >
                                    <div className="mt-3 p-3 rounded-lg bg-white/5 border border-white/10 space-y-3">
                                        <input
                                            type="text"
                                            placeholder="Task title..."
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg bg-slate-900/50 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        />

                                        <div className="flex gap-2">
                                            <div className="flex-1">
                                                <label className="text-xs text-slate-400 mb-1 block">
                                                    <Clock className="w-3 h-3 inline mr-1" />
                                                    Duration
                                                </label>
                                                <select
                                                    value={duration}
                                                    onChange={(e) => setDuration(Number(e.target.value))}
                                                    className="w-full px-2 py-1.5 rounded-lg bg-slate-900/50 border border-white/10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                                >
                                                    <option value={15}>15 min</option>
                                                    <option value={30}>30 min</option>
                                                    <option value={45}>45 min</option>
                                                    <option value={60}>1 hour</option>
                                                    <option value={90}>1.5 hours</option>
                                                    <option value={120}>2 hours</option>
                                                </select>
                                            </div>

                                            <div className="flex-1">
                                                <label className="text-xs text-slate-400 mb-1 block">
                                                    <Tag className="w-3 h-3 inline mr-1" />
                                                    Category
                                                </label>
                                                <select
                                                    value={category}
                                                    onChange={(e) => setCategory(e.target.value as CategoryId)}
                                                    className="w-full px-2 py-1.5 rounded-lg bg-slate-900/50 border border-white/10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                                >
                                                    {CATEGORIES.map((cat) => (
                                                        <option key={cat.id} value={cat.id}>
                                                            {cat.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleCreateTask}
                                            disabled={!title.trim()}
                                            className="w-full py-2 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold text-sm transition-colors"
                                        >
                                            Create
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Templates Section */}
                        <div className="mt-6 flex-1 overflow-y-auto">
                            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                                Templates
                            </h3>
                            <div className="space-y-2">
                                {TEMPLATES.map((template) => (
                                    <SidebarTemplateItem key={template.id} template={template} />
                                ))}
                            </div>

                            {/* Recent Tasks */}
                            {recentTasks.length > 0 && (
                                <div className="mt-6">
                                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                                        Recent
                                    </h3>
                                    <div className="space-y-2">
                                        {recentTasks.slice(0, 5).map((task) => (
                                            <div
                                                key={task.id}
                                                className="p-2 rounded-lg bg-white/5 border border-white/10"
                                            >
                                                <div className="text-xs font-medium text-white truncate">
                                                    {task.title}
                                                </div>
                                                <div className="text-[10px] text-white/60 mt-0.5">
                                                    {task.duration} min
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
