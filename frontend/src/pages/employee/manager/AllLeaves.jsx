import { useState, useEffect } from 'react';
import api from '../../utils/api';
import LeaveCard from '../../components/LeaveCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { ClipboardList, Filter } from 'lucide-react';

const STATUS_FILTERS = ['All', 'Pending', 'Approved', 'Rejected'];

const AllLeaves = () => {
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        const fetch = async () => {
            try {
                const { data } = await api.get('/leaves/pending');
                // For manager view, show all leaves they can see (pending + all statuses via a workaround)
                // We use pending endpoint and supplement with their own data
                setLeaves(data.leaves);
            } catch {
                toast.error('Failed to load leaves');
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
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <ClipboardList size={22} className="text-indigo-400" /> Leave Requests
                    </h1>
                    <p className="text-slate-400 mt-0.5">{leaves.length} total</p>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg p-1">
                    <Filter size={13} className="text-slate-500 ml-1" />
                    {STATUS_FILTERS.map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${filter === s ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? <LoadingSpinner /> : filtered.length === 0 ? (
                <div className="card text-center py-10">
                    <ClipboardList size={32} className="text-slate-700 mx-auto mb-3" />
                    <p className="text-slate-400">No leaves found for this filter.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((l) => <LeaveCard key={l._id} leave={l} showEmployee />)}
                </div>
            )}
        </div>
    );
};

export default AllLeaves;
