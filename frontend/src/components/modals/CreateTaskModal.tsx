import React, { useState } from 'react';
import { X, Clock, Calendar as CalendarIcon, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CATEGORIES, type CategoryId } from '../../types/calendar';

interface CreateTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (title: string, duration: number, startTime: Date, category: CategoryId) => void;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ isOpen, onClose, onSave }) => {
    const [title, setTitle] = useState('');
    const [duration, setDuration] = useState(60);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [time, setTime] = useState('09:00');
    const [category, setCategory] = useState<CategoryId>('work');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title) return;

        const startTime = new Date(`${date}T${time}`);
        onSave(title, duration, startTime, category);
        onClose();

        // Reset form slightly after close for smooth animation
        setTimeout(() => {
            setTitle('');
            setDuration(60);
            setCategory('work');
        }, 300);
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

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#1e293b] border border-white/10 rounded-2xl shadow-2xl z-50 p-6"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">New Task</h2>
                            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Title Input */}
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Task Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="What needs to be done?"
                                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    autoFocus
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Date Input */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
                                        <CalendarIcon className="w-4 h-4" /> Date
                                    </label>
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 [color-scheme:dark]"
                                    />
                                </div>

                                {/* Time Input */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
                                        <Clock className="w-4 h-4" /> Time
                                    </label>
                                    <input
                                        type="time"
                                        value={time}
                                        onChange={(e) => setTime(e.target.value)}
                                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 [color-scheme:dark]"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Duration Input */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Duration (min)</label>
                                    <input
                                        type="number"
                                        value={duration}
                                        onChange={(e) => setDuration(Number(e.target.value))}
                                        min={5}
                                        step={5}
                                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    />
                                </div>

                                {/* Category Input */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
                                        <Tag className="w-4 h-4" /> Category
                                    </label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value as CategoryId)}
                                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
                                    >
                                        {CATEGORIES.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!title}
                                    className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Create Task
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
