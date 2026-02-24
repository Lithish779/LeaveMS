const User = require('../models/User');
const Leave = require('../models/Leave');

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin/Employee)
const getAllUsers = async (req, res) => {
    try {
        let filter = {};

        // If employee is calling, they only see admins for chat purposes
        if (req.user.role === 'employee') {
            filter = { role: 'admin' };
        }

        const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
        res.json({ users });
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching users' });
    }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private (Admin)
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ user });
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching user' });
    }
};

// @desc    Update user role or status
// @route   PUT /api/users/:id
// @access  Private (Admin)
const updateUser = async (req, res) => {
    try {
        const { role, department, isActive } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) return res.status(404).json({ message: 'User not found' });

        // Prevent admin from deactivating themselves
        if (req.user._id.toString() === req.params.id && isActive === false) {
            return res.status(400).json({ message: 'You cannot deactivate your own account' });
        }

        if (role) user.role = role;
        if (department) user.department = department;
        if (isActive !== undefined) user.isActive = isActive;

        await user.save();
        res.json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                isActive: user.isActive,
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error updating user' });
    }
};

// @desc    Delete a user (admin only)
// @route   DELETE /api/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res) => {
    try {
        if (req.user._id.toString() === req.params.id) {
            return res.status(400).json({ message: 'You cannot delete your own account' });
        }

        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Also remove leaves
        await Leave.deleteMany({ employee: req.params.id });

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error deleting user' });
    }
};

module.exports = { getAllUsers, getUserById, updateUser, deleteUser };
