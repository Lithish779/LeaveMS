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
    BarChart3,
    X,
    MessageCircle,
    CalendarDays, // Added
    History,      // Added
    IndianRupee,  // Added
    FileText,    // Added
    Sun,
    Moon,
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
        { to: '/manager/calendar', label: 'Team Calendar', Icon: CalendarDays },
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
        { to: '/admin/leaves', label: 'All Leaves', Icon: BarChart3 },
        { to: '/admin/approvals', label: 'Approvals', Icon: CheckSquare },
        { to: '/approvals/reimbursements', label: 'Expense Approvals', Icon: FileText },
        { to: '/all-expenses', label: 'Expense History', Icon: History },
        { to: '/admin/audit-logs', label: 'Audit Trails', Icon: History },
    ],
};

const ROLE_COLORS = {
    admin: 'from-purple-500 to-indigo-600',
    manager: 'from-blue-500 to-indigo-600',
    finance: 'from-amber-500 to-orange-600',
    employee: 'from-emerald-500 to-teal-600',
};

const Sidebar = ({ open, onClose }) => {
    const { user, logout } = useAuth();
    const { totalUnread } = useChat();
    const { theme, toggleTheme } = useTheme();
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
                    fixed inset-y-0 left-0 z-30 w-64 bg-sidebar border-r border-main flex flex-col
                    transform transition-transform duration-300 ease-in-out
                    ${open ? 'translate-x-0' : '-translate-x-full'}
                    lg:relative lg:translate-x-0 lg:z-auto
                `}
            >
                {/* Logo */}
                <div className="px-6 py-5 border-b border-main flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-accent-primary flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            LM
                        </div>
                        <div>
                            <p className="text-heading font-bold text-sm leading-tight">LeaveMS</p>
                            <p className="text-muted text-xs font-medium">Management System</p>
                        </div>
                    </div>
                    {/* Close button – mobile only */}
                    <button
                        onClick={onClose}
                        className="lg:hidden text-muted hover:text-heading p-1 rounded-md hover:bg-main transition-colors"
                        aria-label="Close sidebar"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* User info */}
                <div className="px-4 py-4 border-b border-main">
                    <div className="flex items-center gap-3">
                        {user?.avatar ? (
                            <img
                                src={user.avatar}
                                alt={user.name}
                                className="h-9 w-9 rounded-full object-cover border border-main"
                            />
                        ) : (
                            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className="min-w-0">
                            <p className="text-primary font-medium text-sm truncate">{user?.name}</p>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${ROLE_COLORS[user?.role]}`}>
                                {user?.role}
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

                {/* Theme Toggle & Logout */}
                <div className="p-3 border-t border-main space-y-1">
                    <button
                        onClick={toggleTheme}
                        className="sidebar-link w-full text-muted hover:text-heading group"
                    >
                        <div className="flex items-center gap-3">
                            {theme === 'light' ? (
                                <>
                                    <Moon size={16} /> Dark Mode
                                </>
                            ) : (
                                <>
                                    <Sun size={16} /> Light Mode
                                </>
                            )}
                        </div>
                    </button>
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
