import { createContext, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();

    useEffect(() => {
        if (!user) return;

        const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
            auth: { token: localStorage.getItem('token') }
        });

        socket.on('connect', () => {
            console.log('Connected to notification socket');
        });

        socket.on('leave_status_update', (data) => {
            toast(data.message, {
                icon: data.status === 'Approved' ? '✅' : '❌',
                duration: 6000,
            });
            // You could also trigger a re-fetch of leaves here if needed
        });

        return () => socket.disconnect();
    }, [user]);

    return (
        <NotificationContext.Provider value={{}}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);
