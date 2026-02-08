import React, { useState, useEffect, useCallback } from 'react';
import { X, Tag, AlignLeft, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { tagAPI, taskAPI, type Task } from '../../api/flowstate';

interface AddTagModalProps {
    isOpen: boolean;
    onClose: () => void;
    onTagCreated: () => void;
    userEmail: string;
}

export const AddTagModal: React.FC<AddTagModalProps> = ({
    isOpen,
    onClose,
    onTagCreated,
    userEmail
}) => {
    const [tagName, setTagName] = useState('');
    const [tagDescription, setTagDescription] = useState('');
    const [tasks, setTasks] = useState<Task[]>([]);
    const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
    const [loadingTasks, setLoadingTasks] = useState(false);
    const [saving, setSaving] = useState(false);

    const loadTasks = useCallback(async () => {
        try {
            setLoadingTasks(true);
            const userTasks = await taskAPI.getAllForUser(userEmail);
            setTasks(userTasks);
        } catch (error) {
            console.error('Failed to load tasks:', error);
        } finally {
            setLoadingTasks(false);
        }
    }, [userEmail]);

    // Load tasks when modal opens
    useEffect(() => {
        if (isOpen) {
            loadTasks();
        } else {
            // Reset form when closed
            setTagName('');
            setTagDescription('');
            setSelectedTasks(new Set());
        }
    }, [isOpen, loadTasks]);

    const toggleTaskSelection = (taskTitle: string) => {
        setSelectedTasks(prev => {
            const next = new Set(prev);
            if (next.has(taskTitle)) {
                next.delete(taskTitle);
            } else {
                next.add(taskTitle);
            }
            return next;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tagName.trim()) return;

        try {
            setSaving(true);

            // Create the tag
            await tagAPI.create(userEmail, tagName.trim(), tagDescription.trim() || undefined);

            // Add the tag to selected tasks
            for (const taskTitle of selectedTasks) {
                await taskAPI.addTag(userEmail, taskTitle, tagName.trim());
            }

            onTagCreated();
            onClose();
        } catch (error) {
            console.error('Failed to create tag:', error);
        } finally {
            setSaving(false);
        }
    };

    // Get task color for display
    const getTaskColor = (task: Task) => {
        return task.color || '#3b82f6';
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal Container - Properly centered */}
                    <div className="fixed inset-0 flex items-center justify-center p-4 z-[60]">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            className="w-full max-w-lg bg-[#1e293b] border border-white/10 rounded-2xl shadow-2xl p-6 max-h-[80vh] overflow-y-auto"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Tag className="w-5 h-5 text-blue-400" />
                                    New Tag
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="p-1 text-slate-400 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Tag Name */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">
                                        Tag Name
                                    </label>
                                    <input
                                        type="text"
                                        value={tagName}
                                        onChange={(e) => setTagName(e.target.value)}
                                        placeholder="e.g., Work, Personal, Urgent"
                                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        autoFocus
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
                                        <AlignLeft className="w-4 h-4" /> Description (optional)
                                    </label>
                                    <textarea
                                        value={tagDescription}
                                        onChange={(e) => setTagDescription(e.target.value)}
                                        placeholder="What is this tag for?"
                                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 h-20 resize-none"
                                    />
                                </div>

                                {/* Task Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-3">
                                        Add to Tasks (optional)
                                    </label>

                                    {loadingTasks ? (
                                        <div className="flex items-center justify-center py-8">
                                            <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                                        </div>
                                    ) : tasks.length === 0 ? (
                                        <p className="text-slate-500 text-sm text-center py-4">
                                            No tasks available
                                        </p>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2">
                                            {tasks.map((task) => (
                                                <button
                                                    key={task.title}
                                                    type="button"
                                                    onClick={() => toggleTaskSelection(task.title)}
                                                    className={`
                                                        relative p-3 rounded-xl border text-left transition-all
                                                        ${selectedTasks.has(task.title)
                                                            ? 'border-blue-500 bg-blue-500/10'
                                                            : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'}
                                                    `}
                                                >
                                                    <div className="flex items-start gap-2">
                                                        <div
                                                            className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                                                            style={{ backgroundColor: getTaskColor(task) }}
                                                        />
                                                        <span className="text-sm text-white line-clamp-2">
                                                            {task.title}
                                                        </span>
                                                    </div>
                                                    {selectedTasks.has(task.title) && (
                                                        <div className="absolute top-1 right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                                            <Check className="w-3 h-3 text-white" />
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!tagName.trim() || saving}
                                        className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {saving ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Creating...
                                            </>
                                        ) : (
                                            'Create Tag'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};
