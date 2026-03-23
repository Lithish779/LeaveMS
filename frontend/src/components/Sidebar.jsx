import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { useTheme } from '../context/ThemeContext';
import {
    LayoutDashboard,
    CalendarPlus,
    ClipboardList,
    Users,
    CheckSquare,
    LogOut,
    MessageCircle,
    History,
    IndianRupee,
    FileText,
    Sun,
    Moon,
    X,
} from 'lucide-react';

const ROLE_NAV = {
    employee: [
        { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
        { to: '/chat', label: 'Chat', Icon: MessageCircle, showBadge: true },
        { to: '/apply-leave', label: 'Apply Leave', Icon: CalendarPlus },
        { to: '/my-leaves', label: 'My Leaves', Icon: ClipboardList },
        { to: '/reimbursements', label: 'Expenses', Icon: IndianRupee },
    ],
    manager: [
        { to: '/manager', label: 'Dashboard', Icon: LayoutDashboard },
        { to: '/manager/approvals', label: 'Approvals', Icon: CheckSquare },
        { to: '/approvals/reimbursements', label: 'Expense Approvals', Icon: FileText },
        { to: '/all-expenses', label: 'Expense History', Icon: History },
        { to: '/manager/all-leaves', label: 'All Leaves', Icon: ClipboardList },
    ],
    finance: [
        { to: '/dashboard', label: 'My Dashboard', Icon: LayoutDashboard },
        { to: '/approvals/reimbursements', label: 'Expense Approvals', Icon: FileText },
        { to: '/all-expenses', label: 'Expense History', Icon: History },
        { to: '/chat', label: 'Chat', Icon: MessageCircle, showBadge: true },
    ],
    admin: [
        { to: '/admin', label: 'Dashboard', Icon: LayoutDashboard },
        { to: '/chat', label: 'Chat', Icon: MessageCircle, showBadge: true },
        { to: '/admin/users', label: 'Users', Icon: Users },
        { to: '/admin/leaves', label: 'All Leaves', Icon: CheckSquare },
        { to: '/all-expenses', label: 'Expense History', Icon: History },
    ],
};

const Sidebar = ({ open, onClose }) => {
    const { user, logout } = useAuth();
    const { totalUnread } = useChat();
    const { theme, toggleTheme } = useTheme();
    const navItems = ROLE_NAV[user?.role] || [];

    const handleLogout = () => {
        logout();
    };

    return (
        <>
            {/* Mobile overlay */}
            {open && (
                <div
                    className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar panel */}
            <aside
                className={`
                    fixed inset-y-0 left-0 z-50 w-72 glass-panel border-r border-white/10 flex flex-col
                    transform transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
                    ${open ? 'translate-x-0' : '-translate-x-full'}
                    lg:relative lg:translate-x-0 lg:z-auto
                    custom-scrollbar overflow-y-auto
                `}
            >
                {/* Logo Section */}
                <div className="px-8 py-10 flex items-center justify-between">
                    <div className="flex items-center gap-4 group">
                        <div className="relative">
                            <div className="absolute -inset-1 bg-indigo-500 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
                            <div className="relative h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-black text-xl shadow-2xl shadow-indigo-500/20">
                                LM
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white font-display font-bold text-lg tracking-tight leading-none">LeaveMS</span>
                            <span className="text-indigo-400 font-mono-refined text-[10px] uppercase tracking-widest mt-1">Enterprise UI</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white p-2">
                        <X size={20} />
                    </button>
                </div>

                {/* User Profile Section */}
                <div className="px-6 mb-8">
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 relative group overflow-hidden">
                        <div className="absolute -inset-4 bg-indigo-500/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                        <div className="flex items-center gap-4 relative">
                            {user?.avatar ? (
                                <img src={user.avatar} className="h-11 w-11 rounded-full border border-white/10 ring-4 ring-indigo-500/5" alt="" />
                            ) : (
                                <div className="h-11 w-11 rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 border border-white/10 flex items-center justify-center text-white font-bold text-sm">
                                    {user?.name?.charAt(0)}
                                </div>
                            )}
                            <div className="min-w-0">
                                <p className="text-white font-semibold text-sm truncate tracking-tight">{user?.name}</p>
                                <span className="shimmer-pill mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter bg-indigo-500 text-white shadow-lg shadow-indigo-500/20">
                                    {user?.role === 'employee' ? 'Employee' : user?.role}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 px-4 space-y-1.5 mb-8">
                    {navItems.map(({ to, label, Icon, showBadge }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={to.split('/').length <= 2}
                            onClick={() => { if (onClose) onClose(); }}
                            className={({ isActive }) => `
                                group flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-300
                                ${isActive 
                                    ? 'bg-indigo-500/10 text-white border-l-2 border-indigo-500' 
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'}
                            `}
                        >
                            <div className="flex items-center gap-4">
                                <Icon size={18} className="group-hover:scale-110 transition-transform duration-300" />
                                <span className="font-display font-medium text-sm antialiased">{label}</span>
                            </div>
                            {showBadge && totalUnread > 0 && (
                                <div className="h-5 min-w-5 px-1 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg shadow-rose-500/40">
                                    {totalUnread > 9 ? '9+' : totalUnread}
                                </div>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Bottom Footer Section */}
                <div className="p-6 mt-auto border-t border-white/5 space-y-3">
                    <button
                        onClick={toggleTheme}
                        className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-white/[0.03] border border-white/5 text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all font-display text-xs font-semibold"
                    >
                        {theme === 'light' ? <><Moon size={14} /> Dark View</> : <><Sun size={14} /> Light View</>}
                    </button>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-rose-500/5 border border-rose-500/10 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all font-display text-xs font-semibold uppercase tracking-widest"
                    >
                        <LogOut size={14} /> Sign Out
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
