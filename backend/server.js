require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const connectDB = require('./config/db');
const Message = require('./models/Message');
const User = require('./models/User');

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

const ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
    'http://localhost:3000',
];

// ─── Express Middleware ────────────────────────────────────────────────────────
app.use(cors({ origin: ALLOWED_ORIGINS, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ─── Socket.io Setup ──────────────────────────────────────────────────────────
const io = new Server(server, {
    cors: { origin: ALLOWED_ORIGINS, methods: ['GET', 'POST'], credentials: true },
});

// Middleware: authenticate socket connections via JWT
io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth?.token;
        if (!token) return next(new Error('Authentication required'));

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        if (!user || !user.isActive) return next(new Error('User not found or inactive'));

        socket.user = user;
        next();
    } catch {
        next(new Error('Invalid token'));
    }
});

// Track online users: userId → socketId
const onlineUsers = new Map();

io.on('connection', (socket) => {
    const userId = String(socket.user._id);
    onlineUsers.set(userId, socket.id);

    // Join personal room so admin can target messages to this user
    socket.join(`room_${userId}`);
    console.log(`✅ [Socket] ${socket.user.name} (${socket.user.role}) connected`);

    // Emit online status to all
    io.emit('user_status', { userId, online: true });

    // ── send_message ─────────────────────────────────────────────────────────
    socket.on('send_message', async ({ receiverId, content }) => {
        try {
            if (!receiverId || !content?.trim()) return;

            const receiver = await User.findById(receiverId).select('name role');
            if (!receiver) return;

            // Only allow admin↔employee conversations
            const roles = [socket.user.role, receiver.role];
            if (!roles.includes('admin')) return;

            const message = await Message.create({
                sender: socket.user._id,
                receiver: receiverId,
                content: content.trim(),
            });

            await message.populate('sender', 'name role');
            await message.populate('receiver', 'name role');

            const payload = message.toObject();

            // Deliver to receiver's room
            io.to(`room_${receiverId}`).emit('receive_message', payload);
            // Confirm back to sender
            socket.emit('receive_message', payload);
        } catch (err) {
            console.error('[Socket] send_message error:', err);
        }
    });

    // ── mark_read ─────────────────────────────────────────────────────────────
    socket.on('mark_read', async ({ senderId }) => {
        try {
            await Message.updateMany(
                { sender: senderId, receiver: socket.user._id, read: false },
                { $set: { read: true } }
            );
            // Notify the sender their messages were read
            io.to(`room_${senderId}`).emit('messages_read', { by: userId });
        } catch (err) {
            console.error('[Socket] mark_read error:', err);
        }
    });

    // ── disconnect ────────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
        onlineUsers.delete(userId);
        io.emit('user_status', { userId, online: false });
        console.log(`❌ [Socket] ${socket.user.name} disconnected`);
    });
});

// ─── REST Routes ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) =>
    res.json({ status: 'ok', message: 'Employee Leave API is running' })
);

app.use('/api/auth', require('./routes/auth'));
app.use('/api/leaves', require('./routes/leaves'));
app.use('/api/users', require('./routes/users'));
app.use('/api/chat', require('./routes/chat'));

// ─── Error Handlers ───────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
