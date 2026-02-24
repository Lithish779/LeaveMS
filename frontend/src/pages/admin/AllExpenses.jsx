import { useState, useEffect } from 'react';
import reimbursementService from '../../services/reimbursementService';
import ExpenseCard from '../../components/ExpenseCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import ReceiptPreviewModal from '../../components/ReceiptPreviewModal';
import toast from 'react-hot-toast';
import { ClipboardList, Search, Filter } from 'lucide-react';

const AllExpenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => {
        const fetchExpenses = async () => {
            try {
                const data = await reimbursementService.getAll();
                setExpenses(data.reimbursements);
            } catch (err) {
                toast.error('Failed to load expense history');
            } finally {
                setLoading(false);
            }
        };
        fetchExpenses();
    }, []);

    const statuses = ['All', 'Pending Manager', 'Pending Finance', 'Approved', 'Rejected'];

    const filtered = filter === 'All'
        ? expenses
        : expenses.filter((e) => e.status === filter);

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
                        <ClipboardList size={22} className="text-indigo-400" /> All Expense Records
                    </h1>
                    <p className="text-secondary mt-0.5">{expenses.length} total record{expenses.length !== 1 ? 's' : ''}</p>
                </div>

                <div className="flex gap-2 flex-wrap">
                    {statuses.map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${filter === s
                                ? 'bg-indigo-600 border-indigo-500 text-white'
                                : 'border-main text-secondary hover:border-slate-400 dark:hover:border-slate-600 hover:text-primary'
                                }`}
                        >
                            {s === 'Pending Manager' ? 'Pending (Mgr)' : s === 'Pending Finance' ? 'Pending (Fin)' : s}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <LoadingSpinner />
            ) : filtered.length === 0 ? (
                <div className="card text-center py-12">
                    <Search size={32} className="text-muted mx-auto mb-3" />
                    <p className="text-secondary">No {filter !== 'All' ? filter.toLowerCase() : ''} expenses found.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map((expense) => (
                        <ExpenseCard
                            key={expense._id}
                            reimbursement={expense}
                            onPreviewReceipt={(url) => setPreviewUrl(url)}
                        />
                    ))}
                </div>
            )}

            <ReceiptPreviewModal
                isOpen={!!previewUrl}
                url={previewUrl}
                onClose={() => setPreviewUrl(null)}
            />
        </div>
    );
};

export default AllExpenses;
