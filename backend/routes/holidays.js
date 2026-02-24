const express = require('express');
const { addHoliday, getHolidays, deleteHoliday } = require('../controllers/holidayController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', getHolidays);
router.post('/', protect, authorize('admin'), addHoliday);
router.delete('/:id', protect, authorize('admin'), deleteHoliday);

module.exports = router;
