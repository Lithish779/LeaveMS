import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AdminInbox, MessageThread } from '../components/ChatPanel';
import api from '../utils/api';
import { MessageCircle } from 'lucide-react';

const ChatPage = () => {
    const { user } = useAuth();
    const [admins, setAdmins] = useState([]);
    const [selectedPartner, setSelectedPartner] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch partners (employees for admin, admins for employee)
    useEffect(() => {
        const fetchPartners = async () => {
            try {
                const { data } = await api.get('/users');
                // For employee, we want to show all admins
                if (user?.role === 'employee') {
                    const foundAdmins = data.users?.filter((u) => u.role === 'admin') || [];
                    setAdmins(foundAdmins);
                    // Auto-select if only one admin
                    if (foundAdmins.length === 1) {
                        setSelectedPartner(foundAdmins[0]);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch partners:', err);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchPartners();
    }, [user]);

    const partner = selectedPartner;

    return (
        <div className="page-content h-[calc(100vh-140px)] flex flex-col">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-heading">Chat Messages</h1>
                <p className="text-secondary text-sm">
                    {user?.role === 'admin' ? 'Real-time communication with employees' : 'Real-time communication with admins'}
                </p>
            </div>

            <div className="flex-1 bg-card border border-main rounded-2xl shadow-xl overflow-hidden flex">
                {/* Sidebar / Inbox */}
                <div className={`w-full md:w-80 border-r border-main flex flex-col ${selectedPartner ? 'hidden md:flex' : 'flex'}`}>
                    <div className="p-4 border-b border-main bg-main/50">
                        <h2 className="text-sm font-semibold text-heading">
                            {user?.role === 'admin' ? 'Conversations' : 'Available Admins'}
                        </h2>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {user?.role === 'admin' ? (
                            <AdminInbox onSelectConversation={(u) => setSelectedPartner(u)} />
                        ) : (
                            <div className="flex flex-col">
                                {admins.map((admin) => (
                                    <button
                                        key={admin._id}
                                        onClick={() => setSelectedPartner(admin)}
                                        className={`flex items-center gap-3 px-4 py-3.5 hover:bg-main transition-colors text-left w-full ${selectedPartner?._id === admin._id ? 'bg-main border-l-2 border-accent-primary' : ''}`}
                                    >
                                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                                            {admin.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-primary truncate">{admin.name}</p>
                                            <p className="text-xs text-muted truncate">Admin Support</p>
                                        </div>
                                    </button>
                                ))}
                                {admins.length === 0 && !loading && (
                                    <div className="p-8 text-center text-slate-500 text-sm">
                                        No admins found.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className={`flex-1 flex flex-col ${selectedPartner ? 'flex' : 'hidden md:flex'}`}>
                    {selectedPartner ? (
                        <MessageThread
                            partnerId={String(selectedPartner._id)}
                            partnerName={selectedPartner.name}
                            onBack={() => setSelectedPartner(null)}
                        />
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-muted gap-3">
                            <div className="h-16 w-16 rounded-full bg-main flex items-center justify-center">
                                <MessageCircle size={32} className="text-muted" />
                            </div>
                            <p>Select a {user?.role === 'admin' ? 'conversation' : 'admin'} to start chatting</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
