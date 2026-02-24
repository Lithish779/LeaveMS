import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // Restore session from localStorage on mount
    useEffect(() => {
        const storedToken = localStorage.getItem('elms_token');
        const storedUser = localStorage.getItem('elms_user');
        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = useCallback(({ token: newToken, user: newUser }) => {
        localStorage.setItem('elms_token', newToken);
        localStorage.setItem('elms_user', JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('elms_token');
        localStorage.removeItem('elms_user');
        setToken(null);
        setUser(null);
    }, []);

    const updateUser = useCallback((updatedUser) => {
        const merged = { ...user, ...updatedUser };
        localStorage.setItem('elms_user', JSON.stringify(merged));
        setUser(merged);
    }, [user]);

    const value = {
        user,
        token,
        loading,
        isAuthenticated: !!token,
        login,
        logout,
        updateUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};

export default AuthContext;
