import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Send, CalendarPlus } from 'lucide-react';

const LEAVE_TYPES = ['Annual', 'Sick', 'Casual', 'Unpaid'];

const ApplyLeave = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        leaveType: 'Annual',
        startDate: '',
        endDate: '',
        reason: '',
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const calcDays = () => {
        if (!form.startDate || !form.endDate) return null;
        const diff = Math.ceil(
            (new Date(form.endDate) - new Date(form.startDate)) / (1000 * 60 * 60 * 24)
        ) + 1;
        return diff > 0 ? diff : 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (new Date(form.endDate) < new Date(form.startDate)) {
            toast.error('End date must be after start date');
            return;
        }
        setLoading(true);
        try {
            await api.post('/leaves', form);
            toast.success('Leave application submitted!');
            navigate('/my-leaves');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to apply for leave');
        } finally {
            setLoading(false);
        }
    };

    const days = calcDays();

    return (
        <div className="p-6 max-w-2xl">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <CalendarPlus size={24} className="text-indigo-400" />
                    Apply for Leave
                </h1>
                <p className="text-slate-400 mt-1">Submit a new leave request for approval</p>
            </div>

            <div className="card">
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Leave Type */}
                    <div>
                        <label className="block text-slate-300 text-sm font-medium mb-3">Leave Type</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {LEAVE_TYPES.map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setForm({ ...form, leaveType: type })}
                                    className={`py-2.5 px-3 rounded-lg border text-sm font-medium transition-all duration-200 ${form.leaveType === type
                                            ? 'border-indigo-500 bg-indigo-500/15 text-indigo-300'
                                            : 'border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300'
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-slate-300 text-sm font-medium mb-2">Start Date</label>
                            <input
                                type="date"
                                name="startDate"
                                value={form.startDate}
                                onChange={handleChange}
                                className="input-field"
                                min={new Date().toISOString().split('T')[0]}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-slate-300 text-sm font-medium mb-2">End Date</label>
                            <input
                                type="date"
                                name="endDate"
                                value={form.endDate}
                                onChange={handleChange}
                                className="input-field"
                                min={form.startDate || new Date().toISOString().split('T')[0]}
                                required
                            />
                        </div>
                    </div>

                    {/* Day count preview */}
                    {days !== null && days > 0 && (
                        <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                            <span className="text-indigo-400 text-sm font-medium">
                                📅 {days} day{days > 1 ? 's' : ''} of {form.leaveType} leave
                            </span>
                        </div>
                    )}

                    {/* Reason */}
                    <div>
                        <label className="block text-slate-300 text-sm font-medium mb-2">
                            Reason <span className="text-slate-500 font-normal">(max 500 chars)</span>
                        </label>
                        <textarea
                            name="reason"
                            value={form.reason}
                            onChange={handleChange}
                            className="input-field resize-none"
                            rows={4}
                            placeholder="Briefly describe your reason..."
                            maxLength={500}
                            required
                        />
                        <p className="text-right text-slate-500 text-xs mt-1">{form.reason.length}/500</p>
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="btn-secondary"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary flex items-center gap-2"
                        >
                            {loading ? (
                                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Send size={15} />
                            )}
                            {loading ? 'Submitting...' : 'Submit Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ApplyLeave;
