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

        // 1. Calculate Total Days (Excluding Weekends and Holidays)
        const Holiday = require('../models/Holiday');
        const holidays = await Holiday.find({
            date: { $gte: start, $lte: end }
        });
        const holidayDates = holidays.map(h => h.date.toDateString());

        let totalDays = 0;
        let currentDate = new Date(start);
        while (currentDate <= end) {
            const dayOfWeek = currentDate.getDay();
            const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6); // 0 = Sunday, 6 = Saturday
            const isHoliday = holidayDates.includes(currentDate.toDateString());

            if (!isWeekend && !isHoliday) {
                totalDays++;
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }

        if (totalDays === 0) {
            return res.status(400).json({ message: 'Selected dates consist only of weekends and public holidays' });
        }

        // 2. Conflict Detection (Flag if >30% of same department is out)
        const User = require('../models/User');
        const deptEmployees = await User.countDocuments({ department: req.user.department, role: 'employee' });

        const overlappingLeaves = await Leave.find({
            status: { $in: ['Pending', 'PendingHR', 'Approved'] },
            $or: [{ startDate: { $lte: end }, endDate: { $gte: start } }],
        }).populate('employee');

        const deptOverlapCount = overlappingLeaves.filter(l =>
            l.employee && l.employee.department === req.user.department
        ).length;

        let conflictWarning = null;
        if (deptEmployees > 0 && (deptOverlapCount / deptEmployees) > 0.3) {
            conflictWarning = `Warning: More than 30% of your department (${req.user.department}) is likely to be away during this period.`;
        }

        // 3. Check for overlapping leaves for SAME employee
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
            totalDays,
            attachment: req.file ? req.file.path : null,
            status: 'Pending', // Initial status
        });

        await leave.populate('employee', 'name email department');

        // Audit Log entry
        const AuditLog = require('../models/AuditLog');
        await AuditLog.create({
            user: req.user._id,
            action: 'Apply Leave',
            targetId: leave._id,
            targetType: 'Leave',
            details: `Applied for ${totalDays} days of ${leaveType}. ${conflictWarning || ''}`
        });

        res.status(201).json({ leave, conflictWarning });
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
        let filter = { status: 'Pending' };

        if (req.user.role === 'manager') {
            const User = require('../models/User');
            const deptEmployees = await User.find({ department: req.user.department }).select('_id');
            const deptIds = deptEmployees.map(e => e._id);
            filter.employee = { $in: deptIds };
        }

        const leaves = await Leave.find(filter)
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

        if (req.user.role === 'manager') {
            const User = require('../models/User');
            const deptEmployees = await User.find({ department: req.user.department }).select('_id');
            const deptIds = deptEmployees.map(e => e._id);
            filter.employee = { $in: deptIds };
        }

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

    if (!['Approved', 'Rejected', 'PendingHR'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    try {
        const leave = await Leave.findById(req.params.id).populate('employee');

        if (!leave) {
            return res.status(404).json({ message: 'Leave not found' });
        }

        // Allow Manager to approve to 'PendingHR' or Reject
        // Allow Admin/HR to Approve finally
        if (req.user.role === 'manager' && status === 'Approved') {
            leave.status = 'PendingHR';
        } else {
            leave.status = status;
        }

        leave.reviewedBy = req.user._id;
        leave.reviewComment = reviewComment || '';
        await leave.save();

        await leave.populate('reviewedBy', 'name role');

        // Audit Log
        const AuditLog = require('../models/AuditLog');
        await AuditLog.create({
            user: req.user._id,
            action: `Review Leave: ${leave.status}`,
            targetId: leave._id,
            targetType: 'Leave',
            details: `Status set to ${leave.status}. Comment: ${reviewComment}`
        });

        // Send email notification on final Approve/Reject
        if (['Approved', 'Rejected'].includes(leave.status)) {
            const { sendLeaveStatusEmail } = require('../services/notificationService');
            await sendLeaveStatusEmail(leave.employee, leave, leave.status);

            // Real-time Socket.io Notification
            const io = req.app.get('socketio');
            if (io) {
                io.to(`room_${leave.employee._id}`).emit('leave_status_update', {
                    leaveId: leave._id,
                    status: leave.status,
                    message: `Your leave request for ${leave.leaveType} has been ${leave.status}.`
                });
            }
        }

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

// @desc    Bulk review (approve/reject) leaves
// @route   PUT /api/leaves/bulk-review
// @access  Private (Manager, Admin)
const bulkReview = async (req, res) => {
    const { leaveIds, status, reviewComment } = req.body;

    if (!Array.isArray(leaveIds) || leaveIds.length === 0) {
        return res.status(400).json({ message: 'No leave IDs provided' });
    }

    if (!['Approved', 'Rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    try {
        let query = { _id: { $in: leaveIds }, status: { $in: ['Pending', 'PendingHR'] } };

        if (req.user.role === 'manager') {
            const User = require('../models/User');
            const deptEmployees = await User.find({ department: req.user.department }).select('_id');
            const deptIds = deptEmployees.map(e => e._id);
            query.employee = { $in: deptIds };
        }

        const leaves = await Leave.find(query).populate('employee');

        if (leaves.length === 0) {
            return res.status(404).json({ message: 'No eligible leaves found in your department' });
        }

        const results = [];
        const { sendLeaveStatusEmail } = require('../services/notificationService');
        const AuditLog = require('../models/AuditLog');

        for (const leave of leaves) {
            if (req.user.role === 'manager' && status === 'Approved') {
                leave.status = 'PendingHR';
            } else {
                leave.status = status;
            }

            leave.reviewedBy = req.user._id;
            leave.reviewComment = reviewComment || 'Bulk review';
            await leave.save();

            // Audit
            await AuditLog.create({
                user: req.user._id,
                action: `Bulk Review Leave: ${leave.status}`,
                targetId: leave._id,
                targetType: 'Leave',
                details: `Bulk action status set to ${leave.status}.`
            });

            // Email
            if (['Approved', 'Rejected'].includes(leave.status)) {
                await sendLeaveStatusEmail(leave.employee, leave, leave.status);
            }

            results.push(leave._id);
        }

        res.json({ message: `Successfully reviewed ${results.length} leaves`, reviewedIds: results });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error in bulk review' });
    }
};

module.exports = {
    applyLeave,
    getMyLeaves,
    getPendingLeaves,
    getAllLeaves,
    reviewLeave,
    bulkReview,
    cancelLeave,
    getLeaveStats,
};
