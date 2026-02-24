import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { UserPlus } from 'lucide-react';

const ROLES = [
    { value: 'employee', label: 'Employee', color: 'border-emerald-500 bg-emerald-500/10 text-emerald-300' },
    { value: 'manager', label: 'Manager', color: 'border-blue-500 bg-blue-500/10 text-blue-300' },
    { value: 'admin', label: 'Admin', color: 'border-purple-500 bg-purple-500/10 text-purple-300' },
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
        <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-8">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/40 via-slate-950 to-slate-950 pointer-events-none" />

            <div className="relative w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-indigo-600 mb-4">
                        <span className="text-white font-bold text-xl">LM</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-1">Create account</h1>
                    <p className="text-slate-400">Join LeaveMS today</p>
                </div>

                <div className="card border-slate-700/50">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-slate-300 text-sm font-medium mb-2">Full Name</label>
                            <input
                                type="text" name="name" value={form.name}
                                onChange={handleChange} className="input-field"
                                placeholder="John Doe" required
                            />
                        </div>

                        <div>
                            <label className="block text-slate-300 text-sm font-medium mb-2">Email</label>
                            <input
                                type="email" name="email" value={form.email}
                                onChange={handleChange} className="input-field"
                                placeholder="you@company.com" required
                            />
                        </div>

                        <div>
                            <label className="block text-slate-300 text-sm font-medium mb-2">Department</label>
                            <input
                                type="text" name="department" value={form.department}
                                onChange={handleChange} className="input-field"
                                placeholder="Engineering, HR, Finance..."
                            />
                        </div>

                        <div>
                            <label className="block text-slate-300 text-sm font-medium mb-2">Password</label>
                            <input
                                type="password" name="password" value={form.password}
                                onChange={handleChange} className="input-field"
                                placeholder="Min. 6 characters" required
                            />
                        </div>

                        {/* Role selector */}
                        <div>
                            <label className="block text-slate-300 text-sm font-medium mb-2">Role</label>
                            <div className="grid grid-cols-3 gap-2">
                                {ROLES.map(({ value, label, color }) => (
                                    <button
                                        key={value} type="button"
                                        onClick={() => setForm({ ...form, role: value })}
                                        className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all duration-200 ${form.role === value ? color : 'border-slate-700 text-slate-400 hover:border-slate-600'
                                            }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit" disabled={loading}
                            className="btn-primary w-full flex items-center justify-center gap-2 mt-1"
                        >
                            {loading ? (
                                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <UserPlus size={16} />
                            )}
                            {loading ? 'Creating...' : 'Create Account'}
                        </button>
                    </form>

                    <p className="mt-5 text-center text-slate-400 text-sm">
                        Already have an account?{' '}
                        <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
