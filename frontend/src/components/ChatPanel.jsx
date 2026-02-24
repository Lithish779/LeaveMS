import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import api from '../utils/api';
import { MessageCircle, X, Send, ChevronLeft, Circle } from 'lucide-react';

const formatTime = (date) =>
    new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

// ── Bubble ────────────────────────────────────────────────────────────────────
const Bubble = ({ message, isOwn }) => (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-1.5`}>
        <div
            className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${isOwn
                    ? 'bg-indigo-600 text-white rounded-br-sm'
                    : 'bg-slate-700 text-slate-100 rounded-bl-sm'
                }`}
        >
            <p>{message.content}</p>
            <p className={`text-[10px] mt-1 ${isOwn ? 'text-indigo-200' : 'text-slate-400'} text-right`}>
                {formatTime(message.createdAt)}
            </p>
        </div>
    </div>
);

// ── Message Thread ────────────────────────────────────────────────────────────
const MessageThread = ({ partnerId, partnerName, onBack }) => {
    const { user } = useAuth();
    const { messages, sendMessage, loadHistory, markRead, onlineUsers } = useChat();
    const [input, setInput] = useState('');
    const bottomRef = useRef(null);
    const threadMessages = messages[partnerId] || [];
    const isOnline = onlineUsers[partnerId];

    useEffect(() => {
        loadHistory(partnerId);
        markRead(partnerId);
    }, [partnerId, loadHistory, markRead]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [threadMessages.length]);

    const handleSend = () => {
        const trimmed = input.trim();
        if (!trimmed) return;
        sendMessage(partnerId, trimmed);
        setInput('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-700 bg-slate-800/50">
                {onBack && (
                    <button onClick={onBack} className="text-slate-400 hover:text-white p-1">
                        <ChevronLeft size={18} />
                    </button>
                )}
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                    {partnerName?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{partnerName}</p>
                    <div className="flex items-center gap-1">
                        <Circle size={6} className={isOnline ? 'text-emerald-400 fill-emerald-400' : 'text-slate-500 fill-slate-500'} />
                        <span className="text-xs text-slate-400">{isOnline ? 'Online' : 'Offline'}</span>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-0.5">
                {threadMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 gap-2">
                        <MessageCircle size={32} className="text-slate-600" />
                        <p className="text-sm">No messages yet. Say hello! 👋</p>
                    </div>
                ) : (
                    threadMessages.map((msg) => (
                        <Bubble
                            key={msg._id || Math.random()}
                            message={msg}
                            isOwn={String(msg.sender._id || msg.sender) === String(user._id)}
                        />
                    ))
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-3 py-3 border-t border-slate-700 flex items-end gap-2">
                <textarea
                    rows={1}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message... (Enter to send)"
                    className="flex-1 bg-slate-700 text-slate-100 placeholder-slate-400 text-sm rounded-xl px-4 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 max-h-28 leading-relaxed"
                    style={{ overflow: 'hidden' }}
                />
                <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="h-10 w-10 flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex-shrink-0"
                >
                    <Send size={16} />
                </button>
            </div>
        </div>
    );
};

// ── Admin Inbox List ──────────────────────────────────────────────────────────
const AdminInbox = ({ onSelectConversation }) => {
    const { unreadCounts, onlineUsers } = useChat();
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchConversations = async () => {
        try {
            const { data } = await api.get('/chat/conversations');
            setConversations(data.conversations);
        } catch {
            // silence
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConversations();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                Loading conversations...
            </div>
        );
    }

    if (conversations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2 p-4 text-center">
                <MessageCircle size={32} className="text-slate-600" />
                <p className="text-sm">No conversations yet.</p>
                <p className="text-xs text-slate-600">Employees can message you from the Chat page.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col divide-y divide-slate-700/50">
            {conversations.map(({ user, lastMessage, unreadCount: serverUnread }) => {
                const liveUnread = unreadCounts[String(user._id)] ?? serverUnread;
                const isOnline = onlineUsers[String(user._id)];
                return (
                    <button
                        key={user._id}
                        onClick={() => onSelectConversation(user)}
                        className="flex items-center gap-3 px-4 py-3.5 hover:bg-slate-700/40 transition-colors text-left w-full"
                    >
                        <div className="relative flex-shrink-0">
                            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                                {user.name?.charAt(0).toUpperCase()}
                            </div>
                            {isOnline && (
                                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-slate-800" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-slate-100 truncate">{user.name}</p>
                                {liveUnread > 0 && (
                                    <span className="ml-2 flex-shrink-0 h-5 w-5 bg-indigo-600 text-white text-xs rounded-full flex items-center justify-center">
                                        {liveUnread}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-slate-400 truncate">
                                {lastMessage?.content || 'Start a conversation'}
                            </p>
                        </div>
                    </button>
                );
            })}
        </div>
    );
};

// ── Main ChatPanel ────────────────────────────────────────────────────────────
const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const ChatPanel = () => {
    const { user } = useAuth();
    const { totalUnread } = useChat();
    const [open, setOpen] = useState(false);
    // For employee: adminUser fetched once; for admin: selectedPartner from inbox
    const [adminUser, setAdminUser] = useState(null);
    const [selectedPartner, setSelectedPartner] = useState(null);

    // Fetch admin user for employee view
    useEffect(() => {
        if (user?.role === 'employee') {
            api.get('/users').then(({ data }) => {
                const admin = data.users?.find((u) => u.role === 'admin');
                if (admin) setAdminUser(admin);
            }).catch(() => { });
        }
    }, [user]);

    const partner = user?.role === 'employee' ? adminUser : selectedPartner;

    return (
        <>
            {/* Floating button */}
            <button
                onClick={() => setOpen((prev) => !prev)}
                className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-indigo-600 hover:bg-indigo-500 shadow-xl flex items-center justify-center text-white transition-all duration-200 hover:scale-105 active:scale-95"
                aria-label="Toggle chat"
            >
                {open ? <X size={22} /> : <MessageCircle size={22} />}
                {!open && totalUnread > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                        {totalUnread > 9 ? '9+' : totalUnread}
                    </span>
                )}
            </button>

            {/* Chat window */}
            {open && (
                <div className="fixed bottom-24 right-6 z-50 w-[360px] h-[520px] bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in">
                    {/* Panel header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-700">
                        <div className="flex items-center gap-2">
                            <MessageCircle size={16} className="text-indigo-400" />
                            <span className="text-white font-semibold text-sm">
                                {user?.role === 'admin' && !selectedPartner ? 'Messages' : 'Chat'}
                            </span>
                        </div>
                        <button
                            onClick={() => setOpen(false)}
                            className="text-slate-400 hover:text-white p-1 rounded transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-hidden">
                        {user?.role === 'admin' && !selectedPartner ? (
                            // Admin inbox
                            <div className="h-full overflow-y-auto">
                                <AdminInbox onSelectConversation={(u) => setSelectedPartner(u)} />
                            </div>
                        ) : partner ? (
                            // Conversation thread
                            <MessageThread
                                partnerId={String(partner._id)}
                                partnerName={partner.name}
                                onBack={user?.role === 'admin' ? () => setSelectedPartner(null) : undefined}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-500 text-sm gap-2">
                                <MessageCircle size={28} className="text-slate-600" />
                                <p>No admin found yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatPanel;
