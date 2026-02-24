const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema(
    {
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        leaveType: {
            type: String,
            enum: ['Annual', 'Sick', 'Casual', 'Unpaid'],
            required: [true, 'Leave type is required'],
        },
        startDate: {
            type: Date,
            required: [true, 'Start date is required'],
        },
        endDate: {
            type: Date,
            required: [true, 'End date is required'],
        },
        reason: {
            type: String,
            required: [true, 'Reason is required'],
            trim: true,
            maxlength: [500, 'Reason cannot exceed 500 characters'],
        },
        status: {
            type: String,
            enum: ['Pending', 'Approved', 'Rejected'],
            default: 'Pending',
        },
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        reviewComment: {
            type: String,
            default: '',
            trim: true,
        },
        totalDays: {
            type: Number,
        },
    },
    { timestamps: true }
);

// Auto-calculate total days before saving
leaveSchema.pre('save', function () {
    if (this.startDate && this.endDate) {
        const diff = Math.ceil(
            (this.endDate - this.startDate) / (1000 * 60 * 60 * 24)
        ) + 1;
        this.totalDays = diff > 0 ? diff : 1;
    }
});

module.exports = mongoose.model('Leave', leaveSchema);
