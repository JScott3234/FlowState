import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Layout, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { taskAPI } from './api/flowstate';
import { type Task, type Category } from './types/calendarTypes';
import { CreateTaskModal } from './components/modals/CreateTaskModal';
import { useAuth } from './contexts/AuthContext';
import { useCalendar } from './contexts/CalendarContext';

export default function Tasks() {
    const { email } = useAuth();
    const { tasks, deleteTask, fetchTasks } = useCalendar(); // Use context for tasks
    const [templates, setTemplates] = useState<Task[]>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);

    // Filter tasks to show only templates
    useEffect(() => {
        const templateTasks = tasks.filter(t => t.isTemplate);
        setTemplates(templateTasks);
    }, [tasks]);

    // Force refresh on mount to ensure we have latest
    useEffect(() => {
        if (email) fetchTasks();
    }, [email, fetchTasks]);


    const handleDeleteTemplate = async (e: React.MouseEvent, taskId: string) => {
        e.stopPropagation();
        if (deleteConfirm !== taskId) {
            setDeleteConfirm(taskId);
            return;
        }

        try {
            setDeleting(taskId);
            await deleteTask(taskId);
            // Context updates automatically
        } catch (error) {
            console.error('Failed to delete template:', error);
        } finally {
            setDeleting(null);
            setDeleteConfirm(null);
        }
    };



    // Color palette for templates (cycling)
    const getTemplateColor = (index: number) => {
        const colors = [
            'from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-200',
            'from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-200',
            'from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-200',
            'from-orange-500/20 to-amber-500/20 border-orange-500/30 text-orange-200',
        ];
        return colors[index % colors.length];
    };

    return (
        <div className="flex-1 p-6 overflow-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                        Task Templates
                    </h1>
                    <p className="text-slate-400 mt-1">Manage reusable tasks for your schedule</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-medium transition-colors shadow-lg shadow-blue-900/20"
                >
                    <Plus className="w-5 h-5" />
                    Create Template
                </button>
            </div>

            {/* Templates Grid */}
            {templates.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                    <Layout className="w-16 h-16 text-slate-600 mb-4" />
                    <h3 className="text-xl font-semibold text-slate-400">No templates yet</h3>
                    <p className="text-slate-500 mt-2">Create your first template to use in your calendar</p>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="mt-4 flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-300 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Create Template
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    <AnimatePresence mode="popLayout">
                        {templates.map((template, index) => (
                            <motion.div
                                key={template.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className={`
                                    group relative p-4 rounded-xl border bg-gradient-to-br backdrop-blur-sm
                                    hover:border-white/30 transition-all duration-200
                                    ${getTemplateColor(index)}
                                `}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-black/20 flex items-center justify-center text-lg">
                                            {/* Icon placeholder or derive from category */}
                                            📝
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white truncate max-w-[120px]" title={template.title}>{template.title}</h3>
                                            <div className="text-xs opacity-70 flex items-center gap-1">
                                                <span>{template.duration} min</span>
                                                {template.category && <span>• {template.category}</span>}
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={(e) => handleDeleteTemplate(e, template.id)}
                                        disabled={deleting === template.id}
                                        className={`
                                            p-1.5 rounded-lg transition-all
                                            ${deleteConfirm === template.id
                                                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                                : 'opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-400 hover:bg-black/20'}
                                        `}
                                        title={deleteConfirm === template.id ? 'Click again to confirm deletion' : 'Delete template'}
                                    >
                                        {deleteConfirm === template.id ? <AlertTriangle className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                                    </button>
                                </div>

                                {template.description && (
                                    <p className="text-sm opacity-60 line-clamp-2 mb-2 bg-black/10 p-2 rounded-lg">
                                        {template.description}
                                    </p>
                                )}

                                {deleteConfirm === template.id && (
                                    <motion.p
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="text-red-300 text-xs mt-2 font-medium"
                                    >
                                        Click again to delete
                                    </motion.p>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            <CreateTaskModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSave={async (title, _duration, startTime, tag, _description, _isCompleted, _actualDuration, isTemplate, color) => {
                    // create(email, title, description, tagNames, startTime, recurrence, color, taskClientId, socketId, aiEstimationStatus, isTemplate)
                    await taskAPI.create(
                        email || '',
                        title,
                        undefined, // description
                        [tag],     // tagNames
                        startTime,
                        undefined, // recurrence
                        color || 'blue', // color
                        undefined, // taskClientId
                        undefined, // socketId
                        undefined, // aiEstimationStatus
                        isTemplate // isTemplate
                    );
                    setIsCreateModalOpen(false);
                }}
                categories={[]} // Pass actual categories if available
                isTemplateMode={true}
            />
        </div>
    );
}