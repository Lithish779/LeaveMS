import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import LeaveCard from '../../components/LeaveCard';
import toast from 'react-hot-toast';
import { CheckSquare, Clock, CheckCircle, XCircle, Users, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const StatCard = ({ label, value, icon: Icon, color }) => (
    <div className="card flex items-center gap-4">
        <div className={`h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
            <Icon size={20} className="text-white" />
        </div>
        <div>
            <p className="text-slate-400 text-sm">{label}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    </div>
);

const ManagerDashboard = () => {
    const { user } = useAuth();
    const [pending, setPending] = useState([]);
    const [all, setAll] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [pendingRes, allRes] = await Promise.all([
                    api.get('/leaves/pending'),
                    api.get('/leaves/all'),
                ]);
                setPending(pendingRes.data.leaves);
                setAll(allRes.data.leaves);
            } catch {
                toast.error('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const stats = {
        pending: pending.length,
        approved: all.filter((l) => l.status === 'Approved').length,
        rejected: all.filter((l) => l.status === 'Rejected').length,
        total: all.length,
    };

    const recentPending = pending.slice(0, 3);

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <CheckSquare size={22} className="text-blue-400" />
                        Manager Dashboard
                    </h1>
                    <p className="text-slate-400 mt-0.5">Welcome back, {user?.name}. Here's your team overview.</p>
                </div>
                <Link to="/manager/approvals" className="btn-primary flex items-center gap-2 text-sm">
                    <Clock size={14} />
                    Review Pending ({stats.pending})
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Pending" value={stats.pending} icon={Clock} color="bg-amber-600" />
                <StatCard label="Approved" value={stats.approved} icon={CheckCircle} color="bg-emerald-600" />
                <StatCard label="Rejected" value={stats.rejected} icon={XCircle} color="bg-rose-600" />
                <StatCard label="Total Leaves" value={stats.total} icon={Calendar} color="bg-indigo-600" />
            </div>

            {/* Recent Pending */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white">Awaiting Review</h2>
                    <Link to="/manager/approvals" className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors">
                        View all →
                    </Link>
                </div>

                {loading ? (
                    <LoadingSpinner />
                ) : recentPending.length === 0 ? (
                    <div className="card text-center py-10">
                        <CheckCircle size={32} className="text-emerald-500/40 mx-auto mb-3" />
                        <p className="text-slate-300 font-semibold">All clear!</p>
                        <p className="text-slate-500 text-sm mt-1">No pending leave requests.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {recentPending.map((leave) => (
                            <div key={leave._id} className="card hover:border-slate-700 transition-colors p-0 overflow-hidden">
                                <div className="p-6">
                                    <LeaveCard leave={leave} showEmployee />
                                </div>
                                <div className="px-6 pb-4 flex justify-end border-t border-slate-800/60 pt-3">
                                    <Link to="/manager/approvals" className="btn-primary text-sm py-1.5 px-4">
                                        Review
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManagerDashboard;
