import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import api from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { Calendar as CalendarIcon, Users } from 'lucide-react';
import 'react-calendar/dist/Calendar.css';

const TeamCalendar = () => {
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [date, setDate] = useState(new Date());

    useEffect(() => {
        fetchTeamLeaves();
    }, []);

    const fetchTeamLeaves = async () => {
        try {
            // Get all approved and pending leaves
            const res = await api.get('/leaves/all');
            setLeaves(res.data.leaves || []);
        } catch (err) {
            toast.error('Failed to fetch team leaves');
        } finally {
            setLoading(false);
        }
    };

    const getLeavesForDate = (d) => {
        const dStr = d.toDateString();
        return leaves.filter(l => {
            const start = new Date(l.startDate);
            const end = new Date(l.endDate);
            const cur = new Date(d);
            return cur >= start && cur <= end && l.status !== 'Rejected';
        });
    };

    const tileContent = ({ date, view }) => {
        if (view === 'month') {
            const dayLeaves = getLeavesForDate(date);
            if (dayLeaves.length > 0) {
                return (
                    <div className="flex justify-center mt-1">
                        <div className={`h-1.5 w-1.5 rounded-full ${dayLeaves.length > 2 ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                    </div>
                );
            }
        }
    };

    const tileClassName = ({ date, view }) => {
        if (view === 'month') {
            const dayLeaves = getLeavesForDate(date);
            if (dayLeaves.length > 5) return 'heatmap-high';
            if (dayLeaves.length > 2) return 'heatmap-mid';
            if (dayLeaves.length > 0) return 'heatmap-low';
        }
    };

    const selectedDayLeaves = getLeavesForDate(date);

    if (loading) return <LoadingSpinner />;

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-heading flex items-center gap-2">
                        <Users size={24} className="text-blue-500" />
                        Team Calendar
                    </h1>
                    <p className="text-secondary mt-1">Real-time heatmap of team availability</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 card p-0 overflow-hidden">
                    <Calendar
                        onChange={setDate}
                        value={date}
                        tileContent={tileContent}
                        tileClassName={tileClassName}
                        className="w-full bg-slate-900 border-none text-slate-300"
                    />
                </div>

                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-heading flex items-center gap-2">
                        <CalendarIcon size={18} className="text-blue-500" />
                        {date.toDateString()}
                    </h2>

                    <div className="space-y-3">
                        {selectedDayLeaves.length === 0 ? (
                            <p className="text-slate-500 text-sm">Everyone is in the office today!</p>
                        ) : (
                            selectedDayLeaves.map((l) => (
                                <div key={l._id} className="p-3 rounded-lg bg-main border border-main">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-sm font-medium text-primary">{l.employee?.name}</p>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${l.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>
                                            {l.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted">{l.leaveType} · {l.employee?.department}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .react-calendar { background: transparent !important; border: none !important; font-family: inherit !important; width: 100% !important; }
                .react-calendar__tile { color: var(--text-secondary) !important; padding: 1.5em 0.5em !important; }
                .react-calendar__tile:hover { background: var(--bg-main) !important; }
                .react-calendar__tile--now { background: var(--accent-glow) !important; color: var(--accent-primary) !important; }
                .react-calendar__tile--active { background: var(--accent-primary) !important; color: white !important; }
                .react-calendar__navigation button { color: var(--text-primary) !important; }
                .react-calendar__navigation button:hover { background: var(--bg-main) !important; }
                .react-calendar__month-view__weekdays__weekday { color: var(--accent-primary) !important; text-decoration: none !important; font-size: 0.8em !important; font-weight: bold !important; }
                .heatmap-low { background: #10b98110 !important; }
                .heatmap-mid { background: #f59e0b10 !important; }
                .heatmap-high { background: #ef444410 !important; }
            `}</style>
        </div>
    );
};

export default TeamCalendar;
