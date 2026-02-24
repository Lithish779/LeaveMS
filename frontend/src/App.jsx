import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute, { RoleRoute } from './components/ProtectedRoute';
import Layout from './components/Layout';

// Public pages
import Login from './pages/Login';
import Register from './pages/Register';

// Employee pages
import EmployeeDashboard from './pages/employee/Dashboard';
import ApplyLeave from './pages/employee/ApplyLeave';
import MyLeaves from './pages/employee/MyLeaves';
import ReimbursementDashboard from './pages/employee/ReimbursementDashboard';
import ReimbursementForm from './pages/employee/ReimbursementForm';

// Manager pages
import ManagerDashboard from './pages/manager/ManagerDashboard';
import PendingApprovals from './pages/manager/PendingApprovals';
import AllLeaves from './pages/manager/AllLeaves';
import TeamCalendar from './pages/manager/TeamCalendar';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import AdminAllLeaves from './pages/admin/AdminAllLeaves';
import AdminApprovals from './pages/admin/AdminApprovals';
import AuditLog from './pages/admin/AuditLog';
import ApprovalDashboard from './pages/admin/ApprovalDashboard';
import AllExpenses from './pages/admin/AllExpenses';

// Chat page
import ChatPage from './pages/ChatPage';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ChatProvider>
          <BrowserRouter>
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: '#1e293b',
                  color: '#f1f5f9',
                  border: '1px solid #334155',
                  borderRadius: '10px',
                  fontSize: '14px',
                },
                success: { iconTheme: { primary: '#10b981', secondary: '#1e293b' } },
                error: { iconTheme: { primary: '#ef4444', secondary: '#1e293b' } },
              }}
            />

            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected layout routes */}
              <Route
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                {/* Common protected routes */}
                <Route
                  path="/chat"
                  element={
                    <RoleRoute roles={['admin', 'employee']}>
                      <ChatPage />
                    </RoleRoute>
                  }
                />

                {/* Employee */}
                <Route
                  path="/dashboard"
                  element={
                    <RoleRoute roles={['employee', 'admin', 'manager']}>
                      <EmployeeDashboard />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/apply-leave"
                  element={<RoleRoute roles={['employee']}><ApplyLeave /></RoleRoute>}
                />
                <Route
                  path="/my-leaves"
                  element={<RoleRoute roles={['employee']}><MyLeaves /></RoleRoute>}
                />
                <Route path="/reimbursements" element={<RoleRoute roles={['employee', 'admin']}><ReimbursementDashboard /></RoleRoute>} />
                <Route path="/reimbursements/new" element={<RoleRoute roles={['employee']}><ReimbursementForm /></RoleRoute>} />
                <Route path="/reimbursements/edit/:id" element={<RoleRoute roles={['employee']}><ReimbursementForm /></RoleRoute>} />

                {/* Manager */}
                <Route
                  path="/manager"
                  element={<RoleRoute roles={['manager']}><ManagerDashboard /></RoleRoute>}
                />
                <Route
                  path="/manager/approvals"
                  element={<RoleRoute roles={['manager']}><PendingApprovals /></RoleRoute>}
                />
                <Route
                  path="/manager/all-leaves"
                  element={<RoleRoute roles={['manager']}><AllLeaves /></RoleRoute>}
                />
                <Route
                  path="/manager/calendar"
                  element={<RoleRoute roles={['manager']}><TeamCalendar /></RoleRoute>}
                />

                {/* Admin */}
                <Route
                  path="/admin"
                  element={<RoleRoute roles={['admin']}><AdminDashboard /></RoleRoute>}
                />
                <Route
                  path="/admin/users"
                  element={<RoleRoute roles={['admin']}><UserManagement /></RoleRoute>}
                />
                <Route
                  path="/admin/leaves"
                  element={<RoleRoute roles={['admin']}><AdminAllLeaves /></RoleRoute>}
                />
                <Route
                  path="/admin/approvals"
                  element={<RoleRoute roles={['admin']}><AdminApprovals /></RoleRoute>}
                />
                <Route
                  path="/admin/audit-logs"
                  element={<RoleRoute roles={['admin']}><AuditLog /></RoleRoute>}
                />
                <Route
                  path="/approvals/reimbursements"
                  element={<RoleRoute roles={['manager', 'finance', 'admin']}><ApprovalDashboard /></RoleRoute>}
                />
                <Route
                  path="/all-expenses"
                  element={<RoleRoute roles={['manager', 'finance', 'admin']}><AllExpenses /></RoleRoute>}
                />
              </Route>

              {/* Catch-all redirect */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </ChatProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
