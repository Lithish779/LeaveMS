import { useState, useEffect } from 'react';
import api from '../../utils/api';
import LeaveCard from '../../components/LeaveCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { ClipboardList, Filter } from 'lucide-react';

const STATUS_FILTERS = ['All', 'Pending', 'Approved', 'Rejected'];

const MyLeaves = () => {
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');

    const fetchLeaves = async () => {
        try {
            const { data } = await api.get('/leaves/my');
            setLeaves(data.leaves);
        } catch {
            toast.error('Failed to load leaves');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchLeaves(); }, []);

    const handleCancel = async (id) => {
        if (!window.confirm('Cancel this leave request?')) return;
        try {
            await api.delete(`/leaves/${id}`);
            toast.success('Leave cancelled');
            setLeaves((prev) => prev.filter((l) => l._id !== id));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to cancel');
        }
    };

    const filtered = filter === 'All' ? leaves : leaves.filter((l) => l.status === filter);

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-heading flex items-center gap-2">
                        <ClipboardList size={22} className="text-blue-500" /> My Leaves
                    </h1>
                    <p className="text-secondary mt-0.5">{leaves.length} total request{leaves.length !== 1 ? 's' : ''}</p>
                </div>
                {/* Filter tabs */}
                <div className="flex items-center gap-1.5 bg-input border border-main rounded-lg p-1">
                    <Filter size={13} className="text-muted ml-1" />
                    {STATUS_FILTERS.map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${filter === s
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'text-secondary hover:text-primary'
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <LoadingSpinner />
            ) : filtered.length === 0 ? (
                <div className="card text-center py-12">
                    <ClipboardList size={36} className="text-muted mx-auto mb-3" />
                    <p className="text-secondary">No {filter !== 'All' ? filter.toLowerCase() : ''} leave requests found.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((leave) => (
                        <LeaveCard key={leave._id} leave={leave} onCancel={handleCancel} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyLeaves;
