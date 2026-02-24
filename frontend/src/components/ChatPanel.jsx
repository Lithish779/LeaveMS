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
                ? 'bg-accent-primary text-white rounded-br-sm'
                : 'bg-main text-primary rounded-bl-sm border border-main'
                }`}
        >
            <p>{message.content}</p>
            <p className={`text-[10px] mt-1 ${isOwn ? 'text-blue-100 dark:text-indigo-200' : 'text-muted'} text-right`}>
                {formatTime(message.createdAt)}
            </p>
        </div>
    </div>
);

// ── Message Thread ────────────────────────────────────────────────────────────
export const MessageThread = ({ partnerId, partnerName, onBack }) => {
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
            <div className="flex items-center gap-3 px-4 py-3 border-b border-main bg-main/30">
                {onBack && (
                    <button onClick={onBack} className="text-muted hover:text-primary p-1">
                        <ChevronLeft size={18} />
                    </button>
                )}
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                    {partnerName?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-primary truncate">{partnerName}</p>
                    <div className="flex items-center gap-1">
                        <Circle size={6} className={isOnline ? 'text-emerald-500 fill-emerald-500' : 'text-muted fill-muted'} />
                        <span className="text-xs text-muted">{isOnline ? 'Online' : 'Offline'}</span>
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
            <div className="px-3 py-3 border-t border-main flex items-end gap-2">
                <textarea
                    rows={1}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    className="flex-1 bg-main text-primary placeholder-muted text-sm rounded-xl px-4 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-accent-primary max-h-28 leading-relaxed border border-main"
                    style={{ overflow: 'hidden' }}
                />
                <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="h-10 w-10 flex items-center justify-center bg-accent-primary hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-200 flex-shrink-0"
                >
                    <Send size={16} />
                </button>
            </div>
        </div>
    );
};

// ── Admin Inbox List ──────────────────────────────────────────────────────────
export const AdminInbox = ({ onSelectConversation }) => {
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
                        className="flex items-center gap-3 px-4 py-3.5 hover:bg-main transition-colors text-left w-full"
                    >
                        <div className="relative flex-shrink-0">
                            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                                {user.name?.charAt(0).toUpperCase()}
                            </div>
                            {isOnline && (
                                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-card" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-primary truncate">{user.name}</p>
                                {liveUnread > 0 && (
                                    <span className="ml-2 flex-shrink-0 h-5 w-5 bg-accent-primary text-white text-xs rounded-full flex items-center justify-center">
                                        {liveUnread}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-muted truncate">
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
    const [admins, setAdmins] = useState([]);
    const [selectedPartner, setSelectedPartner] = useState(null);
    const [loading, setLoading] = useState(false);

    // Fetch admins for employee view
    useEffect(() => {
        if (user?.role === 'employee' && open) {
            setLoading(true);
            api.get('/users').then(({ data }) => {
                const foundAdmins = data.users?.filter((u) => u.role === 'admin') || [];
                setAdmins(foundAdmins);
                if (foundAdmins.length === 1 && !selectedPartner) {
                    setSelectedPartner(foundAdmins[0]);
                }
            }).catch(() => { }).finally(() => setLoading(false));
        }
    }, [user, open, selectedPartner]);

    return (
        <>
            {/* Floating button */}
            <button
                onClick={() => setOpen((prev) => !prev)}
                className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-accent-primary hover:opacity-90 shadow-xl flex items-center justify-center text-white transition-all duration-200 hover:scale-105 active:scale-95"
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
                <div className="fixed bottom-24 right-6 z-50 w-[360px] h-[520px] bg-card border border-main rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in">
                    {/* Panel header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-main/50 border-b border-main">
                        <div className="flex items-center gap-2">
                            <MessageCircle size={16} className="text-accent-primary" />
                            <span className="text-heading font-semibold text-sm">
                                {user?.role === 'admin' && !selectedPartner ? 'Messages' : 'Chat'}
                            </span>
                        </div>
                        <button
                            onClick={() => setOpen(false)}
                            className="text-muted hover:text-primary p-1 rounded transition-colors"
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
                        ) : selectedPartner ? (
                            // Conversation thread
                            <MessageThread
                                partnerId={String(selectedPartner._id)}
                                partnerName={selectedPartner.name}
                                onBack={() => setSelectedPartner(null)}
                            />
                        ) : user?.role === 'employee' ? (
                            // Employee picking admin
                            <div className="h-full overflow-y-auto">
                                <div className="p-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Select Admin
                                </div>
                                {admins.map((admin) => (
                                    <button
                                        key={admin._id}
                                        onClick={() => setSelectedPartner(admin)}
                                        className="flex items-center gap-3 px-4 py-3 hover:bg-slate-700/40 transition-colors text-left w-full"
                                    >
                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold">
                                            {admin.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-100 truncate">{admin.name}</p>
                                        </div>
                                    </button>
                                ))}
                                {admins.length === 0 && !loading && (
                                    <div className="flex flex-col items-center justify-center h-full p-8 text-slate-500 text-sm gap-2">
                                        <MessageCircle size={24} className="text-slate-600" />
                                        <p>No admins found.</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-500 text-sm gap-2">
                                <MessageCircle size={28} className="text-slate-600" />
                                <p>Select a contact.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatPanel;
