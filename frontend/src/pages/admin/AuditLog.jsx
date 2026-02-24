import { useState, useEffect } from 'react';
import api from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { History, Search, Filter, Download } from 'lucide-react';

const AuditLog = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const { data } = await api.get('/audit-logs');
            setLogs(data.logs || []);
        } catch (err) {
            toast.error('Failed to fetch audit logs');
        } finally {
            setLoading(false);
        }
    };

    const handleExportCSV = () => {
        if (logs.length === 0) {
            toast.error('No logs to export');
            return;
        }

        const headers = ['Timestamp', 'User', 'Role', 'Action', 'Target Type', 'Details'];
        const csvRows = logs.map(log => [
            new Date(log.createdAt).toLocaleString(),
            log.user?.name || 'System',
            log.user?.role || 'N/A',
            log.action,
            log.targetType,
            log.details?.replace(/,/g, ';') // Prevent comma breakage
        ]);

        const csvContent = [
            headers.join(','),
            ...csvRows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `audit-logs-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Audit logs exported successfully');
    };

    const filteredLogs = logs.filter(log =>
        log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <LoadingSpinner />;

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-heading flex items-center gap-2">
                        <History size={24} className="text-blue-500" />
                        Audit Trails
                    </h1>
                    <p className="text-secondary mt-1">System-wide activity and changes log</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExportCSV}
                        className="btn-secondary flex items-center gap-2 h-[38px]"
                    >
                        <Download size={16} /> Export All
                    </button>
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                        <input
                            type="text"
                            placeholder="Search logs..."
                            className="input-field pl-10 w-64 text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="card overflow-hidden p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-main border-b border-main">
                                <th className="p-4 text-xs font-semibold text-muted uppercase tracking-wider">User</th>
                                <th className="p-4 text-xs font-semibold text-muted uppercase tracking-wider">Action</th>
                                <th className="p-4 text-xs font-semibold text-muted uppercase tracking-wider">Target</th>
                                <th className="p-4 text-xs font-semibold text-muted uppercase tracking-wider">Details</th>
                                <th className="p-4 text-xs font-semibold text-muted uppercase tracking-wider">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-main">
                            {filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-muted text-sm">No audit logs found.</td>
                                </tr>
                            ) : (
                                filteredLogs.map((log) => (
                                    <tr key={log._id} className="hover:bg-main transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className="h-7 w-7 rounded-full bg-main flex items-center justify-center text-[10px] text-primary">
                                                    {log.user?.name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-user-name">{log.user?.name}</p>
                                                    <p className="text-[10px] text-muted uppercase">{log.user?.role}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${log.action.includes('Approved') ? 'bg-emerald-500/10 text-emerald-500' :
                                                log.action.includes('Rejected') ? 'bg-rose-500/10 text-rose-500' :
                                                    'bg-indigo-500/10 text-indigo-500'
                                                }`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-secondary">{log.targetType}</td>
                                        <td className="p-4 text-sm text-secondary max-w-xs truncate">{log.details}</td>
                                        <td className="p-4 text-xs text-muted">
                                            {new Date(log.createdAt).toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AuditLog;
