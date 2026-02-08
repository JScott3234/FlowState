import { useState } from 'react';
import { LogOut, Sparkles, ChevronRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';

export const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState<'flobot' | 'profile' | false>(false);
    const { email, signOut } = useAuth();

    const handleLogout = async () => {
        await signOut();
    };

    const switchAccount = async () => {
        await signOut();
    }

    return (
        <header className="flex items-center justify-between px-6 py-4 glass-panel rounded-2xl relative z-30">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">F</span>
                </div>
                <div>
                    <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">FlowState</h2>
                    <p className="text-xs text-slate-400">{email || 'Loading...'}</p>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="relative">
                    <button
                        onClick={() => setIsMenuOpen(isMenuOpen === 'flobot' ? false : 'flobot')}
                        className={cn(
                            "group flex items-center gap-2 pl-1 pr-4 py-1 rounded-full border transition-all duration-300",
                            isMenuOpen === 'flobot'
                                ? "bg-blue-600/10 border-blue-500/50 shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                                : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-blue-500/10"
                        )}
                    >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <span className={cn(
                            "text-sm font-medium transition-colors",
                            isMenuOpen === 'flobot' ? "text-blue-300" : "text-slate-300 group-hover:text-white"
                        )}>
                            What's the Flow?
                        </span>
                    </button>

                    {isMenuOpen === 'flobot' && (
                        <div className="absolute top-14 right-0 w-80 bg-slate-900 border border-white/10 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200 p-4">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                    <Sparkles className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">FloBot AI</h3>
                                    <p className="text-xs text-slate-400">Your flow state companion</p>
                                </div>
                            </div>

                            <div className="bg-white/5 rounded-xl p-3 mb-4 min-h-[100px] text-sm text-slate-300">
                                <p>Hello! I can help you organize your schedule or suggest optimal focus times. How can I help you flow today?</p>
                            </div>

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Ask FloBot..."
                                    className="flex-1 bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
                                />
                                <button className="p-2 bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors text-white">
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="relative">
                    <button
                        onClick={() => setIsMenuOpen(isMenuOpen === 'profile' ? false : 'profile')}
                        className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 border-2 border-slate-900 shadow-lg hover:ring-2 hover:ring-blue-400 transition-all cursor-pointer"
                        title="Open Menu"
                    />

                    {isMenuOpen === 'profile' && (
                        <div className="absolute right-0 top-12 w-48 bg-slate-900 border border-white/10 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                            <button
                                onClick={switchAccount}
                                className="w-full px-4 py-3 flex items-center gap-2 text-sm text-white hover:bg-white/5 transition-colors text-left"
                            >
                                <LogOut className="w-4 h-4" />
                                Switch Account
                            </button>
                            <button
                                onClick={handleLogout}
                                className="w-full px-4 py-3 flex items-center gap-2 text-sm text-red-400 hover:bg-white/5 transition-colors text-left"
                            >
                                <LogOut className="w-4 h-4" />
                                Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};
