import StatusBadge from './StatusBadge';
import { Calendar, Clock, Trash2 } from 'lucide-react';

const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const LEAVE_TYPE_COLORS = {
    Annual: 'text-sky-400 bg-sky-500/10',
    Sick: 'text-rose-400 bg-rose-500/10',
    Casual: 'text-violet-400 bg-violet-500/10',
    Unpaid: 'text-slate-400 bg-slate-500/10',
};

const LeaveCard = ({ leave, onCancel, showEmployee = false }) => {
    const typeColor = LEAVE_TYPE_COLORS[leave.leaveType] || 'text-slate-400 bg-slate-500/10';

    return (
        <div className="card hover:border-slate-700 transition-colors duration-200">
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                    {showEmployee && (
                        <div className="flex items-center gap-2 mb-2">
                            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                                {leave.employee?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-slate-100 font-semibold text-sm">{leave.employee?.name}</p>
                                <p className="text-slate-500 text-xs">{leave.employee?.department}</p>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-2 flex-wrap mb-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${typeColor}`}>
                            {leave.leaveType} Leave
                        </span>
                        <StatusBadge status={leave.status} />
                        {leave.totalDays && (
                            <span className="text-slate-500 text-xs">
                                {leave.totalDays} day{leave.totalDays > 1 ? 's' : ''}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-4 text-slate-400 text-sm mb-2 flex-wrap">
                        <span className="flex items-center gap-1.5">
                            <Calendar size={13} />
                            {formatDate(leave.startDate)} — {formatDate(leave.endDate)}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Clock size={13} />
                            {formatDate(leave.createdAt)}
                        </span>
                    </div>

                    <p className="text-slate-400 text-sm leading-relaxed">{leave.reason}</p>

                    {leave.reviewComment && (
                        <div className="mt-3 p-3 rounded-lg bg-slate-800 border border-slate-700">
                            <p className="text-xs text-slate-500 mb-1">Reviewer comment</p>
                            <p className="text-slate-300 text-sm">{leave.reviewComment}</p>
                            {leave.reviewedBy && (
                                <p className="text-slate-500 text-xs mt-1">— {leave.reviewedBy.name}</p>
                            )}
                        </div>
                    )}
                </div>

                {onCancel && leave.status === 'Pending' && (
                    <button
                        onClick={() => onCancel(leave._id)}
                        className="text-slate-500 hover:text-rose-400 transition-colors p-1.5 rounded-lg hover:bg-rose-500/10"
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
