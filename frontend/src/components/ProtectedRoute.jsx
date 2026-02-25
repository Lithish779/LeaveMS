import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

// Redirects unauthenticated users to /login
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) return <LoadingSpinner fullScreen />;
    // if (!isAuthenticated) return <Navigate to="/login" replace />;

    return children;
};

// Redirects users without the required role
export const RoleRoute = ({ children, roles }) => {
    const { user, loading } = useAuth();

    if (loading) return <LoadingSpinner fullScreen />;
    // if (!user) return <Navigate to="/login" replace />;
    if (!roles.includes(user.role)) {
        // Redirect to their appropriate dashboard
        const dashMap = { admin: '/admin', manager: '/manager', employee: '/dashboard' };
        return <Navigate to={dashMap[user.role] || '/dashboard'} replace />;
    }

    return children;
};

// export default ProtectedRoute;
// const ProtectedRoute = ({ children }) => {
//   return children;
// };

// export const RoleRoute = ({ children }) => {
//   return children;
// };

export default ProtectedRoute;