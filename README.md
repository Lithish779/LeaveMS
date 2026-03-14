<h1 align="center">🏢 Employee Leave Management System</h1>

<p align="center">
  <img src=".github/assets/logo.png" width="150" alt="Employee Leave MS Logo">
</p>

<p align="center">
  <i>Simplify, Track, and Manage HR Leave Operations with Ease and Precision.</i>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Deployment-Live-success?style=for-the-badge&logo=vercel" alt="Deployment">
  <img src="https://img.shields.io/badge/Version-1.0.0-blue?style=for-the-badge" alt="Version">
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" alt="License">
</p>

---

## 🚀 Languages and Tools...

<p align="left">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js">
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB">
</p>

<p align="left">
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind">
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/Lucide-2C3E50?style=for-the-badge&logo=lucide&logoColor=white" alt="Lucide">
</p>

<p align="left">
  <img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.io">
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=json-web-tokens&logoColor=white" alt="JWT">
  <img src="https://img.shields.io/badge/Postman-FF6C37?style=for-the-badge&logo=postman&logoColor=white" alt="Postman">
  <img src="https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white" alt="Git">
  <img src="https://img.shields.io/badge/NPM-%23CB3837.svg?style=for-the-badge&logo=npm&logoColor=white" alt="NPM">
</p>

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


Website runs  at: **https://leave-ms-cyan.vercel.app/**

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
