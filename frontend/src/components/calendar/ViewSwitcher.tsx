import React, { useState } from 'react';
import { ChevronDown, Calendar, List, Grid3X3, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

export type CalendarViewMode = 'day' | 'week' | 'month' | 'year';

interface ViewSwitcherProps {
    currentView: CalendarViewMode;
    onViewChange: (view: CalendarViewMode) => void;
}

const VIEW_OPTIONS: { id: CalendarViewMode; label: string; icon: React.ElementType }[] = [
    { id: 'day', label: 'Day', icon: List },
    { id: 'week', label: 'Week', icon: Calendar },
    { id: 'month', label: 'Month', icon: Grid3X3 },
    { id: 'year', label: 'Year', icon: Calendar }, // Reusing Calendar icon or finding another
];

export const ViewSwitcher: React.FC<ViewSwitcherProps> = ({ currentView, onViewChange }) => {
    const [isOpen, setIsOpen] = useState(false);

    const activeOption = VIEW_OPTIONS.find(o => o.id === currentView) || VIEW_OPTIONS[1];

    return (
        <div className="relative z-50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-lg transition-colors text-sm font-medium text-slate-200"
            >
                <activeOption.icon className="w-4 h-4 text-slate-400" />
                <span>{activeOption.label}</span>
                <ChevronDown className={cn("w-4 h-4 text-slate-500 transition-transform", isOpen && "rotate-180")} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.1 }}
                            className="absolute right-0 mt-2 w-40 bg-slate-800 border border-white/10 rounded-xl shadow-xl overflow-hidden z-50 py-1"
                        >
                            {VIEW_OPTIONS.map((option) => (
                                <button
                                    key={option.id}
                                    onClick={() => {
                                        onViewChange(option.id);
                                        setIsOpen(false);
                                    }}
                                    className="w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-white/5 transition-colors"
                                >
                                    <div className="flex items-center gap-2 text-slate-300">
                                        <option.icon className="w-4 h-4 text-slate-500" />
                                        <span>{option.label}</span>
                                    </div>
                                    {currentView === option.id && (
                                        <Check className="w-4 h-4 text-blue-400" />
                                    )}
                                </button>
                            ))}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};
