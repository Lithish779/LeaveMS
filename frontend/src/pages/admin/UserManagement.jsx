import { useState, useEffect } from 'react';
import api from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { Users, Edit2, Trash2, Check, X } from 'lucide-react';

const ROLES = ['employee', 'manager', 'admin'];
const ROLE_COLORS = {
    admin: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    manager: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    employee: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
};

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/users');
            setUsers(data.users);
        } catch {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const startEdit = (user) => {
        setEditingId(user._id);
        setEditForm({ role: user.role, department: user.department });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditForm({});
    };

    const saveEdit = async (id) => {
        try {
            const { data } = await api.put(`/users/${id}`, editForm);
            setUsers((prev) => prev.map((u) => (u._id === id ? data.user : u)));
            toast.success('User updated');
            cancelEdit();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update');
        }
    };

    const deleteUser = async (id) => {
        if (!window.confirm('Delete this user and all their leave records?')) return;
        try {
            await api.delete(`/users/${id}`);
            setUsers((prev) => prev.filter((u) => u._id !== id));
            toast.success('User deleted');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete');
        }
    };

    const toggleActive = async (user) => {
        try {
            const { data } = await api.put(`/users/${user._id}`, { isActive: !user.isActive });
            setUsers((prev) => prev.map((u) => (u._id === user._id ? data.user : u)));
            toast.success(`User ${data.user.isActive ? 'activated' : 'deactivated'}`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update status');
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Users size={22} className="text-indigo-400" /> User Management
                </h1>
                <p className="text-slate-400 mt-0.5">{users.length} registered users</p>
            </div>

            {loading ? <LoadingSpinner /> : (
                <div className="card overflow-hidden p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-800">
                                    <th className="text-left text-slate-400 font-semibold px-5 py-3.5">User</th>
                                    <th className="text-left text-slate-400 font-semibold px-4 py-3.5">Role</th>
                                    <th className="text-left text-slate-400 font-semibold px-4 py-3.5 hidden sm:table-cell">Department</th>
                                    <th className="text-left text-slate-400 font-semibold px-4 py-3.5 hidden md:table-cell">Status</th>
                                    <th className="text-right text-slate-400 font-semibold px-5 py-3.5">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {users.map((user) => (
                                    <tr key={user._id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-slate-100 font-medium">{user.name}</p>
                                                    <p className="text-slate-500 text-xs">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            {editingId === user._id ? (
                                                <select
                                                    value={editForm.role}
                                                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                                                    className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                >
                                                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                                                </select>
                                            ) : (
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${ROLE_COLORS[user.role]}`}>
                                                    {user.role}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 hidden sm:table-cell">
                                            {editingId === user._id ? (
                                                <input
                                                    value={editForm.department}
                                                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                                                    className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1.5 w-28 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                />
                                            ) : (
                                                <span className="text-slate-400 text-xs">{user.department}</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 hidden md:table-cell">
                                            <button
                                                onClick={() => toggleActive(user)}
                                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border transition-colors ${user.isActive
                                                        ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20'
                                                        : 'text-rose-400 bg-rose-500/10 border-rose-500/20 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/20'
                                                    }`}
                                                title={user.isActive ? 'Click to deactivate' : 'Click to activate'}
                                            >
                                                {user.isActive ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                {editingId === user._id ? (
                                                    <>
                                                        <button onClick={() => saveEdit(user._id)} className="text-emerald-400 hover:text-emerald-300 p-1.5 rounded-lg hover:bg-emerald-500/10 transition-colors" title="Save">
                                                            <Check size={15} />
                                                        </button>
                                                        <button onClick={cancelEdit} className="text-slate-500 hover:text-slate-300 p-1.5 rounded-lg hover:bg-slate-700 transition-colors" title="Cancel">
                                                            <X size={15} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button onClick={() => startEdit(user)} className="text-slate-500 hover:text-indigo-400 p-1.5 rounded-lg hover:bg-indigo-500/10 transition-colors" title="Edit">
                                                            <Edit2 size={15} />
                                                        </button>
                                                        <button onClick={() => deleteUser(user._id)} className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors" title="Delete">
                                                            <Trash2 size={15} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
