import { useState, useEffect } from 'react';
import api from '../../utils/api';
import LeaveCard from '../../components/LeaveCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { CheckSquare, CheckCircle, XCircle } from 'lucide-react';

const ReviewModal = ({ leave, onClose, onReview }) => {
    const [status, setStatus] = useState('Approved');
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await api.put(`/leaves/${leave._id}/review`, { status, reviewComment: comment });
            toast.success(`Leave ${status.toLowerCase()} successfully`);
            onReview(leave._id);
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to review');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="card w-full max-w-md border-main">
                <h3 className="text-lg font-bold text-primary mb-4">Review Leave Request</h3>
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <button
                        onClick={() => setStatus('Approved')}
                        className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-semibold transition-all ${status === 'Approved'
                            ? 'border-emerald-500 bg-emerald-500/15 text-emerald-400'
                            : 'border-slate-700 text-slate-400 hover:border-slate-600'
                            }`}
                    >
                        <CheckCircle size={15} /> Approve
                    </button>
                    <button
                        onClick={() => setStatus('Rejected')}
                        className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-semibold transition-all ${status === 'Rejected'
                            ? 'border-rose-500 bg-rose-500/15 text-rose-400'
                            : 'border-slate-700 text-slate-400 hover:border-slate-600'
                            }`}
                    >
                        <XCircle size={15} /> Reject
                    </button>
                </div>
                <textarea
                    value={comment} onChange={(e) => setComment(e.target.value)}
                    className="input-field resize-none mb-4" rows={3}
                    placeholder="Optional comment..."
                />
                <div className="flex gap-3">
                    <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
                    <button
                        onClick={handleSubmit} disabled={loading}
                        className={`flex-1 font-semibold py-2.5 px-4 rounded-lg transition-all ${status === 'Approved' ? 'btn-success' : 'btn-danger'
                            }`}
                    >
                        {loading
                            ? <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto block" />
                            : `${status} Leave`}
                    </button>
                </div>
            </div>
        </div>
    );
};

const AdminApprovals = () => {
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedLeave, setSelectedLeave] = useState(null);

    useEffect(() => {
        const fetch = async () => {
            try {
                const { data } = await api.get('/leaves/pending');
                setLeaves(data.leaves);
            } catch {
                toast.error('Failed to load pending leaves');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    const handleReview = (id) => {
        setLeaves((prev) => prev.filter((l) => l._id !== id));
    };

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
                    <CheckSquare size={22} className="text-blue-500" /> Pending Approvals
                </h1>
                <p className="text-secondary mt-0.5">{leaves.length} request{leaves.length !== 1 ? 's' : ''} awaiting review</p>
            </div>

            {loading ? <LoadingSpinner /> : leaves.length === 0 ? (
                <div className="card text-center py-12">
                    <CheckCircle size={40} className="text-emerald-500/40 mx-auto mb-3" />
                    <p className="text-slate-300 font-semibold">All clear!</p>
                    <p className="text-slate-500 text-sm mt-1">No pending leave requests.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {leaves.map((leave) => (
                        <div key={leave._id} className="relative">
                            <LeaveCard leave={leave} showEmployee />
                            <button
                                onClick={() => setSelectedLeave(leave)}
                                className="absolute top-4 right-4 btn-primary text-sm py-1.5 px-3"
                            >
                                Review
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {selectedLeave && (
                <ReviewModal
                    leave={selectedLeave}
                    onClose={() => setSelectedLeave(null)}
                    onReview={handleReview}
                />
            )}
        </div>
    );
};

export default AdminApprovals;
