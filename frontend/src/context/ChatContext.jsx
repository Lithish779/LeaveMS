import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import api from '../utils/api';

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
    const { user, token } = useAuth();
    const socketRef = useRef(null);

    // messages: { [partnerId]: Message[] }
    const [messages, setMessages] = useState({});
    // unread counts: { [senderId]: number }
    const [unreadCounts, setUnreadCounts] = useState({});
    // online status: { [userId]: boolean }
    const [onlineUsers, setOnlineUsers] = useState({});

    const totalUnread = Object.values(unreadCounts).reduce((a, b) => a + b, 0);

    // Connect socket when user is logged in
    useEffect(() => {
        if (!user || !token) return;

        const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000', {
            auth: { token },
            transports: ['websocket', 'polling'],
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('[Chat] Connected:', socket.id);
        });

        socket.on('receive_message', (message) => {
            const partnerId = String(message.sender._id) === String(user._id)
                ? String(message.receiver._id)
                : String(message.sender._id);

            setMessages((prev) => ({
                ...prev,
                [partnerId]: [...(prev[partnerId] || []), message],
            }));

            // Increment unread if the message is FROM someone else
            if (String(message.sender._id) !== String(user._id)) {
                setUnreadCounts((prev) => ({
                    ...prev,
                    [String(message.sender._id)]: (prev[String(message.sender._id)] || 0) + 1,
                }));
            }
        });

        socket.on('user_status', ({ userId, online }) => {
            setOnlineUsers((prev) => ({ ...prev, [userId]: online }));
        });

        socket.on('messages_read', ({ by }) => {
            // Our messages to 'by' were read — could update read receipt UI here
        });

        socket.on('connect_error', (err) => {
            console.error('[Chat] Connection error:', err.message);
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [user, token]);

    // Load message history from REST API for a given partner
    const loadHistory = useCallback(async (partnerId) => {
        try {
            const { data } = await api.get(`/chat/${partnerId}`);
            setMessages((prev) => ({ ...prev, [partnerId]: data.messages }));
            // Clear unread for this partner
            setUnreadCounts((prev) => ({ ...prev, [partnerId]: 0 }));
        } catch (err) {
            console.error('[Chat] Failed to load history:', err);
        }
    }, []);

    // Send a message via socket
    const sendMessage = useCallback((receiverId, content) => {
        if (!socketRef.current?.connected) return;
        socketRef.current.emit('send_message', { receiverId, content });
    }, []);

    // Mark messages from a sender as read
    const markRead = useCallback((senderId) => {
        setUnreadCounts((prev) => ({ ...prev, [senderId]: 0 }));
        socketRef.current?.emit('mark_read', { senderId });
    }, []);

    return (
        <ChatContext.Provider value={{
            messages,
            unreadCounts,
            totalUnread,
            onlineUsers,
            sendMessage,
            loadHistory,
            markRead,
        }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    const ctx = useContext(ChatContext);
    if (!ctx) throw new Error('useChat must be used within ChatProvider');
    return ctx;
};
