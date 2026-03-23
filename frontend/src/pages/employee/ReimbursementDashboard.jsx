import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import reimbursementService from '../../services/reimbursementService';
import { IndianRupee, Clock, CheckCircle, FileText, ChevronRight, Plus, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';
import ReceiptPreviewModal from '../../components/ReceiptPreviewModal';

const StatCard = ({ label, value, icon: Icon, gradient, index }) => (
    <div 
        className="glass-card glass-card-hover p-6 relative overflow-hidden group stagger-item"
        style={{ animationDelay: `${index * 100}ms` }}
    >
        {/* Background Watermark/Sparkline Placeholder */}
        <div className="absolute bottom-0 right-0 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-500 pointer-events-none translate-x-1/4 translate-y-1/4 scale-150">
            <Icon size={120} />
        </div>
        
        <div className="flex items-center gap-5 relative z-10">
            <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg shadow-indigo-500/10 group-hover:scale-110 transition-transform duration-500`}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-[#6B7280] font-display text-xs font-semibold uppercase tracking-widest mb-1">{label}</p>
                <div className="flex items-baseline gap-1">
                    <span className="text-[#F0F0F5] font-display text-2xl font-bold tracking-tight">₹{value.toLocaleString()}</span>
                    <span className="text-[#6B7280] text-[10px] font-mono-refined">INR</span>
                </div>
            </div>
        </div>

        {/* Floating Sparkle Animation */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-40 transition-opacity">
            <Sparkles size={12} className="text-indigo-400 animate-pulse" />
        </div>
    </div>
);

const ReimbursementDashboard = () => {
    const [reimbursements, setReimbursements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => {
        fetchReimbursements();
    }, []);

    const fetchReimbursements = async () => {
        try {
            const data = await reimbursementService.getMyReimbursements();
            setReimbursements(data.reimbursements);
        } catch (err) {
            toast.error('Failed to load reimbursements');
        } finally {
            setLoading(false);
        }
    };

    const stats = {
        total: reimbursements.reduce((sum, r) => sum + (parseFloat(r.totalAmount) || 0), 0),
        pending: reimbursements
            .filter(r => ['Pending Manager', 'Pending Finance'].includes(r.status))
            .reduce((sum, r) => sum + (parseFloat(r.totalAmount) || 0), 0),
        paid: reimbursements
            .filter(r => r.status === 'Approved')
            .reduce((sum, r) => sum + (parseFloat(r.totalAmount) || 0), 0)
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'Approved': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'Rejected': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
            case 'Draft': return 'bg-slate-500/10 text-slate-400 border-white/10';
            default: return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
        }
    };

    return (
        <div className="p-8 lg:p-12 space-y-10 min-h-screen">
            {/* Header Section */}
            <div className="flex items-end justify-between flex-wrap gap-8 stagger-item">
                <div className="space-y-2">
                    <h1 className="text-4xl lg:text-5xl font-display font-bold text-white tracking-tighter antialiased">
                        Reimbursements
                    </h1>
                    <p className="text-[#6B7280] font-display text-base lg:text-lg max-w-md leading-relaxed">
                        Precision tracking for your business expenses and claims.
                    </p>
                </div>
                <Link 
                    to="/reimbursements/new" 
                    className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white font-display font-bold text-sm tracking-tight shadow-2xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                >
                    <Plus size={18} className="group-hover:rotate-90 transition-transform duration-500" />
                    <span>New Expense Claim</span>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    label="Total Claimed" 
                    value={stats.total} 
                    icon={IndianRupee} 
                    gradient="from-indigo-600 to-indigo-800" 
                    index={1}
                />
                <StatCard 
                    label="Pending Payout" 
                    value={stats.pending} 
                    icon={Clock} 
                    gradient="from-amber-500/80 to-amber-700" 
                    index={2}
                />
                <StatCard 
                    label="Total Paid (YTD)" 
                    value={stats.paid} 
                    icon={CheckCircle} 
                    gradient="from-emerald-500/80 to-emerald-700" 
                    index={3}
                />
            </div>

            {/* Main Content Area */}
            <div className="glass-card p-1 stagger-item" style={{ animationDelay: '400ms' }}>
                <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
                    <h2 className="text-white font-display font-bold text-lg tracking-tight">Recent Claims</h2>
                    <div className="flex items-center gap-2 text-[#6B7280] font-mono-refined text-[10px] uppercase tracking-widest">
                        <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse"></span>
                        Real-time updates
                    </div>
                </div>

                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center">
                        <LoadingSpinner size="large" />
                        <p className="mt-4 text-[#6B7280] font-mono-refined text-xs animate-pulse">Fetching records...</p>
                    </div>
                ) : reimbursements.length === 0 ? (
                    <div className="py-24 text-center space-y-6 relative overflow-hidden group">
                        {/* Skeleton Row Hints */}
                        <div className="absolute inset-x-8 top-12 space-y-4 opacity-[0.02]">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-16 w-full bg-white rounded-xl"></div>
                            ))}
                        </div>
                        
                        <div className="relative">
                            <div className="h-20 w-20 rounded-3xl bg-white/[0.02] border border-white/5 mx-auto flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-700">
                                <FileText size={32} className="text-slate-600 animate-pulse" />
                            </div>
                            <h3 className="text-white font-display font-bold text-xl tracking-tight">Precision through absence</h3>
                            <p className="text-[#6B7280] font-display text-sm max-w-xs mx-auto leading-relaxed">
                                No reimbursement claims detected. Initialize a process to see detailed analytics and tracking.
                            </p>
                            <Link 
                                to="/reimbursements/new"
                                className="mt-8 inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-display font-bold text-xs uppercase tracking-widest transition-colors"
                            >
                                Get started <ChevronRight size={14} />
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-[#6B7280] font-display text-[11px] font-black uppercase tracking-[0.2em] border-b border-white/5">
                                    <th className="px-8 py-5">Expense Title</th>
                                    <th className="py-5">Filing Date</th>
                                    <th className="py-5">Manifest</th>
                                    <th className="py-5">Allocation</th>
                                    <th className="py-5">Status</th>
                                    <th className="px-8 py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.03]">
                                {reimbursements.map((r) => (
                                    <tr key={r._id} className="group hover:bg-white/[0.01] transition-all duration-300">
                                        <td className="px-8 py-6">
                                            <p className="text-white font-display font-bold text-sm tracking-tight group-hover:text-indigo-400 transition-colors uppercase">{r.title}</p>
                                        </td>
                                        <td className="py-6 text-[#6B7280] font-mono-refined text-xs">
                                            {new Date(r.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
                                        </td>
                                        <td className="py-6 text-[#6B7280] font-display text-xs font-semibold italic">
                                            {r.items.length} item(s) detected
                                        </td>
                                        <td className="py-6">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[#6B7280] text-[10px] font-mono-refined">₹</span>
                                                <span className="text-white font-display font-bold text-sm tracking-tight">{(parseFloat(r.totalAmount) || 0).toLocaleString()}</span>
                                            </div>
                                        </td>
                                        <td className="py-6">
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border shadow-sm ${getStatusStyles(r.status)}`}>
                                                {r.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-3 opacity-40 group-hover:opacity-100 transition-opacity">
                                                {r.items.some(i => i.receiptUrl) && (
                                                    <button
                                                        onClick={() => setPreviewUrl(r.items.find(i => i.receiptUrl).receiptUrl)}
                                                        className="p-2 rounded-xl bg-white/[0.03] border border-white/5 text-slate-400 hover:text-indigo-400 hover:border-indigo-500/50 transition-all shadow-xl"
                                                        title="Inventory Scan"
                                                    >
                                                        <FileText size={16} />
                                                    </button>
                                                )}
                                                <button className="p-2 rounded-xl bg-white/[0.03] border border-white/5 text-slate-400 hover:text-white transition-all shadow-xl">
                                                    <ChevronRight size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <ReceiptPreviewModal
                isOpen={!!previewUrl}
                url={previewUrl}
                onClose={() => setPreviewUrl(null)}
            />
        </div>
    );
};

export default ReimbursementDashboard;
