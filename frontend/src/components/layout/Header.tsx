import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
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

            <div className="flex items-center gap-4">
                <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
                    <button className="px-4 py-2 text-sm font-medium rounded-lg bg-white/10 text-white shadow-sm border border-white/5 transition-all">
                        Current Week
                    </button>
                    {/* Filter button was here in incoming, keeping it simple for now or adding back if needed */}
                </div>

                <div className="relative">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 border-2 border-slate-900 shadow-lg hover:ring-2 hover:ring-blue-400 transition-all cursor-pointer"
                        title="Open Menu"
                    />

                    {isMenuOpen && (
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
