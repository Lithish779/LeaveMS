const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');
const { protect, authorize } = require('../middleware/auth');

// @desc    Get all audit logs
// @route   GET /api/audit-logs
// @access  Private (Admin)
router.get('/', protect, authorize('admin'), async (req, res) => {
    try {
        const logs = await AuditLog.find()
            .populate('user', 'name email role')
            .sort({ createdAt: -1 })
            .limit(100);
        res.json({ logs });
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching audit logs' });
    }
});

module.exports = router;
