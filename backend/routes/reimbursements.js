const express = require('express');
const {
    applyReimbursement,
    getMyReimbursements,
    getPendingReimbursements,
    reviewReimbursement,
    updateReimbursement,
    getAllReimbursements,
} = require('../controllers/reimbursementController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Employee routes
router.get('/test', (req, res) => res.json({ message: 'Reimbursement routes active' }));
router.post('/', protect, applyReimbursement);
router.get('/my', protect, getMyReimbursements);
router.put('/:id', protect, updateReimbursement);

// Manager, Finance & Admin routes
router.get('/pending', protect, authorize('manager', 'finance', 'admin'), getPendingReimbursements);
router.get('/all', protect, authorize('admin', 'manager', 'finance'), getAllReimbursements);
router.put('/:id/review', protect, authorize('manager', 'finance', 'admin'), reviewReimbursement);

module.exports = router;
