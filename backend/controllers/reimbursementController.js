const Reimbursement = require('../models/Reimbursement');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');

// @desc    Create/Submit a reimbursement claim
// @route   POST /api/reimbursements
// @access  Private (Employee)
const applyReimbursement = async (req, res) => {
    try {
        const { title, items, status } = req.body;

        const reimbursement = await Reimbursement.create({
            employee: req.user._id,
            title,
            items,
            status: status || 'Draft',
        });

        await AuditLog.create({
            user: req.user._id,
            action: 'Apply Reimbursement',
            targetId: reimbursement._id,
            targetType: 'Reimbursement',
            details: `Applied for reimbursement: ${title}. Status: ${reimbursement.status}`
        });

        res.status(201).json({ reimbursement });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error applying for reimbursement' });
    }
};

// @desc    Get logged-in employee's reimbursements
// @route   GET /api/reimbursements/my
// @access  Private (Employee)
const getMyReimbursements = async (req, res) => {
    try {
        const reimbursements = await Reimbursement.find({ employee: req.user._id })
            .sort({ createdAt: -1 });
        res.json({ reimbursements });
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching reimbursements' });
    }
};

// @desc    Get pending reimbursements (for manager or finance)
// @route   GET /api/reimbursements/pending
// @access  Private (Manager, Finance, Admin)
const getPendingReimbursements = async (req, res) => {
    try {
        let filter = {};

        if (req.user.role === 'manager') {
            const deptEmployees = await User.find({ department: req.user.department }).select('_id');
            const deptIds = deptEmployees.map(e => e._id);
            filter = {
                employee: { $in: deptIds },
                status: 'Pending Manager'
            };
        } else if (req.user.role === 'finance') {
            filter = { status: 'Pending Finance' };
        } else if (req.user.role === 'admin') {
            filter = { status: { $in: ['Pending Manager', 'Pending Finance'] } };
        } else {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const reimbursements = await Reimbursement.find(filter)
            .populate('employee', 'name email department')
            .sort({ createdAt: -1 });
        res.json({ reimbursements });
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching pending reimbursements' });
    }
};

// @desc    Review (approve/reject) a reimbursement
// @route   PUT /api/reimbursements/:id/review
// @access  Private (Manager, Finance, Admin)
const reviewReimbursement = async (req, res) => {
    const { approved, comment } = req.body;

    try {
        const reimbursement = await Reimbursement.findById(req.params.id);

        if (!reimbursement) {
            return res.status(404).json({ message: 'Reimbursement not found' });
        }

        if (req.user.role === 'manager') {
            if (reimbursement.status !== 'Pending Manager') {
                return res.status(400).json({ message: 'Reimbursement not in pending manager state' });
            }
            reimbursement.managerApproval = {
                approved,
                approvedBy: req.user._id,
                comment,
                date: new Date(),
            };
            reimbursement.status = approved ? 'Pending Finance' : 'Rejected';
        } else if (req.user.role === 'finance') {
            if (reimbursement.status !== 'Pending Finance') {
                return res.status(400).json({ message: 'Reimbursement not in pending finance state' });
            }
            reimbursement.financeApproval = {
                approved,
                approvedBy: req.user._id,
                comment,
                date: new Date(),
            };
            reimbursement.status = approved ? 'Approved' : 'Rejected';
        } else if (req.user.role === 'admin') {
            // Admin can override or do both? Let's say Admin acts as either based on status
            if (reimbursement.status === 'Pending Manager') {
                reimbursement.managerApproval = { approved, approvedBy: req.user._id, comment, date: new Date() };
                reimbursement.status = approved ? 'Pending Finance' : 'Rejected';
            } else {
                reimbursement.financeApproval = { approved, approvedBy: req.user._id, comment, date: new Date() };
                reimbursement.status = approved ? 'Approved' : 'Rejected';
            }
        }

        await reimbursement.save();

        await AuditLog.create({
            user: req.user._id,
            action: `Review Reimbursement: ${reimbursement.status}`,
            targetId: reimbursement._id,
            targetType: 'Reimbursement',
            details: `Approval: ${approved}. Status set to ${reimbursement.status}. Comment: ${comment}`
        });

        res.json({ reimbursement });
    } catch (error) {
        console.error('Review Reimbursement Error:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: 'Server error reviewing reimbursement' });
    }
};

const updateReimbursement = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, items, status } = req.body;

        const reimbursement = await Reimbursement.findOne({ _id: id, employee: req.user._id });

        if (!reimbursement) {
            return res.status(404).json({ message: 'Reimbursement not found or unauthorized' });
        }

        if (reimbursement.status !== 'Draft') {
            return res.status(400).json({ message: 'Only drafts can be updated' });
        }

        reimbursement.title = title || reimbursement.title;
        reimbursement.items = items || reimbursement.items;
        reimbursement.status = status || reimbursement.status;

        await reimbursement.save();

        res.status(200).json({
            message: 'Reimbursement updated successfully',
            reimbursement,
        });
    } catch (error) {
        console.error('Update Reimbursement Error:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: error.message });
    }
};

const getAllReimbursements = async (req, res) => {
    try {
        const reimbursements = await Reimbursement.find()
            .populate('employee', 'name department')
            .populate('managerApproval.approvedBy', 'name')
            .populate('financeApproval.approvedBy', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({ reimbursements });
    } catch (error) {
        console.error('Get All Reimbursements Error:', error);
        res.status(500).json({ message: 'Server error fetching all reimbursements' });
    }
};

module.exports = {
    applyReimbursement,
    getMyReimbursements,
    getPendingReimbursements,
    reviewReimbursement,
    updateReimbursement,
    getAllReimbursements,
};
