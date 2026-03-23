import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';
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

    // I'll refine the 'Sign In' button and the 'Google' button spacing.

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 selection:bg-sky-500/30">
            <div className="login-container">
                {/* Left Column - Image */}
                <div className="login-left">
                    <div className="absolute inset-0 bg-black/10"></div>
                </div>

                {/* Right Column - Form */}
                <div className="login-right">
                    <div className="login-tab-container">
                        <Link to="/login" className="login-tab-active tracking-wide">Sign In</Link>
                        <Link to="/register" className="login-tab-inactive tracking-wide">Sign Up</Link>
                    </div>

                    <form onSubmit={handleSubmit} className="flex-grow flex flex-col">
                        <div className="login-input-group">
                            <label className="login-label">Your email</label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                className="login-input"
                                placeholder="name@company.com"
                                required
                            />
                        </div>

                        <div className="login-input-group">
                            <label className="login-label">Your password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    className="login-input pr-10"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mb-8 text-xs">
                            <label className="flex items-center gap-2 text-slate-400 cursor-pointer group">
                                <input type="checkbox" className="hidden" />
                                <div className="h-4 w-4 rounded-full border border-slate-600 flex items-center justify-center group-hover:border-sky-400 transition-colors">
                                    <div className="h-2 w-2 rounded-full bg-sky-400 opacity-0 group-hover:opacity-40 transition-opacity"></div>
                                </div>
                                Keep me logged in
                            </label>
                            <Link to="/forgot-password" title="Coming soon!" className="text-sky-400 hover:text-sky-300 transition-colors font-semibold">
                                Forgot password?
                            </Link>
                        </div>

                        <div className="space-y-4 mt-auto lg:mt-0">
                            <button type="submit" disabled={loading} className="login-btn">
                                {loading ? (
                                    <span className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                ) : 'Sign In'}
                            </button>

                            <div className="flex items-center gap-4 py-2">
                                <div className="flex-1 h-px bg-slate-800"></div>
                                <span className="text-[10px] text-slate-600 uppercase font-bold tracking-widest">or</span>
                                <div className="flex-1 h-px bg-slate-800"></div>
                            </div>

                            <div className="flex justify-center overflow-hidden rounded-full h-[48px]">
                                <GoogleLogin
                                    onSuccess={async (response) => {
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
                                    }}
                                    onError={() => toast.error('Google Login Failed')}
                                    theme="filled_blue"
                                    shape="pill"
                                    text="signin_with"
                                    width="100%"
                                />
                            </div>
                        </div>
                    </form>

                    <div className="login-footer mt-10 lg:mt-16">
                        <span className="login-footer-link">Privacy</span>
                        <span className="login-footer-link">Terms</span>
                        <span className="login-footer-link">About</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
