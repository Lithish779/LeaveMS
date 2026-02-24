const express = require('express');
const { body } = require('express-validator');
const {
    applyLeave,
    getMyLeaves,
    getPendingLeaves,
    getAllLeaves,
    reviewLeave,
    bulkReview,
    cancelLeave,
    getLeaveStats,
} = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Bulk action
router.put('/bulk-review', protect, authorize('manager', 'admin'), bulkReview);

const upload = require('../middleware/upload');

// Employee routes
router.post(
    '/',
    protect,
    upload.single('attachment'),
    [
        body('leaveType')
            .isIn(['Annual', 'Sick', 'Casual', 'Unpaid', 'Earned', 'Maternity', 'Paternity'])
            .withMessage('Invalid leave type'),
        body('startDate').isISO8601().withMessage('Valid start date required'),
        body('endDate').isISO8601().withMessage('Valid end date required'),
        body('reason').trim().notEmpty().withMessage('Reason is required'),
    ],
    applyLeave
);
router.get('/my', protect, getMyLeaves);
router.delete('/:id', protect, cancelLeave);

// Manager & Admin routes
router.get('/pending', protect, authorize('manager', 'admin'), getPendingLeaves);
router.get('/all', protect, authorize('manager', 'admin'), getAllLeaves);
router.get('/stats', protect, authorize('manager', 'admin'), getLeaveStats);
router.put('/:id/review', protect, authorize('manager', 'admin'), reviewLeave);

// Admin only (paginated)
router.get('/', protect, authorize('admin'), getAllLeaves);

module.exports = router;
