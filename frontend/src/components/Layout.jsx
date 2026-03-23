import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import ChatPanel from '../components/ChatPanel';

const Layout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-[#0A0B0F] text-[#F0F0F5] selection:bg-indigo-500/30">
            {/* Background Texture Overlay */}
            <div className="fixed inset-0 bg-dot-matrix pointer-events-none opacity-40"></div>
            
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex-1 flex flex-col min-w-0 relative z-10">
                {/* Mobile top bar */}
                <header className="lg:hidden sticky top-0 z-20 flex items-center gap-4 px-6 py-4 bg-[#0A0B0F]/80 backdrop-blur-xl border-b border-white/5">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-all"
                        aria-label="Open sidebar"
                    >
                        <Menu size={22} />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-indigo-600/20">
                            LM
                        </div>
                        <span className="text-white font-display font-bold text-base tracking-tight">LeaveMS</span>
                    </div>
                </header>

                <main className="flex-1 overflow-x-hidden custom-scrollbar">
                    <div className="max-w-[1600px] mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>

            {/* Global floating chat */}
            <ChatPanel />
        </div>
    );
};

export default Layout;
