import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Tag as TagIcon, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { tagAPI, taskAPI, type Tag } from '../api/flowstate';
import { AddTagModal } from '../components/modals/AddTagModal';
import { EditTagModal } from '../components/modals/EditTagModal';
import { useAuth } from '../contexts/AuthContext';

export const Tags: React.FC = () => {
    const { email } = useAuth();
    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);

    // Fetch tags when email becomes available
    useEffect(() => {
        fetchTags();
    }, [email]);

    const fetchTags = async () => {
        if (!email) return;
        try {
            setLoading(true);
            const userTags = await tagAPI.getAllForUser(email);
            setTags(userTags);
        } catch (error) {
            console.error('Failed to fetch tags:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTag = async (e: React.MouseEvent, tagName: string) => {
        e.stopPropagation(); // Prevent opening the edit modal
        if (!email) return;
        if (deleteConfirm !== tagName) {
            // First click: show confirmation
            setDeleteConfirm(tagName);
            return;
        }

        // Second click: actually delete
        try {
            setDeleting(tagName);

            // First, get all tasks with this tag and delete them
            const tasksWithTag = await taskAPI.getByTag(email, tagName);
            for (const task of tasksWithTag) {
                await taskAPI.delete(email, task.title);
            }

            // Then delete the tag itself
            await tagAPI.delete(email, tagName);

            // Refresh tags list
            await fetchTags();
        } catch (error) {
            console.error('Failed to delete tag:', error);
        } finally {
            setDeleting(null);
            setDeleteConfirm(null);
        }
    };

    const handleTagCreated = () => {
        fetchTags();
        setIsAddModalOpen(false);
    };

    const handleTagUpdated = () => {
        fetchTags();
        setIsEditModalOpen(false);
    };

    const handleCardClick = (tag: Tag) => {
        setSelectedTag(tag);
        setIsEditModalOpen(true);
    };

    // Color palette for tags
    const getTagColor = (index: number) => {
        const colors = [
            'from-blue-500 to-cyan-500',
            'from-purple-500 to-pink-500',
            'from-green-500 to-emerald-500',
            'from-orange-500 to-amber-500',
            'from-red-500 to-rose-500',
            'from-indigo-500 to-violet-500',
        ];
        return colors[index % colors.length];
    };

    return (
        <div className="flex-1 p-6 overflow-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Tags
                    </h1>
                    <p className="text-slate-400 mt-1">Manage your task categories and labels</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-medium transition-colors shadow-lg shadow-blue-900/20"
                >
                    <Plus className="w-5 h-5" />
                    Add Tag
                </button>
            </div>

            {/* Tags Grid */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : tags.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                    <TagIcon className="w-16 h-16 text-slate-600 mb-4" />
                    <h3 className="text-xl font-semibold text-slate-400">No tags yet</h3>
                    <p className="text-slate-500 mt-2">Create your first tag to organize your tasks</p>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="mt-4 flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-300 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Create Tag
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    <AnimatePresence mode="popLayout">
                        {tags.map((tag, index) => (
                            <motion.div
                                key={tag.tag_name}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="group relative"
                            >
                                <div
                                    onClick={() => handleCardClick(tag)}
                                    className={`
                                        p-4 rounded-xl border border-white/10 bg-gradient-to-br ${getTagColor(index)} bg-opacity-10
                                        hover:border-blue-500/50 hover:bg-blue-500/5 transition-all duration-200 cursor-pointer group/card
                                        ${deleting === tag.tag_name ? 'opacity-50' : ''}
                                    `}
                                    style={{
                                        background: `linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)`
                                    }}>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getTagColor(index)}`} />
                                            <h3 className="font-semibold text-white text-lg group-hover/card:text-blue-300 transition-colors uppercase tracking-tight">{tag.tag_name}</h3>
                                        </div>
                                        <button
                                            onClick={(e) => handleDeleteTag(e, tag.tag_name)}
                                            disabled={deleting === tag.tag_name}
                                            className={`
                                                p-1.5 rounded-lg transition-all
                                                ${deleteConfirm === tag.tag_name
                                                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                                    : 'opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-400 hover:bg-white/5'}
                                            `}
                                            title={deleteConfirm === tag.tag_name ? 'Click again to confirm deletion' : 'Delete tag'}
                                        >
                                            {deleteConfirm === tag.tag_name ? (
                                                <AlertTriangle className="w-4 h-4" />
                                            ) : (
                                                <Trash2 className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                    {tag.tag_description && (
                                        <p className="text-slate-400 text-sm mt-2 line-clamp-2">
                                            {tag.tag_description}
                                        </p>
                                    )}
                                    {deleteConfirm === tag.tag_name && (
                                        <motion.p
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="text-red-400 text-xs mt-2 flex items-center gap-1"
                                        >
                                            <AlertTriangle className="w-3 h-3" />
                                            Click again to delete tag and all its tasks
                                        </motion.p>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Add Tag Modal */}
            <AddTagModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onTagCreated={handleTagCreated}
                userEmail={email || ''}
            />

            {/* Edit Tag Modal */}
            <EditTagModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedTag(null);
                }}
                onTagUpdated={handleTagUpdated}
                userEmail={email || ''}
                tagName={selectedTag?.tag_name || ''}
                currentDescription={selectedTag?.tag_description || ''}
            />
        </div>
    );
};
