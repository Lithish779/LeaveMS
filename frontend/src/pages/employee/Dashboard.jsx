import { useState, useEffect } from 'react';
import api from '../../utils/api';
import LeaveCard from '../../components/LeaveCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Clock, CheckCircle, XCircle, PlusCircle } from 'lucide-react';
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

const EmployeeDashboard = () => {
    const { user } = useAuth();
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchLeaves = async () => {
        try {
            const { data } = await api.get('/leaves/my');
            setLeaves(data.leaves);
        } catch {
            toast.error('Failed to load leaves');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchLeaves(); }, []);

    const handleCancel = async (id) => {
        if (!window.confirm('Cancel this leave request?')) return;
        try {
            await api.delete(`/leaves/${id}`);
            toast.success('Leave cancelled');
            setLeaves(leaves.filter((l) => l._id !== id));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to cancel leave');
        }
    };

    const stats = {
        total: leaves.length,
        pending: leaves.filter((l) => l.status === 'Pending').length,
        approved: leaves.filter((l) => l.status === 'Approved').length,
        rejected: leaves.filter((l) => l.status === 'Rejected').length,
    };

    const recent = leaves.slice(0, 3);

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">
                        Good day, {user?.name?.split(' ')[0]} 👋
                    </h1>
                    <p className="text-slate-400 mt-0.5">{user?.department} · Employee</p>
                </div>
                <Link to="/apply-leave" className="btn-primary flex items-center gap-2">
                    <PlusCircle size={16} /> Apply Leave
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total" value={stats.total} icon={Calendar} color="bg-indigo-600" />
                <StatCard label="Pending" value={stats.pending} icon={Clock} color="bg-amber-600" />
                <StatCard label="Approved" value={stats.approved} icon={CheckCircle} color="bg-emerald-600" />
                <StatCard label="Rejected" value={stats.rejected} icon={XCircle} color="bg-rose-600" />
            </div>

            {/* Recent leaves */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white">Recent Requests</h2>
                    <Link to="/my-leaves" className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors">
                        View all →
                    </Link>
                </div>

                {loading ? (
                    <LoadingSpinner />
                ) : recent.length === 0 ? (
                    <div className="card text-center py-10">
                        <Calendar size={32} className="text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-400">No leave requests yet.</p>
                        <Link to="/apply-leave" className="mt-4 inline-flex btn-primary text-sm">
                            Apply for Leave
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {recent.map((leave) => (
                            <LeaveCard key={leave._id} leave={leave} onCancel={handleCancel} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmployeeDashboard;
