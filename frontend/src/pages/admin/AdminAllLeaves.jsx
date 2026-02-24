import { useState, useEffect } from 'react';
import api from '../../utils/api';
import LeaveCard from '../../components/LeaveCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { ClipboardList, Filter } from 'lucide-react';

const STATUS_FILTERS = ['All', 'Pending', 'Approved', 'Rejected'];

const AdminAllLeaves = () => {
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        const fetch = async () => {
            try {
                const { data } = await api.get('/leaves');
                setLeaves(data.leaves);
            } catch {
                toast.error('Failed to load leave records');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    const filtered = filter === 'All' ? leaves : leaves.filter((l) => l.status === filter);

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-heading flex items-center gap-2">
                        <ClipboardList size={22} className="text-blue-500" /> All Leave Records
                    </h1>
                    <p className="text-secondary mt-0.5">{leaves.length} total records</p>
                </div>
                <div className="flex items-center gap-1.5 bg-input border border-main rounded-lg p-1">
                    <Filter size={13} className="text-muted ml-1" />
                    {STATUS_FILTERS.map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${filter === s ? 'bg-blue-600 text-white shadow-sm' : 'text-secondary hover:text-primary'
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? <LoadingSpinner /> : filtered.length === 0 ? (
                <div className="card text-center py-12">
                    <ClipboardList size={36} className="text-muted mx-auto mb-3" />
                    <p className="text-secondary">No records found for this filter.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((leave) => (
                        <LeaveCard key={leave._id} leave={leave} showEmployee />
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminAllLeaves;
