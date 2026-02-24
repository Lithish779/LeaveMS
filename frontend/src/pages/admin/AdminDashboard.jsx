import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS, ArcElement, Tooltip, Legend,
    BarElement, CategoryScale, LinearScale,
} from 'chart.js';
import { Users, Calendar, Clock, CheckCircle, XCircle, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const StatCard = ({ label, value, icon: Icon, bg, text }) => (
    <div className="card flex items-center gap-4">
        <div className={`h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
            <Icon size={20} className={text} />
        </div>
        <div>
            <p className="text-slate-400 text-sm">{label}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    </div>
);

const AdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ statusStats: [], typeStats: [] });
    const [userCount, setUserCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, usersRes] = await Promise.all([
                    api.get('/leaves/stats'),
                    api.get('/users'),
                ]);
                setStats(statsRes.data);
                setUserCount(usersRes.data.users.length);
            } catch {
                toast.error('Failed to load admin dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getCount = (arr, key) => arr.find((s) => s._id === key)?.count || 0;
    const totalLeaves = stats.statusStats.reduce((a, b) => a + b.count, 0);

    const doughnutData = {
        labels: ['Pending', 'Approved', 'Rejected'],
        datasets: [{
            data: [getCount(stats.statusStats, 'Pending'), getCount(stats.statusStats, 'Approved'), getCount(stats.statusStats, 'Rejected')],
            backgroundColor: ['rgba(245,158,11,0.8)', 'rgba(16,185,129,0.8)', 'rgba(239,68,68,0.8)'],
            borderColor: ['#0f172a'], borderWidth: 2,
        }],
    };

    const barData = {
        labels: stats.typeStats.map((t) => t._id),
        datasets: [{
            label: 'Requests',
            data: stats.typeStats.map((t) => t.count),
            backgroundColor: ['rgba(99,102,241,0.7)', 'rgba(16,185,129,0.7)', 'rgba(139,92,246,0.7)', 'rgba(100,116,139,0.7)'],
            borderRadius: 6,
        }],
    };

    const barOptions = {
        plugins: { legend: { display: false } },
        scales: {
            x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(148,163,184,0.1)' } },
            y: { ticks: { color: '#94a3b8', stepSize: 1 }, grid: { color: 'rgba(148,163,184,0.1)' } },
        },
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Shield size={22} className="text-purple-400" /> Admin Dashboard
                    </h1>
                    <p className="text-slate-400 mt-0.5">Welcome back, {user?.name}. System overview.</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Link to="/admin/users" className="btn-secondary text-sm flex items-center gap-2">
                        <Users size={14} /> Manage Users
                    </Link>
                    <Link to="/admin/approvals" className="btn-primary text-sm flex items-center gap-2">
                        <Clock size={14} /> Pending ({getCount(stats.statusStats, 'Pending')})
                    </Link>
                </div>
            </div>

            {loading ? <LoadingSpinner /> : (
                <>
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                        <StatCard label="Total Users" value={userCount} icon={Users} bg="bg-indigo-600" text="text-white" />
                        <StatCard label="Total Leaves" value={totalLeaves} icon={Calendar} bg="bg-slate-700" text="text-white" />
                        <StatCard label="Pending" value={getCount(stats.statusStats, 'Pending')} icon={Clock} bg="bg-amber-500/15" text="text-amber-400" />
                        <StatCard label="Approved" value={getCount(stats.statusStats, 'Approved')} icon={CheckCircle} bg="bg-emerald-500/15" text="text-emerald-400" />
                        <StatCard label="Rejected" value={getCount(stats.statusStats, 'Rejected')} icon={XCircle} bg="bg-rose-500/15" text="text-rose-400" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="card">
                            <h3 className="text-slate-300 font-semibold mb-4">Leave Status Overview</h3>
                            {totalLeaves > 0 ? (
                                <div className="max-w-[220px] mx-auto">
                                    <Doughnut data={doughnutData} options={{
                                        plugins: { legend: { labels: { color: '#94a3b8', font: { size: 12 } } } },
                                        cutout: '60%',
                                    }} />
                                </div>
                            ) : <p className="text-slate-500 text-center py-8">No leave data yet</p>}
                        </div>

                        <div className="card">
                            <h3 className="text-slate-300 font-semibold mb-4">Requests by Leave Type</h3>
                            {stats.typeStats.length > 0 ? (
                                <Bar data={barData} options={barOptions} />
                            ) : <p className="text-slate-500 text-center py-8">No leave data yet</p>}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminDashboard;
