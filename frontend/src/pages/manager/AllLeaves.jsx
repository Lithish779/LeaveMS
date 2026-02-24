import { useState, useEffect } from 'react';
import api from '../../utils/api';
import LeaveCard from '../../components/LeaveCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { ClipboardList, Search } from 'lucide-react';

const AllLeaves = () => {
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        const fetch = async () => {
            try {
                const { data } = await api.get('/leaves/all');
                setLeaves(data.leaves);
            } catch {
                toast.error('Failed to load leaves');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    const statuses = ['All', 'Pending', 'Approved', 'Rejected'];

    const filtered = filter === 'All'
        ? leaves
        : leaves.filter((l) => l.status === filter);

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <ClipboardList size={22} className="text-indigo-400" /> All Team Leaves
                    </h1>
                    <p className="text-slate-400 mt-0.5">{leaves.length} total request{leaves.length !== 1 ? 's' : ''}</p>
                </div>

                {/* Status filter pills */}
                <div className="flex gap-2 flex-wrap">
                    {statuses.map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${filter === s
                                    ? 'bg-indigo-600 border-indigo-500 text-white'
                                    : 'border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200'
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
                    <Search size={32} className="text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400">No {filter !== 'All' ? filter.toLowerCase() : ''} leaves found.</p>
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

export default AllLeaves;
