const mongoose = require('mongoose');

const reimbursementItemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Item title is required'],
        trim: true,
    },
    category: {
        type: String,
        enum: ['Travel', 'Meals', 'Internet/Wifi', 'Medical', 'Office Supplies', 'Other'],
        required: [true, 'Category is required'],
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [0, 'Amount cannot be negative'],
    },
    currency: {
        type: String,
        default: 'INR',
    },
    date: {
        type: Date,
        required: [true, 'Date is required'],
    },
    receiptUrl: {
        type: String,
        default: '',
    },
});

const reimbursementSchema = new mongoose.Schema(
    {
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        title: {
            type: String,
            required: [true, 'Claim title is required'],
            trim: true,
        },
        items: [reimbursementItemSchema],
        totalAmount: {
            type: Number,
            default: 0,
        },
        status: {
            type: String,
            enum: ['Draft', 'Pending Manager', 'Pending Finance', 'Approved', 'Rejected'],
            default: 'Draft',
        },
        managerApproval: {
            approved: { type: Boolean, default: null },
            approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            comment: String,
            date: Date,
        },
        financeApproval: {
            approved: { type: Boolean, default: null },
            approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            comment: String,
            date: Date,
        },
    },
    { timestamps: true }
);

// Auto-calculate total amount before saving
reimbursementSchema.pre('save', function () {
    if (this.items && this.items.length > 0) {
        this.totalAmount = this.items.reduce((sum, item) => {
            const amt = parseFloat(item.amount) || 0;
            return sum + amt;
        }, 0);
    } else {
        this.totalAmount = 0;
    }
});

module.exports = mongoose.model('Reimbursement', reimbursementSchema);
