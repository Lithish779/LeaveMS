import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import ChatPanel from '../components/ChatPanel';

const Layout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-slate-950">
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile top bar */}
                <header className="lg:hidden sticky top-0 z-10 flex items-center gap-3 px-4 py-3 bg-slate-900/80 backdrop-blur border-b border-slate-800">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="text-slate-400 hover:text-white p-1.5 rounded-md hover:bg-slate-800 transition-colors"
                        aria-label="Open sidebar"
                    >
                        <Menu size={20} />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                            LM
                        </div>
                        <span className="text-white font-semibold text-sm">LeaveMS</span>
                    </div>
                </header>

                <main className="flex-1 overflow-auto">
                    <Outlet />
                </main>
            </div>

            {/* Global floating chat */}
            <ChatPanel />
        </div>
    );
};

export default Layout;
