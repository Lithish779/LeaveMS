const Holiday = require('../models/Holiday');

// @desc    Add a public holiday
// @route   POST /api/holidays
// @access  Private (Admin)
const addHoliday = async (req, res) => {
    const { name, date, description } = req.body;

    try {
        const holiday = await Holiday.create({ name, date, description });
        res.status(201).json({ holiday });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Holiday already exists on this date' });
        }
        res.status(500).json({ message: 'Server error adding holiday' });
    }
};

// @desc    Get all public holidays
// @route   GET /api/holidays
// @access  Public
const getHolidays = async (req, res) => {
    try {
        const holidays = await Holiday.find().sort({ date: 1 });
        res.json({ holidays });
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching holidays' });
    }
};

// @desc    Delete a holiday
// @route   DELETE /api/holidays/:id
// @access  Private (Admin)
const deleteHoliday = async (req, res) => {
    try {
        const holiday = await Holiday.findById(req.params.id);
        if (!holiday) {
            return res.status(404).json({ message: 'Holiday not found' });
        }
        await holiday.deleteOne();
        res.json({ message: 'Holiday deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error deleting holiday' });
    }
};

module.exports = {
    addHoliday,
    getHolidays,
    deleteHoliday,
};
