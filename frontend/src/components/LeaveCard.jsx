import StatusBadge from './StatusBadge';
import { Calendar, Clock, Trash2, Paperclip, ExternalLink } from 'lucide-react';

const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const LEAVE_TYPE_CLASSES = {
    Annual: 'leave-tag-annual',
    Sick: 'leave-tag-sick',
    Casual: 'leave-tag-casual',
    Unpaid: 'leave-tag-unpaid',
    Earned: 'leave-tag-earned',
    Maternity: 'leave-tag-maternity',
    Paternity: 'leave-tag-paternity',
};

const LeaveCard = ({ leave, onCancel, showEmployee = false }) => {
    const typeClass = LEAVE_TYPE_CLASSES[leave.leaveType] || 'leave-tag-unpaid';

    return (
        <div className="card hover:border-blue-500/30 transition-colors duration-200">
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                    {showEmployee && (
                        <div className="flex items-center gap-2 mb-2">
                            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                                {leave.employee?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-primary font-semibold text-sm">{leave.employee?.name}</p>
                                <p className="text-muted text-xs">{leave.employee?.department}</p>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-2 flex-wrap mb-3">
                        <span className={`leave-tag ${typeClass}`}>
                            {leave.leaveType} Leave
                        </span>
                        <StatusBadge status={leave.status} />
                        {leave.totalDays && (
                            <span className="text-secondary text-xs">
                                {leave.totalDays} day{leave.totalDays > 1 ? 's' : ''}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-4 text-secondary text-sm mb-2 flex-wrap">
                        <span className="flex items-center gap-1.5">
                            <Calendar size={13} />
                            {formatDate(leave.startDate)} — {formatDate(leave.endDate)}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Clock size={13} />
                            {formatDate(leave.createdAt)}
                        </span>
                    </div>

                    <p className="text-secondary text-sm leading-relaxed mb-3">{leave.reason}</p>

                    {leave.attachment && (
                        <div className="flex items-center gap-2 mb-3">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-main border border-main hover:border-indigo-500/50 transition-colors group">
                                <Paperclip size={14} className="text-muted group-hover:text-indigo-400" />
                                <a
                                    href={leave.attachment}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs font-medium text-secondary group-hover:text-primary flex items-center gap-1"
                                >
                                    View Attachment
                                    <ExternalLink size={10} />
                                </a>
                            </div>
                        </div>
                    )}

                    {leave.reviewComment && (
                        <div className="mt-3 p-3 rounded-lg bg-main border border-main">
                            <p className="text-xs text-muted mb-1">Reviewer comment</p>
                            <p className="text-secondary text-sm">{leave.reviewComment}</p>
                            {leave.reviewedBy && (
                                <p className="text-muted text-xs mt-1">— {leave.reviewedBy.name}</p>
                            )}
                        </div>
                    )}
                </div>

                {onCancel && leave.status === 'Pending' && (
                    <button
                        onClick={() => onCancel(leave._id)}
                        className="text-muted hover:text-rose-600 transition-colors p-1.5 rounded-lg hover:bg-rose-500/10"
                        title="Cancel leave"
                    >
                        <Trash2 size={15} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default LeaveCard;
