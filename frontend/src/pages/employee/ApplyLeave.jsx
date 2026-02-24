import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Send, CalendarPlus, Upload, AlertCircle } from 'lucide-react';

const LEAVE_TYPES = ['Annual', 'Sick', 'Casual', 'Unpaid', 'Earned', 'Maternity', 'Paternity'];

const ApplyLeave = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        leaveType: 'Annual',
        startDate: '',
        endDate: '',
        reason: '',
    });
    const LEAVE_TYPE_CLASSES = {
        Annual: 'leave-tag-annual',
        Sick: 'leave-tag-sick',
        Casual: 'leave-tag-casual',
        Unpaid: 'leave-tag-unpaid',
        Earned: 'leave-tag-earned',
        Maternity: 'leave-tag-maternity',
        Paternity: 'leave-tag-paternity',
    };
    const [attachment, setAttachment] = useState(null);
    const [holidays, setHolidays] = useState([]);
    const [loading, setLoading] = useState(false);
    const [conflictWarning, setConflictWarning] = useState('');

    useEffect(() => {
        fetchHolidays();
    }, []);

    const fetchHolidays = async () => {
        try {
            const res = await api.get('/holidays');
            setHolidays(res.data.holidays || []);
        } catch (err) {
            console.error('Failed to fetch holidays');
        }
    };

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleFileChange = (e) => {
        setAttachment(e.target.files[0]);
    };

    const isWeekend = (date) => {
        const day = new Date(date).getDay();
        return day === 0 || day === 6;
    };

    const isHoliday = (date) => {
        const dateStr = new Date(date).toDateString();
        return holidays.some(h => new Date(h.date).toDateString() === dateStr);
    };

    const calcSmartDays = () => {
        if (!form.startDate || !form.endDate) return 0;
        let count = 0;
        let cur = new Date(form.startDate);
        const end = new Date(form.endDate);

        while (cur <= end) {
            if (!isWeekend(cur) && !isHoliday(cur)) {
                count++;
            }
            cur.setDate(cur.getDate() + 1);
        }
        return count;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (new Date(form.endDate) < new Date(form.startDate)) {
            toast.error('End date must be after start date');
            return;
        }

        const formData = new FormData();
        formData.append('leaveType', form.leaveType);
        formData.append('startDate', form.startDate);
        formData.append('endDate', form.endDate);
        formData.append('reason', form.reason);
        if (attachment) {
            formData.append('attachment', attachment);
        }

        setLoading(true);
        try {
            const res = await api.post('/leaves', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.conflictWarning) {
                toast(res.data.conflictWarning, { icon: '⚠️', duration: 5000 });
            }
            toast.success('Leave application submitted!');
            navigate('/my-leaves');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to apply for leave');
        } finally {
            setLoading(false);
        }
    };

    const smartDays = calcSmartDays();

    return (
        <div className="p-6 max-w-2xl">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-heading flex items-center gap-2">
                    <CalendarPlus size={24} className="text-blue-500" />
                    Apply for Leave
                </h1>
                <p className="text-secondary mt-1">Submit a new leave request for approval</p>
            </div>

            <div className="card">
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Leave Type */}
                    <div>
                        <label className="block text-secondary text-sm font-medium mb-3">Leave Type</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {LEAVE_TYPES.map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setForm({ ...form, leaveType: type })}
                                    className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all duration-200 ${form.leaveType === type
                                        ? `border-blue-500 ${LEAVE_TYPE_CLASSES[type]} ring-1 ring-blue-500/20`
                                        : 'border-main text-secondary hover:border-slate-400 dark:hover:border-slate-600'
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
                            <label className="block text-secondary text-sm font-medium mb-2">Start Date</label>
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
                            <label className="block text-secondary text-sm font-medium mb-2">End Date</label>
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

                    {/* Smart day count preview */}
                    {smartDays > 0 ? (
                        <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                            <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                                📅 {smartDays} working day{smartDays > 1 ? 's' : ''} (excluding weekends/holidays)
                            </span>
                        </div>
                    ) : form.startDate && form.endDate && (
                        <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                            <AlertCircle size={16} className="text-amber-400" />
                            <span className="text-amber-400 text-sm font-medium">Selected dates are only weekends or holidays.</span>
                        </div>
                    )}

                    {/* Reason */}
                    <div>
                        <label className="block text-secondary text-sm font-medium mb-2">
                            Reason <span className="text-muted font-normal">(max 500 chars)</span>
                        </label>
                        <textarea
                            name="reason"
                            value={form.reason}
                            onChange={handleChange}
                            className="input-field resize-none"
                            rows={3}
                            placeholder="Briefly describe your reason..."
                            maxLength={500}
                            required
                        />
                    </div>

                    {/* Attachment */}
                    <div>
                        <label className="block text-secondary text-sm font-medium mb-2">Attachment (Optional)</label>
                        <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-main border-dashed rounded-lg cursor-pointer bg-card hover:bg-main transition-colors">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-8 h-8 mb-2 text-muted" />
                                    <p className="mb-1 text-sm text-secondary">
                                        <span className="font-semibold">{attachment ? attachment.name : 'Click to upload'}</span>
                                    </p>
                                    <p className="text-xs text-muted">PDF, PNG, JPG (Max 5MB)</p>
                                </div>
                                <input type="file" className="hidden" onChange={handleFileChange} />
                            </label>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                        <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
                        <button type="submit" disabled={loading || smartDays === 0} className="btn-primary flex items-center gap-2">
                            {loading ? <span className="loader" /> : <Send size={15} />}
                            {loading ? 'Submitting...' : 'Submit Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ApplyLeave;
