import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import reimbursementService from '../../services/reimbursementService';
import { IndianRupee, Clock, CheckCircle, XCircle, PlusCircle, FileText, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';
import ReceiptPreviewModal from '../../components/ReceiptPreviewModal';

const StatCard = ({ label, value, icon: Icon, color }) => (
    <div className="card flex items-center gap-4">
        <div className={`h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
            <Icon size={20} className="text-white" />
        </div>
        <div>
            <p className="text-secondary text-sm">{label}</p>
            <p className="text-2xl font-bold text-primary">₹{value.toLocaleString()}</p>
        </div>
    </div>
);

const ReimbursementDashboard = () => {
    const [reimbursements, setReimbursements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => {
        fetchReimbursements();
    }, []);

    const fetchReimbursements = async () => {
        try {
            const data = await reimbursementService.getMyReimbursements();
            setReimbursements(data.reimbursements);
        } catch (err) {
            toast.error('Failed to load reimbursements');
        } finally {
            setLoading(false);
        }
    };

    const stats = {
        total: reimbursements.reduce((sum, r) => sum + (parseFloat(r.totalAmount) || 0), 0),
        pending: reimbursements
            .filter(r => ['Pending Manager', 'Pending Finance'].includes(r.status))
            .reduce((sum, r) => sum + (parseFloat(r.totalAmount) || 0), 0),
        paid: reimbursements
            .filter(r => r.status === 'Approved')
            .reduce((sum, r) => sum + (parseFloat(r.totalAmount) || 0), 0)
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Approved': return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20';
            case 'Rejected': return 'bg-rose-500/15 text-rose-400 border-rose-500/20';
            case 'Draft': return 'bg-slate-500/15 text-slate-400 border-slate-500/20';
            default: return 'bg-amber-500/15 text-amber-400 border-amber-500/20';
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-primary">Reimbursements</h1>
                    <p className="text-secondary mt-1">Manage and track your expense claims</p>
                </div>
                <Link to="/reimbursements/new" className="btn-primary flex items-center gap-2">
                    <PlusCircle size={16} /> New Claim
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard label="Total Claimed" value={stats.total} icon={IndianRupee} color="bg-indigo-600" />
                <StatCard label="Pending Payout" value={stats.pending} icon={Clock} color="bg-amber-600" />
                <StatCard label="Total Paid (YTD)" value={stats.paid} icon={CheckCircle} color="bg-emerald-600" />
            </div>

            <div className="card">
                <h2 className="text-lg font-semibold text-white mb-4">Recent Claims</h2>
                {loading ? (
                    <LoadingSpinner />
                ) : reimbursements.length === 0 ? (
                    <div className="text-center py-10">
                        <FileText size={32} className="text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-400">No reimbursement claims yet.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-slate-500 text-sm border-b border-slate-700/50">
                                    <th className="pb-3 pl-2">Title</th>
                                    <th className="pb-3">Date</th>
                                    <th className="pb-3">Items</th>
                                    <th className="pb-3">Amount</th>
                                    <th className="pb-3">Status</th>
                                    <th className="pb-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/30">
                                {reimbursements.map((r) => (
                                    <tr key={r._id} className="group hover:bg-slate-700/20 transition-colors">
                                        <td className="py-4 pl-2">
                                            <p className="text-white font-medium">{r.title}</p>
                                        </td>
                                        <td className="py-4 text-slate-400 text-sm">
                                            {new Date(r.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="py-4 text-slate-400 text-sm">
                                            {r.items.length} item(s)
                                        </td>
                                        <td className="py-4 font-semibold text-white">
                                            ₹{(parseFloat(r.totalAmount) || 0).toLocaleString()}
                                        </td>
                                        <td className="py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(r.status)}`}>
                                                {r.status}
                                            </span>
                                        </td>
                                        <td className="py-4 text-right pr-2">
                                            <div className="flex items-center justify-end gap-2">
                                                {r.status === 'Draft' && (
                                                    <Link
                                                        to={`/reimbursements/edit/${r._id}`}
                                                        className="p-1.5 text-slate-500 hover:text-indigo-400 hover:bg-slate-700/50 rounded-lg transition-all"
                                                        title="Edit Draft"
                                                    >
                                                        <Plus size={16} className="rotate-45" />
                                                    </Link>
                                                )}
                                                {r.items.some(i => i.receiptUrl) && (
                                                    <button
                                                        onClick={() => setPreviewUrl(r.items.find(i => i.receiptUrl).receiptUrl)}
                                                        className="p-1.5 text-slate-500 hover:text-indigo-400 hover:bg-slate-700/50 rounded-lg transition-all"
                                                        title="Quick View Receipt"
                                                    >
                                                        <FileText size={16} />
                                                    </button>
                                                )}
                                                <button className="p-1.5 text-slate-500 hover:text-indigo-400 hover:bg-slate-700/50 rounded-lg transition-all">
                                                    <ChevronRight size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <ReceiptPreviewModal
                isOpen={!!previewUrl}
                url={previewUrl}
                onClose={() => setPreviewUrl(null)}
            />
        </div>
    );
};

export default ReimbursementDashboard;
