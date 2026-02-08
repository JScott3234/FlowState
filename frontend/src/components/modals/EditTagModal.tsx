import React, { useState, useEffect } from 'react';
import { X, Tag, AlignLeft, Loader2, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { tagAPI } from '../../api/flowstate';

interface EditTagModalProps {
    isOpen: boolean;
    onClose: () => void;
    onTagUpdated: () => void;
    userEmail: string;
    tagName: string;
    currentDescription: string;
}

export const EditTagModal: React.FC<EditTagModalProps> = ({
    isOpen,
    onClose,
    onTagUpdated,
    userEmail,
    tagName,
    currentDescription
}) => {
    const [tagDescription, setTagDescription] = useState(currentDescription);
    const [saving, setSaving] = useState(false);

    // Reset description when modal opens for a specific tag
    useEffect(() => {
        if (isOpen) {
            setTagDescription(currentDescription);
        }
    }, [isOpen, currentDescription]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setSaving(true);
            await tagAPI.updateDescription(userEmail, tagName, tagDescription.trim());
            onTagUpdated();
            onClose();
        } catch (error) {
            console.error('Failed to update tag description:', error);
        } finally {
            setSaving(false);
        }
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

                    {/* Modal Container */}
                    <div className="fixed inset-0 flex items-center justify-center p-4 z-[60]">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            className="w-full max-w-lg bg-[#1e293b] border border-white/10 rounded-2xl shadow-2xl p-6 overflow-hidden"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Tag className="w-5 h-5 text-blue-400" />
                                    Edit Tag: <span className="text-blue-400">{tagName}</span>
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="p-1 text-slate-400 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Tag Name (Read-only) */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">
                                        Tag Name (Immutable)
                                    </label>
                                    <input
                                        type="text"
                                        value={tagName}
                                        disabled
                                        className="w-full bg-slate-900/50 border border-white/5 rounded-xl px-4 py-3 text-slate-500 cursor-not-allowed"
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2 flex items-center gap-2">
                                        <AlignLeft className="w-4 h-4" /> Description
                                    </label>
                                    <textarea
                                        value={tagDescription}
                                        onChange={(e) => setTagDescription(e.target.value)}
                                        placeholder="What is this tag for?"
                                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 h-32 resize-none"
                                        autoFocus
                                    />
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
                                        disabled={saving}
                                        className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
                                    >
                                        {saving ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-5 h-5" />
                                                Save Changes
                                            </>
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
