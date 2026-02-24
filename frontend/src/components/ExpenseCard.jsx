import { Calendar, Clock, Paperclip, ExternalLink, IndianRupee, History, User } from 'lucide-react';
import StatusBadge from './StatusBadge';

const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const ExpenseCard = ({ reimbursement, onPreviewReceipt }) => {
    return (
        <div className="card hover:border-slate-700 transition-colors duration-200">
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                            <User size={16} />
                        </div>
                        <div>
                            <p className="text-primary font-semibold text-sm">{reimbursement.employee?.name}</p>
                            <p className="text-muted text-[10px] uppercase tracking-wider font-bold">{reimbursement.employee?.department}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap mb-4">
                        <h3 className="text-primary font-bold">{reimbursement.title}</h3>
                        <StatusBadge status={reimbursement.status} />
                        <span className="text-muted text-xs">
                            {reimbursement.items?.length || 0} item(s)
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-3 text-secondary text-sm">
                            <div className="p-2 rounded-lg bg-main border border-main">
                                <IndianRupee size={16} className="text-emerald-500" />
                            </div>
                            <div>
                                <p className="text-[10px] text-muted uppercase font-bold">Total Amount</p>
                                <p className="text-primary font-bold">₹{((reimbursement.totalAmount || 0)).toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-secondary text-sm">
                            <div className="p-2 rounded-lg bg-main border border-main">
                                <Calendar size={16} className="text-sky-500" />
                            </div>
                            <div>
                                <p className="text-[10px] text-muted uppercase font-bold">Claim Date</p>
                                <p className="text-primary font-bold">{formatDate(reimbursement.createdAt)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Receipt Section */}
                    {reimbursement.items?.some(i => i.receiptUrl) && (
                        <div className="flex items-center gap-2 mb-4">
                            <button
                                onClick={() => onPreviewReceipt(reimbursement.items.find(i => i.receiptUrl).receiptUrl)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-main border border-main hover:border-indigo-500/50 transition-colors group"
                            >
                                <Paperclip size={14} className="text-muted group-hover:text-indigo-500 dark:group-hover:text-indigo-400" />
                                <span className="text-xs font-medium text-secondary group-hover:text-primary">View Receipt</span>
                                <ExternalLink size={10} className="text-muted" />
                            </button>
                        </div>
                    )}

                    {/* Approval History */}
                    <div className="space-y-2 pt-4 border-t border-slate-800/50">
                        {reimbursement.managerApproval?.approved !== null && (
                            <div className="flex items-start gap-3">
                                <div className={`mt-1 h-2 w-2 rounded-full ${reimbursement.managerApproval.approved ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                <div>
                                    <p className="text-xs text-primary font-medium">
                                        Manager {reimbursement.managerApproval.approved ? 'Approved' : 'Rejected'}
                                        <span className="text-muted text-[10px] ml-2">by {reimbursement.managerApproval.approvedBy?.name}</span>
                                    </p>
                                    {reimbursement.managerApproval.comment && (
                                        <p className="text-secondary text-[11px] mt-0.5 italic">"{reimbursement.managerApproval.comment}"</p>
                                    )}
                                </div>
                            </div>
                        )}
                        {reimbursement.financeApproval?.approved !== null && (
                            <div className="flex items-start gap-3">
                                <div className={`mt-1 h-2 w-2 rounded-full ${reimbursement.financeApproval.approved ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                <div>
                                    <p className="text-xs text-white font-medium">
                                        Finance {reimbursement.financeApproval.approved ? 'Approved' : 'Rejected'}
                                        <span className="text-slate-500 text-[10px] ml-2">by {reimbursement.financeApproval.approvedBy?.name}</span>
                                    </p>
                                    {reimbursement.financeApproval.comment && (
                                        <p className="text-slate-400 text-[11px] mt-0.5 italic">"{reimbursement.financeApproval.comment}"</p>
                                    )}
                                </div>
                            </div>
                        )}
                        {reimbursement.managerApproval?.approved === null && reimbursement.financeApproval?.approved === null && (
                            <div className="flex items-center gap-2 text-amber-500 text-xs font-medium bg-amber-500/5 px-2 py-1 rounded w-fit">
                                <Clock size={12} /> Pending Approval
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExpenseCard;
