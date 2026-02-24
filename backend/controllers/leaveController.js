const { validationResult } = require('express-validator');
const Leave = require('../models/Leave');

// @desc    Apply for leave
// @route   POST /api/leaves
// @access  Private (Employee)
const applyLeave = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { leaveType, startDate, endDate, reason } = req.body;

    try {
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (end < start) {
            return res.status(400).json({ message: 'End date must be after start date' });
        }

        // Check for overlapping leaves
        const overlap = await Leave.findOne({
            employee: req.user._id,
            status: { $ne: 'Rejected' },
            $or: [
                { startDate: { $lte: end }, endDate: { $gte: start } },
            ],
        });

        if (overlap) {
            return res.status(400).json({
                message: 'You already have a leave request overlapping those dates',
            });
        }

        const leave = await Leave.create({
            employee: req.user._id,
            leaveType,
            startDate: start,
            endDate: end,
            reason,
        });

        await leave.populate('employee', 'name email department');

        res.status(201).json({ leave });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error applying for leave' });
    }
};

// @desc    Get logged-in employee's leaves
// @route   GET /api/leaves/my
// @access  Private (Employee)
const getMyLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find({ employee: req.user._id })
            .populate('reviewedBy', 'name role')
            .sort({ createdAt: -1 });
        res.json({ leaves });
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching leaves' });
    }
};

// @desc    Get all pending leaves (for manager)
// @route   GET /api/leaves/pending
// @access  Private (Manager, Admin)
const getPendingLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find({ status: 'Pending' })
            .populate('employee', 'name email department')
            .sort({ createdAt: -1 });
        res.json({ leaves });
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching pending leaves' });
    }
};

// @desc    Get all leaves (admin)
// @route   GET /api/leaves
// @access  Private (Admin)
const getAllLeaves = async (req, res) => {
    try {
        const { status, leaveType, page = 1, limit = 20 } = req.query;
        const filter = {};
        if (status) filter.status = status;
        if (leaveType) filter.leaveType = leaveType;

        const leaves = await Leave.find(filter)
            .populate('employee', 'name email department role')
            .populate('reviewedBy', 'name role')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await Leave.countDocuments(filter);

        res.json({ leaves, total, page: Number(page), pages: Math.ceil(total / limit) });
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching all leaves' });
    }
};

// @desc    Review (approve/reject) a leave
// @route   PUT /api/leaves/:id/review
// @access  Private (Manager, Admin)
const reviewLeave = async (req, res) => {
    const { status, reviewComment } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
        return res.status(400).json({ message: 'Status must be Approved or Rejected' });
    }

    try {
        const leave = await Leave.findById(req.params.id);

        if (!leave) {
            return res.status(404).json({ message: 'Leave not found' });
        }
        if (leave.status !== 'Pending') {
            return res.status(400).json({ message: 'Only pending leaves can be reviewed' });
        }

        leave.status = status;
        leave.reviewedBy = req.user._id;
        leave.reviewComment = reviewComment || '';
        await leave.save();

        await leave.populate('employee', 'name email department');
        await leave.populate('reviewedBy', 'name role');

        res.json({ leave });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error reviewing leave' });
    }
};

// @desc    Cancel/Delete own pending leave
// @route   DELETE /api/leaves/:id
// @access  Private (Employee)
const cancelLeave = async (req, res) => {
    try {
        const leave = await Leave.findById(req.params.id);

        if (!leave) {
            return res.status(404).json({ message: 'Leave not found' });
        }
        if (leave.employee.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to cancel this leave' });
        }
        if (leave.status !== 'Pending') {
            return res.status(400).json({ message: 'Only pending leaves can be cancelled' });
        }

        await leave.deleteOne();
        res.json({ message: 'Leave cancelled successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error cancelling leave' });
    }
};

// @desc    Get leave statistics
// @route   GET /api/leaves/stats
// @access  Private (Manager, Admin)
const getLeaveStats = async (req, res) => {
    try {
        const stats = await Leave.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                },
            },
        ]);

        const typeStats = await Leave.aggregate([
            {
                $group: {
                    _id: '$leaveType',
                    count: { $sum: 1 },
                },
            },
        ]);

        res.json({ statusStats: stats, typeStats });
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching stats' });
    }
};

module.exports = {
    applyLeave,
    getMyLeaves,
    getPendingLeaves,
    getAllLeaves,
    reviewLeave,
    cancelLeave,
    getLeaveStats,
};
