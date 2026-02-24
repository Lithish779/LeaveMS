import { useState, useEffect } from 'react';
import reimbursementService from '../../services/reimbursementService';
import { Check, X, FileText, User as UserIcon, Calendar, IndianRupee, MessageSquare, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';
import ReceiptPreviewModal from '../../components/ReceiptPreviewModal';

const ApprovalDashboard = () => {
    const [pending, setPending] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedClaim, setSelectedClaim] = useState(null);
    const [reviewComment, setReviewComment] = useState('');
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => {
        fetchPending();
    }, []);

    const fetchPending = async () => {
        try {
            const data = await reimbursementService.getPending();
            setPending(data.reimbursements);
        } catch (err) {
            toast.error('Failed to load pending reimbursements');
        } finally {
            setLoading(false);
        }
    };

    const handleReview = async (id, approved) => {
        try {
            await reimbursementService.review(id, { approved, comment: reviewComment });
            toast.success(approved ? 'Claim approved' : 'Claim rejected');
            setPending(pending.filter(p => p._id !== id));
            setSelectedClaim(null);
            setReviewComment('');
        } catch (err) {
            toast.error('Failed to submit review');
        }
    };

    return (
        <div className="p-6 h-[calc(100vh-64px)] flex flex-col">
            <div className="mb-6 flex-shrink-0">
                <h1 className="text-2xl font-bold text-primary">Reimbursement Approvals</h1>
                <p className="text-secondary mt-1">Review and approve employee expense claims</p>
            </div>

            <div className="flex gap-6 overflow-hidden flex-1">
                {/* List Portion */}
                <div className="w-1/3 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                    {loading ? (
                        <LoadingSpinner />
                    ) : pending.length === 0 ? (
                        <div className="card text-center py-10 opacity-60 italic text-muted">
                            No pending claims found.
                        </div>
                    ) : (
                        pending.map((r) => (
                            <div
                                key={r._id}
                                onClick={() => setSelectedClaim(r)}
                                className={`card cursor-pointer transition-all duration-200 border-l-4 ${selectedClaim?._id === r._id ? 'border-primary bg-primary/5' : 'border-transparent hover:border-main'}`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-primary font-semibold text-sm line-clamp-1">{r.title}</h3>
                                    <span className="text-xs font-bold text-blue-500">₹{r.totalAmount.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-muted uppercase tracking-wider">
                                    <UserIcon size={10} />
                                    <span>{r.employee?.name}</span>
                                    <span>•</span>
                                    <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Detail Portion */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {selectedClaim ? (
                        <div className="card h-full flex flex-col p-8">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="badge-pending">
                                            {selectedClaim.status}
                                        </span>
                                        <h2 className="text-2xl font-bold text-primary">{selectedClaim.title}</h2>
                                    </div>
                                    <div className="flex items-center gap-4 text-secondary text-sm">
                                        <div className="flex items-center gap-1.5"><UserIcon size={14} />{selectedClaim.employee?.name}</div>
                                        <div className="flex items-center gap-1.5"><Calendar size={14} />{new Date(selectedClaim.createdAt).toLocaleDateString()}</div>
                                        <div className="flex items-center gap-1.5"><FileText size={14} />{selectedClaim.items.length} Items</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-muted text-xs uppercase tracking-wider font-bold mb-1">Total Amount</p>
                                    <p className="text-3xl font-bold text-primary">₹{selectedClaim.totalAmount.toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto mb-8 pr-4">
                                <h3 className="text-primary font-semibold mb-4 flex items-center gap-2">
                                    <FileText size={18} className="text-blue-500" />
                                    Claim Items
                                </h3>
                                <div className="space-y-3">
                                    {selectedClaim.items.map((item, idx) => (
                                        <div key={idx} className="bg-main border border-main p-4 rounded-xl flex items-center justify-between">
                                            <div>
                                                <p className="text-primary font-medium text-sm">{item.title}</p>
                                                <div className="flex gap-3 text-xs text-secondary mt-1">
                                                    <span>{item.category}</span>
                                                    <span>•</span>
                                                    <span>{new Date(item.date).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <p className="text-primary font-semibold">₹{item.amount.toLocaleString()}</p>
                                                {item.receiptUrl && (
                                                    <button
                                                        onClick={() => setPreviewUrl(item.receiptUrl)}
                                                        className="h-8 w-8 rounded-lg bg-card border border-main flex items-center justify-center text-secondary hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                    >
                                                        <FileText size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex-shrink-0 pt-6 border-t border-slate-700/50">
                                <div className="mb-4">
                                    <label className="block text-slate-400 text-sm mb-2 flex items-center gap-2">
                                        <MessageSquare size={14} /> Review Comment (optional)
                                    </label>
                                    <textarea
                                        value={reviewComment}
                                        onChange={(e) => setReviewComment(e.target.value)}
                                        className="input-field py-2 text-sm"
                                        placeholder="Add a reason for approval or rejection..."
                                        rows={2}
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => handleReview(selectedClaim._id, false)}
                                        className="flex-1 py-3 px-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 font-bold flex items-center justify-center gap-2 hover:bg-rose-500 hover:text-white transition-all"
                                    >
                                        <X size={18} /> Reject Claim
                                    </button>
                                    <button
                                        onClick={() => handleReview(selectedClaim._id, true)}
                                        className="flex-1 py-3 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center gap-2 hover:bg-emerald-500 hover:text-white transition-all shadow-lg shadow-emerald-500/10"
                                    >
                                        <Check size={18} /> Approve Claim
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="card h-full flex flex-col items-center justify-center opacity-40">
                            <FileText size={48} className="text-muted mb-4" />
                            <p className="text-secondary font-medium">Select a claim from the left to review details</p>
                        </div>
                    )}
                </div>
            </div>

            <ReceiptPreviewModal
                isOpen={!!previewUrl}
                url={previewUrl}
                onClose={() => setPreviewUrl(null)}
            />
        </div>
    );
};

export default ApprovalDashboard;
