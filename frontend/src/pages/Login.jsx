import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.post('/auth/login', form);
            login(data);
            toast.success(`Welcome back, ${data.user.name}!`);
            const dashMap = { admin: '/admin', manager: '/manager', employee: '/dashboard' };
            navigate(dashMap[data.user.role] || '/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (response) => {
        setLoading(true);
        try {
            const { data } = await api.post('/auth/google', { idToken: response.credential });
            login(data);
            toast.success(`Welcome back, ${data.user.name}!`);
            const dashMap = { admin: '/admin', manager: '/manager', employee: '/dashboard' };
            navigate(dashMap[data.user.role] || '/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Google Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/40 via-slate-950 to-slate-950 pointer-events-none" />

            <div className="relative w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-indigo-600 mb-4">
                        <span className="text-white font-bold text-xl">LM</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-1">Welcome back</h1>
                    <p className="text-slate-400">Sign in to LeaveMS</p>
                </div>

                <div className="card border-slate-700/50 backdrop-blur-sm">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-slate-300 text-sm font-medium mb-2">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="you@company.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-slate-300 text-sm font-medium mb-2">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    className="input-field pr-11"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                            {loading ? (
                                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <LogIn size={16} />
                            )}
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="my-6 flex items-center">
                        <div className="flex-1 border-t border-slate-700"></div>
                        <span className="px-3 text-slate-500 text-sm uppercase tracking-wider">or</span>
                        <div className="flex-1 border-t border-slate-700"></div>
                    </div>

                    <div className="flex justify-center">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => toast.error('Google Login Failed')}
                            theme="filled_black"
                            width="250"
                        />
                    </div>

                    <p className="mt-5 text-center text-slate-400 text-sm">
                        No account?{' '}
                        <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                            Register here
                        </Link>
                    </p>
                </div>

                {/* Demo credentials hint */}
                <div className="mt-4 p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-center">
                    <p className="text-slate-500 text-xs">
                        Register as <span className="text-indigo-400">admin</span>,{' '}
                        <span className="text-blue-400">manager</span>, or{' '}
                        <span className="text-emerald-400">employee</span> to explore each role
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
