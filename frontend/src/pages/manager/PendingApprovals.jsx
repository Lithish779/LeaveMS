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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
            <div className="card w-full max-w-md border-main shadow-2xl">
                <h3 className="text-lg font-bold text-heading mb-4">Review Leave Request</h3>

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
                            ? 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                            : 'border-main text-secondary hover:border-slate-400'
                            }`}
                    >
                        <XCircle size={15} /> Reject
                    </button>
                </div>

                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="input-field resize-none mb-4"
                    rows={3}
                    placeholder="Optional comment..."
                />

                <div className="flex gap-3">
                    <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className={`flex-1 font-semibold py-2.5 px-4 rounded-lg transition-all ${status === 'Approved' ? 'btn-success' : 'btn-danger'}`}
                    >
                        {loading ? (
                            <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto block" />
                        ) : `${status} Leave`}
                    </button>
                </div>
            </div>
        </div>
    );
};

const BulkReviewModal = ({ count, onClose, onReview }) => {
    const [status, setStatus] = useState('Approved');
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await onReview(status, comment);
            onClose();
        } catch (err) {
            toast.error('Failed to bulk review');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
            <div className="card w-full max-w-md border-main shadow-2xl">
                <h3 className="text-lg font-bold text-heading mb-2">Bulk Review Requests</h3>
                <p className="text-secondary text-sm mb-4">You are reviewing {count} selected requests.</p>

                <div className="grid grid-cols-2 gap-3 mb-4">
                    <button
                        onClick={() => setStatus('Approved')}
                        className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-semibold transition-all ${status === 'Approved'
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'border-main text-secondary hover:border-slate-400'
                            }`}
                    >
                        <CheckCircle size={15} /> Approve
                    </button>
                    <button
                        onClick={() => setStatus('Rejected')}
                        className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-semibold transition-all ${status === 'Rejected'
                            ? 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                            : 'border-main text-secondary hover:border-slate-400'
                            }`}
                    >
                        <XCircle size={15} /> Reject
                    </button>
                </div>

                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="input-field resize-none mb-4"
                    rows={3}
                    placeholder="Optional bulk comment..."
                />

                <div className="flex gap-3">
                    <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className={`flex-1 font-semibold py-2.5 px-4 rounded-lg transition-all ${status === 'Approved' ? 'btn-success' : 'btn-danger'}`}
                    >
                        {loading ? 'Processing...' : `Confirm Bulk ${status}`}
                    </button>
                </div>
            </div>
        </div>
    );
};

const PendingApprovals = () => {
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedLeave, setSelectedLeave] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [showBulkModal, setShowBulkModal] = useState(false);

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

    useEffect(() => {
        fetch();
    }, []);

    const handleSelect = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleSelectAll = () => {
        if (selectedIds.length === leaves.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(leaves.map(l => l._id));
        }
    };

    const handleBulkReview = async (status, comment) => {
        try {
            await api.put('/leaves/bulk-review', { leaveIds: selectedIds, status, reviewComment: comment });
            toast.success(`Successfully ${status.toLowerCase()}ed ${selectedIds.length} requests`);
            setSelectedIds([]);
            fetch();
        } catch (err) {
            toast.error('Bulk review failed');
        }
    };

    const handleReview = (id) => {
        setLeaves((prev) => prev.filter((l) => l._id !== id));
        setSelectedIds(prev => prev.filter(i => i !== id));
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-heading flex items-center gap-2">
                        <CheckSquare size={22} className="text-blue-500" /> Pending Approvals
                    </h1>
                    <p className="text-secondary mt-0.5">{leaves.length} request{leaves.length !== 1 ? 's' : ''} awaiting review</p>
                </div>

                {leaves.length > 0 && (
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleSelectAll}
                            className="text-xs font-medium text-muted hover:text-primary transition-colors"
                        >
                            {selectedIds.length === leaves.length ? 'Deselect All' : 'Select All'}
                        </button>
                        <button
                            disabled={selectedIds.length === 0}
                            onClick={() => setShowBulkModal(true)}
                            className="btn-primary py-2 px-4 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Bulk Action ({selectedIds.length})
                        </button>
                    </div>
                )}
            </div>

            {loading ? <LoadingSpinner /> : leaves.length === 0 ? (
                <div className="card text-center py-12">
                    <CheckCircle size={40} className="text-emerald-500/40 mx-auto mb-3" />
                    <p className="text-primary font-semibold">All clear!</p>
                    <p className="text-secondary text-sm mt-1">No pending leave requests found.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {leaves.map((leave) => (
                        <div key={leave._id} className={`card hover:border-slate-700 transition-colors duration-200 p-0 overflow-hidden border-l-4 ${selectedIds.includes(leave._id) ? 'border-l-indigo-500 bg-indigo-500/5' : 'border-l-transparent'}`}>
                            <div className="flex items-start">
                                <div className="p-4 pt-6">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(leave._id)}
                                        onChange={() => handleSelect(leave._id)}
                                        className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
                                    />
                                </div>
                                <div className="flex-1">
                                    <div className="p-6 pl-0">
                                        <LeaveCard leave={leave} showEmployee />
                                        <div className="mt-4 flex justify-end border-t border-slate-800/60 pt-3">
                                            <button
                                                onClick={() => setSelectedLeave(leave)}
                                                className="btn-primary text-sm py-1.5 px-4"
                                            >
                                                Review Individually
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
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

            {showBulkModal && (
                <BulkReviewModal
                    count={selectedIds.length}
                    onClose={() => setShowBulkModal(false)}
                    onReview={handleBulkReview}
                />
            )}
        </div>
    );
};

export default PendingApprovals;
