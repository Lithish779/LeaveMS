const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        action: {
            type: String,
            required: true,
        },
        targetId: {
            type: mongoose.Schema.Types.ObjectId,
            required: false, // Can be a leave ID, user ID, etc.
        },
        targetType: {
            type: String,
            required: false, // e.g., 'Leave', 'User'
        },
        details: {
            type: String,
            default: '',
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);
