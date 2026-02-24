const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendEmail = async (options) => {
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: options.email,
        subject: options.subject,
        html: options.message,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${options.email}`);
    } catch (error) {
        console.error('Email send error:', error);
    }
};

const sendLeaveStatusEmail = async (user, leave, status) => {
    let subject, message;

    if (status === 'Approved') {
        subject = 'Leave Request Approved';
        message = `
            <h3>Hello ${user.name},</h3>
            <p>Your leave request for <b>${leave.leaveType}</b> from <b>${new Date(leave.startDate).toDateString()}</b> to <b>${new Date(leave.endDate).toDateString()}</b> has been <b>APPROVED</b>.</p>
            <p>Total Days: ${leave.totalDays}</p>
            <p>Best regards,<br/>HR Team</p>
        `;
    } else if (status === 'Rejected') {
        subject = 'Leave Request Rejected';
        message = `
            <h3>Hello ${user.name},</h3>
            <p>Your leave request for <b>${leave.leaveType}</b> from <b>${new Date(leave.startDate).toDateString()}</b> to <b>${new Date(leave.endDate).toDateString()}</b> has been <b>REJECTED</b>.</p>
            <p>Reason for rejection: ${leave.reviewComment || 'Not specified'}</p>
            <p>Best regards,<br/>HR Team</p>
        `;
    }

    if (subject && message) {
        await sendEmail({
            email: user.email,
            subject,
            message,
        });
    }
};

module.exports = {
    sendEmail,
    sendLeaveStatusEmail,
};
