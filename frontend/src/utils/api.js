import axios from 'axios';

// Replace 'http://localhost:5000' with your actual backend port if it's different
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('elms_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Handle 401 globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Only redirect if it's a 401 error AND we aren't already on the login page
        // This prevents infinite redirect loops during the login process itself
        if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
            console.error('Unauthorized! Clearing session and redirecting...');
            
            localStorage.removeItem('elms_token');
            localStorage.removeItem('elms_user');
            
            // Using replace to avoid back-button loops
            window.location.replace('/login');
        }
        return Promise.reject(error);
    }
);

export default api;