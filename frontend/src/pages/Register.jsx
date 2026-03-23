import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { UserPlus } from 'lucide-react';

const ROLES = [
    { value: 'employee', label: 'Employee', activeStyle: 'border-sky-500 bg-sky-500/10 text-sky-400' },
    { value: 'manager', label: 'Manager', activeStyle: 'border-blue-500 bg-blue-500/10 text-blue-400' },
    { value: 'admin', label: 'Admin', activeStyle: 'border-purple-500 bg-purple-500/10 text-purple-400' },
];

const Register = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: '', email: '', password: '', role: 'employee', department: '',
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        setLoading(true);
        try {
            const { data } = await api.post('/auth/register', form);
            login(data);
            toast.success(`Account created! Welcome, ${data.user.name}!`);
            const dashMap = { admin: '/admin', manager: '/manager', employee: '/dashboard' };
            navigate(dashMap[data.user.role] || '/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
            <div className="login-container">
                {/* Left Column - Image */}
                <div className="login-left">
                    <div className="absolute inset-0 bg-black/10"></div>
                </div>

                {/* Right Column - Form */}
                <div className="login-right">
                    <div className="login-tab-container">
                        <Link to="/login" className="login-tab-inactive tracking-wide">Sign In</Link>
                        <Link to="/register" className="login-tab-active tracking-wide">Sign Up</Link>
                    </div>

                    <form onSubmit={handleSubmit} className="flex-grow space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="login-input-group !mb-0">
                                <label className="login-label">Full Name</label>
                                <input
                                    type="text" name="name" value={form.name}
                                    onChange={handleChange} className="login-input"
                                    placeholder="John Doe" required
                                />
                            </div>

                            <div className="login-input-group !mb-0">
                                <label className="login-label">Email</label>
                                <input
                                    type="email" name="email" value={form.email}
                                    onChange={handleChange} className="login-input"
                                    placeholder="you@company.com" required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="login-input-group !mb-0">
                                <label className="login-label">Department</label>
                                <input
                                    type="text" name="department" value={form.department}
                                    onChange={handleChange} className="login-input"
                                    placeholder="Engineering, HR..."
                                />
                            </div>

                            <div className="login-input-group !mb-0">
                                <label className="login-label">Password</label>
                                <input
                                    type="password" name="password" value={form.password}
                                    onChange={handleChange} className="login-input"
                                    placeholder="••••••••" required
                                />
                            </div>
                        </div>

                        {/* Role selector */}
                        <div className="mb-8">
                            <label className="login-label">Select Your Role</label>
                            <div className="grid grid-cols-3 gap-3 pt-2">
                                {ROLES.map(({ value, label, activeStyle }) => (
                                    <button
                                        key={value} type="button"
                                        onClick={() => setForm({ ...form, role: value })}
                                        className={`py-2 px-3 rounded-xl border text-xs font-bold uppercase tracking-widest transition-all duration-300 ${form.role === value
                                                ? activeStyle
                                                : 'border-slate-700 text-slate-500 hover:border-slate-600 hover:text-slate-400'
                                            }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit" disabled={loading}
                            className="login-btn mt-4"
                        >
                            {loading ? (
                                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <UserPlus size={16} />
                            )}
                            {loading ? 'Processing...' : 'Create Account'}
                        </button>
                    </form>

                    <div className="login-footer mt-10">
                        <span className="login-footer-link">Privacy</span>
                        <span className="login-footer-link">Terms</span>
                        <span className="login-footer-link">About</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
