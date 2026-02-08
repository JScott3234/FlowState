//import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './components/layout/Header';
import { Dashboard } from './pages/Dashboard';

function App() {
  const location = useLocation();
  const isDashboard = location.pathname === '/';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500/30">
      <div className="max-w-[1600px] mx-auto p-4 flex flex-col h-screen overflow-hidden">
        <Header />

        {isDashboard ? (
          <Dashboard />
        ) : (
          <main className="flex-1 mt-4 overflow-hidden relative glass-panel rounded-2xl">
            <Outlet />
          </main>
        )}
      </div>
    </div>
  );
}

export default App;
