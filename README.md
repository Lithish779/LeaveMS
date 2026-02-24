# 🏢 Employee Leave Management System

A full-stack HR leave management system where employees apply for leave, managers approve/reject, and admins manage users and permissions.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Routing | React Router v7 |
| State | Context API + LocalStorage |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Auth | JWT (JSON Web Tokens) |
| Charts | Chart.js + react-chartjs-2 |
| Icons | Lucide React |
| Toasts | React Hot Toast |

---

## 📁 Folder Structure

```
employee/
├── backend/
│   ├── config/          # MongoDB connection
│   ├── controllers/     # Business logic (auth, leave, user)
│   ├── middleware/       # JWT protect + role authorize
│   ├── models/          # Mongoose schemas (User, Leave)
│   ├── routes/          # Express routers
│   ├── .env             # Environment variables
│   └── server.js        # Entry point
│
└── frontend/
    └── src/
        ├── components/  # Shared UI (Sidebar, LeaveCard, StatusBadge…)
        ├── context/     # AuthContext (global auth state)
        ├── pages/
        │   ├── employee/ # Dashboard, ApplyLeave, MyLeaves
        │   ├── manager/  # ManagerDashboard, PendingApprovals, AllLeaves
        │   └── admin/    # AdminDashboard, UserManagement, AdminAllLeaves
        ├── utils/        # Axios instance with JWT interceptor
        └── App.jsx       # Router + route guards
```

---

## 🔐 Roles & Permissions

| Feature | Employee | Manager | Admin |
|---------|----------|---------|-------|
| Apply for leave | ✅ | ❌ | ❌ |
| View own leaves | ✅ | ❌ | ❌ |
| Cancel pending leave | ✅ | ❌ | ❌ |
| View pending requests | ❌ | ✅ | ✅ |
| Approve / Reject leave | ❌ | ✅ | ✅ |
| View leave stats + charts | ❌ | ✅ | ✅ |
| Manage all users | ❌ | ❌ | ✅ |
| View all leave records | ❌ | ❌ | ✅ |

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB (local or [Atlas](https://cloud.mongodb.com))

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd employee
```

### 2. Backend setup
```bash
cd backend
npm install
```

Edit `.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/employee_leave_db
JWT_SECRET=your_super_secret_jwt_key_change_in_production_2024
JWT_EXPIRE=7d
```

Start the backend:
```bash
npm run dev     # Development (auto-restarts)
npm start       # Production
```

### 3. Frontend setup
```bash
cd ../frontend
npm install
npm run dev
```

Frontend runs at: **http://localhost:5173**
Backend API at: **http://localhost:5000/api**

---

## 🌐 API Endpoints

### Auth
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login, get JWT |
| GET | `/api/auth/me` | Protected | Get current user |

### Leaves
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/leaves` | Employee | Apply for leave |
| GET | `/api/leaves/my` | Employee | My leaves |
| DELETE | `/api/leaves/:id` | Employee | Cancel pending leave |
| GET | `/api/leaves/pending` | Manager, Admin | Pending leaves |
| GET | `/api/leaves/stats` | Manager, Admin | Stats for charts |
| PUT | `/api/leaves/:id/review` | Manager, Admin | Approve/Reject |
| GET | `/api/leaves` | Admin | All leaves |

### Users (Admin only)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/users` | All users |
| GET | `/api/users/:id` | Single user |
| PUT | `/api/users/:id` | Update role/dept/status |
| DELETE | `/api/users/:id` | Delete user |

---

## ✨ Features

- 🔒 JWT-based authentication with localStorage persistence
- 🎭 Role-based dashboards (Employee / Manager / Admin)
- 📋 Apply leave with type selector, date range, day preview
- ✅ Approve / Reject with optional review comments
- 📊 Analytics charts (Doughnut + Bar via Chart.js)
- 🏷️ Status badges (Pending / Approved / Rejected)
- 👤 Admin user table with inline role/department editing
- 🔔 Toast notifications for all actions
- ⚡ Loading + error states throughout
- 🚫 Overlap detection prevents double-booking
