import { useState, useEffect } from 'react';
import api from '../../utils/api';
import reimbursementService from '../../services/reimbursementService';
import LeaveCard from '../../components/LeaveCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Clock, CheckCircle, XCircle, PlusCircle, IndianRupee } from 'lucide-react';
import { Link } from 'react-router-dom';

const StatCard = ({ label, value, color }) => (
    <div className={`p-5 rounded-2xl shadow-sm flex flex-col justify-between h-32 ${color}`}>
        <p className="text-white/80 text-sm font-medium">{label}</p>
        <div className="flex items-end justify-between">
            <p className="text-4xl font-bold text-white">{value}</p>
            <div className="h-10 w-10 bg-white/20 rounded-lg flex items-center justify-center">
                {label.includes('Pending') ? <Clock size={20} className="text-white" /> :
                    label.includes('Approved') ? <CheckCircle size={20} className="text-white" /> :
                        <Calendar size={20} className="text-white" />}
            </div>
        </div>
    </div>
);

const EmployeeDashboard = () => {
    const { user } = useAuth();
    const [leaves, setLeaves] = useState([]);
    const [reimbursements, setReimbursements] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [leaveRes, reimbRes] = await Promise.all([
                api.get('/leaves/my'),
                reimbursementService.getMyReimbursements()
            ]);
            setLeaves(leaveRes.data.leaves);
            setReimbursements(reimbRes.reimbursements);
        } catch {
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

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

    const leaveStats = {
        total: leaves.length,
        pending: leaves.filter((l) => l.status === 'Pending').length,
        approved: leaves.filter((l) => l.status === 'Approved').length,
        rejected: leaves.filter((l) => l.status === 'Rejected').length,
    };

    const reimbStats = {
        total: reimbursements.reduce((sum, r) => sum + r.totalAmount, 0),
        pending: reimbursements
            .filter(r => ['Pending Manager', 'Pending Finance'].includes(r.status))
            .reduce((sum, r) => sum + r.totalAmount, 0),
        paid: reimbursements
            .filter(r => r.status === 'Approved')
            .reduce((sum, r) => sum + r.totalAmount, 0)
    };

    const recent = leaves.slice(0, 3);

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-primary">
                        Employee Dashboard
                    </h1>
                </div>
                <Link to="/apply-leave" className="btn-primary flex items-center gap-2">
                    <PlusCircle size={16} /> Apply Leave
                </Link>
            </div>

            {/* Leave Balances */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {user?.leaveBalances && Object.entries(user.leaveBalances).map(([type, balance]) => (
                    <div key={type} className="bg-card border border-main p-4 rounded-xl">
                        <p className="text-secondary text-xs font-medium uppercase tracking-wider mb-1">{type}</p>
                        <p className="text-xl font-bold text-primary">{balance} <span className="text-xs text-muted font-normal">days</span></p>
                    </div>
                ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard label="Pending Leaves" value={leaveStats.pending} color="bg-stat-1" />
                <StatCard label="Approved Leaves" value={leaveStats.approved} color="bg-stat-2" />
                <StatCard label="Leave Balance" value={user?.leaveBalances?.Annual || 12} color="bg-stat-3" />
            </div>

            {/* Reimbursement Summary - Removed for focus on screenshot match */}


            {/* Recent leaves */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-heading">Recent Requests</h2>
                    <Link to="/my-leaves" className="text-blue-500 hover:underline text-sm transition-colors">
                        View all →
                    </Link>
                </div>

                {loading ? (
                    <LoadingSpinner />
                ) : recent.length === 0 ? (
                    <div className="card text-center py-10">
                        <Calendar size={32} className="text-muted mx-auto mb-3" />
                        <p className="text-secondary">No leave requests yet.</p>
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
