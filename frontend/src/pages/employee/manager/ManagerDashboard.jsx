import { useState, useEffect } from 'react';
import api from '../../utils/api';
import LeaveCard from '../../components/LeaveCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Users, Clock, CheckCircle, XCircle, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';

ChartJS.register(ArcElement, Tooltip, Legend);

const StatCard = ({ label, value, icon: Icon, color, bg }) => (
    <div className="card flex items-center gap-4">
        <div className={`h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
            <Icon size={20} className={color} />
        </div>
        <div>
            <p className="text-slate-400 text-sm">{label}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    </div>
);

const ManagerDashboard = () => {
    const [stats, setStats] = useState({ statusStats: [], typeStats: [] });
    const [pending, setPending] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, pendingRes] = await Promise.all([
                    api.get('/leaves/stats'),
                    api.get('/leaves/pending'),
                ]);
                setStats(statsRes.data);
                setPending(pendingRes.data.leaves.slice(0, 3));
            } catch {
                toast.error('Failed to load dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getCount = (arr, key) => arr.find((s) => s._id === key)?.count || 0;
    const totalLeaves = stats.statusStats.reduce((a, b) => a + b.count, 0);

    const chartData = {
        labels: ['Pending', 'Approved', 'Rejected'],
        datasets: [{
            data: [
                getCount(stats.statusStats, 'Pending'),
                getCount(stats.statusStats, 'Approved'),
                getCount(stats.statusStats, 'Rejected'),
            ],
            backgroundColor: ['rgba(245,158,11,0.8)', 'rgba(16,185,129,0.8)', 'rgba(239,68,68,0.8)'],
            borderColor: ['#0f172a'],
            borderWidth: 2,
        }],
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <BarChart3 size={22} className="text-indigo-400" /> Manager Dashboard
                    </h1>
                    <p className="text-slate-400 mt-0.5">Overview of team leave activity</p>
                </div>
                <Link to="/manager/approvals" className="btn-primary flex items-center gap-2">
                    <Clock size={15} /> Review Pending ({getCount(stats.statusStats, 'Pending')})
                </Link>
            </div>

            {loading ? <LoadingSpinner /> : (
                <>
                    {/* Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard label="Total" value={totalLeaves} icon={Users} color="text-white" bg="bg-indigo-600" />
                        <StatCard label="Pending" value={getCount(stats.statusStats, 'Pending')} icon={Clock} color="text-amber-400" bg="bg-amber-500/15" />
                        <StatCard label="Approved" value={getCount(stats.statusStats, 'Approved')} icon={CheckCircle} color="text-emerald-400" bg="bg-emerald-500/15" />
                        <StatCard label="Rejected" value={getCount(stats.statusStats, 'Rejected')} icon={XCircle} color="text-rose-400" bg="bg-rose-500/15" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Chart */}
                        <div className="card">
                            <h3 className="text-slate-300 font-semibold mb-4">Leave Status Breakdown</h3>
                            {totalLeaves > 0 ? (
                                <div className="max-w-[200px] mx-auto">
                                    <Doughnut data={chartData} options={{
                                        plugins: { legend: { labels: { color: '#94a3b8', font: { size: 12 } } } },
                                        cutout: '65%',
                                    }} />
                                </div>
                            ) : (
                                <p className="text-slate-500 text-center py-8">No data yet</p>
                            )}
                        </div>

                        {/* Leave type breakdown */}
                        <div className="card lg:col-span-2">
                            <h3 className="text-slate-300 font-semibold mb-4">Leave Types</h3>
                            <div className="space-y-3">
                                {stats.typeStats.length === 0 ? (
                                    <p className="text-slate-500">No data yet</p>
                                ) : stats.typeStats.map((t) => (
                                    <div key={t._id} className="flex items-center justify-between">
                                        <span className="text-slate-400 text-sm">{t._id}</span>
                                        <div className="flex items-center gap-3">
                                            <div className="w-32 bg-slate-800 rounded-full h-2">
                                                <div
                                                    className="bg-indigo-500 h-2 rounded-full transition-all"
                                                    style={{ width: `${totalLeaves ? (t.count / totalLeaves) * 100 : 0}%` }}
                                                />
                                            </div>
                                            <span className="text-slate-300 text-sm font-medium w-6 text-right">{t.count}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Recent pending */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white">Recent Pending</h3>
                            <Link to="/manager/approvals" className="text-indigo-400 hover:text-indigo-300 text-sm">
                                View all →
                            </Link>
                        </div>
                        {pending.length === 0 ? (
                            <div className="card text-center py-8">
                                <CheckCircle size={28} className="text-emerald-500 mx-auto mb-2" />
                                <p className="text-slate-400">All caught up! No pending requests.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {pending.map((leave) => (
                                    <LeaveCard key={leave._id} leave={leave} showEmployee />
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default ManagerDashboard;
