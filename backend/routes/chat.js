const express = require('express');
const Message = require('../models/Message');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all conversations (admin sees list of employees + last message)
// @route   GET /api/chat/conversations
// @access  Private (Admin)
router.get('/conversations', protect, authorize('admin'), async (req, res) => {
    try {
        // Get all unique users who have chatted with admin
        const sentBy = await Message.distinct('sender', { receiver: req.user._id });
        const sentTo = await Message.distinct('receiver', { sender: req.user._id });

        // Merge unique employee IDs
        const allIds = [...new Set([...sentBy, ...sentTo].map(String))].filter(
            (id) => id !== String(req.user._id)
        );

        const conversations = await Promise.all(
            allIds.map(async (userId) => {
                const user = await User.findById(userId).select('name email department role');
                if (!user) return null;

                const lastMessage = await Message.findOne({
                    $or: [
                        { sender: userId, receiver: req.user._id },
                        { sender: req.user._id, receiver: userId },
                    ],
                })
                    .sort({ createdAt: -1 })
                    .lean();

                const unreadCount = await Message.countDocuments({
                    sender: userId,
                    receiver: req.user._id,
                    read: false,
                });

                return { user, lastMessage, unreadCount };
            })
        );

        res.json({ conversations: conversations.filter(Boolean) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching conversations' });
    }
});

// @desc    Get message history between current user and another user
// @route   GET /api/chat/:userId
// @access  Private
router.get('/:userId', protect, async (req, res) => {
    try {
        const { userId } = req.params;
        const me = req.user._id;

        const messages = await Message.find({
            $or: [
                { sender: me, receiver: userId },
                { sender: userId, receiver: me },
            ],
        })
            .populate('sender', 'name role')
            .populate('receiver', 'name role')
            .sort({ createdAt: 1 })
            .limit(100);

        // Mark received messages as read
        await Message.updateMany(
            { sender: userId, receiver: me, read: false },
            { $set: { read: true } }
        );

        res.json({ messages });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching messages' });
    }
});

module.exports = router;
