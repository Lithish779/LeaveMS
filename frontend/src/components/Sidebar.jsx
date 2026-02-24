import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import {
    LayoutDashboard,
    CalendarPlus,
    ClipboardList,
    Users,
    CheckSquare,
    LogOut,
    BarChart3,
    X,
    MessageCircle,
} from 'lucide-react';

const ROLE_NAV = {
    employee: [
        { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
        { to: '/chat', label: 'Chat', Icon: MessageCircle, showBadge: true },
        { to: '/apply-leave', label: 'Apply Leave', Icon: CalendarPlus },
        { to: '/my-leaves', label: 'My Leaves', Icon: ClipboardList },
    ],
    manager: [
        { to: '/manager', label: 'Dashboard', Icon: LayoutDashboard },
        { to: '/manager/approvals', label: 'Approvals', Icon: CheckSquare },
        { to: '/manager/all-leaves', label: 'All Leaves', Icon: ClipboardList },
    ],
    admin: [
        { to: '/admin', label: 'Dashboard', Icon: LayoutDashboard },
        { to: '/chat', label: 'Chat', Icon: MessageCircle, showBadge: true },
        { to: '/admin/users', label: 'Users', Icon: Users },
        { to: '/admin/leaves', label: 'All Leaves', Icon: BarChart3 },
        { to: '/admin/approvals', label: 'Approvals', Icon: CheckSquare },
    ],
};

const ROLE_COLORS = {
    admin: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    manager: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    employee: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
};

const Sidebar = ({ open, onClose }) => {
    const { user, logout } = useAuth();
    const { totalUnread } = useChat();
    const navigate = useNavigate();
    const navItems = ROLE_NAV[user?.role] || [];

    const handleLogout = () => {
        logout();
        // navigate('/login');
    };

    const handleNavClick = () => {
        // Close sidebar on mobile after navigating
        if (onClose) onClose();
    };

    return (
        <>
            {/* Mobile overlay */}
            {open && (
                <div
                    className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar panel */}
            <aside
                className={`
                    fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 border-r border-slate-800 flex flex-col
                    transform transition-transform duration-300 ease-in-out
                    ${open ? 'translate-x-0' : '-translate-x-full'}
                    lg:relative lg:translate-x-0 lg:z-auto
                `}
            >
                {/* Logo */}
                <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            LM
                        </div>
                        <div>
                            <p className="text-white font-bold text-sm leading-tight">LeaveMS</p>
                            <p className="text-slate-500 text-xs">Management System</p>
                        </div>
                    </div>
                    {/* Close button – mobile only */}
                    <button
                        onClick={onClose}
                        className="lg:hidden text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
                        aria-label="Close sidebar"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* User info */}
                <div className="px-4 py-4 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="text-slate-100 font-medium text-sm truncate">{user?.name}</p>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${ROLE_COLORS[user?.role]}`}>
                                {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Nav links */}
                <nav className="flex-1 px-3 py-4 space-y-1">
                    {navItems.map(({ to, label, Icon, showBadge }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={to.split('/').length <= 2}
                            onClick={handleNavClick}
                            className={({ isActive }) =>
                                `sidebar-link ${isActive ? 'sidebar-link-active' : ''} flex items-center justify-between group`
                            }
                        >
                            <div className="flex items-center gap-3">
                                <Icon size={16} />
                                {label}
                            </div>
                            {showBadge && totalUnread > 0 && (
                                <span className="h-5 w-5 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-indigo-500 group-hover:border-indigo-400 transition-colors">
                                    {totalUnread > 9 ? '9+' : totalUnread}
                                </span>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Logout */}
                <div className="p-3 border-t border-slate-800">
                    <button
                        onClick={handleLogout}
                        className="sidebar-link w-full text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                    >
                        <LogOut size={16} />
                        Logout
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
