import React from 'react';


const Header: React.FC = () => {
    return (
        <header className="flex items-center justify-between px-8 py-5 mb-8">
            <div className="flex items-center gap-3">
                {/* Logo moved to Sidebar, keeping this empty or for breadcrumbs later */}
                <h2 className="text-2xl font-bold text-white tracking-tight">Dashboard</h2>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
                    <button className="px-4 py-2 text-sm font-medium rounded-lg bg-white/10 text-white shadow-sm border border-white/5 transition-all">
                        Current Week
                    </button>
                </div>

                <div className="pl-4 border-l border-white/10">
                    <button className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 border-2 border-slate-900 shadow-lg group-hover:shadow-blue-500/20 transition-all" />
                        <div className="text-left hidden md:block">
                            <p className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">Ricardo</p>
                            <p className="text-xs text-slate-400">Pro Plan</p>
                        </div>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
