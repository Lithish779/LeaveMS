const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters'],
            select: false,
        },
        role: {
            type: String,
            enum: ['employee', 'manager', 'admin', 'finance'],
            default: 'employee',
        },
        department: {
            type: String,
            default: 'General',
            trim: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        leaveBalances: {
            SL: { type: Number, default: 12 },
            CL: { type: Number, default: 12 },
            EL: { type: Number, default: 15 },
            ML: { type: Number, default: 0 },
            PL: { type: Number, default: 0 }
        },
        lastLeaveDate: {
            type: Date,
            default: null
        },
        joiningDate: {
            type: Date,
            default: Date.now
        },
    },
    { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match password method
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
