const cron = require('node-cron');
const User = require('../models/User');

// Accrual Logic: Automatically "credit" leave days to employees every month 
// (+1.5 days on the 1st of every month)
const startAccrualJob = () => {
    // Run on the 1st of every month at 00:00
    cron.schedule('0 0 1 * *', async () => {
        console.log('Running Monthly Leave Accrual Job...');
        try {
            // Update all employees: Add 1.5 days to Earned Leave (EL)
            const result = await User.updateMany(
                { role: 'employee', isActive: true },
                { $inc: { 'leaveBalances.EL': 1.5 } }
            );
            console.log(`Accrual completed. Updated ${result.modifiedCount} employees.`);
        } catch (error) {
            console.error('Error in accrual job:', error);
        }
    });

    // Burnout Alerts Logic: Flags employees who haven't taken leave in 4-6 months
    // Run weekly on Sunday at 01:00
    cron.schedule('0 1 * * 0', async () => {
        console.log('Running Burnout Alert Check...');
        try {
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

            const staleEmployees = await User.find({
                role: 'employee',
                isActive: true,
                $or: [
                    { lastLeaveDate: { $lt: sixMonthsAgo } },
                    { lastLeaveDate: null, joiningDate: { $lt: sixMonthsAgo } }
                ]
            });

            if (staleEmployees.length > 0) {
                console.log(`Burnout Alert: ${staleEmployees.length} employees haven't taken leave in 6 months.`);
            }
        } catch (error) {
            console.error('Error in burnout check:', error);
        }
    });
};

// Carry-Forward Rules: Run on January 1st at 00:01
const startCarryForwardJob = () => {
    cron.schedule('1 0 1 1 *', async () => {
        console.log('Running Year-end Carry-Forward Job...');
        try {
            const users = await User.find({ role: 'employee', isActive: true });

            for (const user of users) {
                // CL (Casual Leave) expires - reset to 12
                user.leaveBalances.CL = 12;

                // SL (Sick Leave) - reset to 12
                user.leaveBalances.SL = 12;

                // EL (Earned Leave) carries over - add 15 for new year
                user.leaveBalances.EL += 15;

                await user.save();
            }
            console.log('Carry-forward logic completed.');
        } catch (error) {
            console.error('Error in carry-forward job:', error);
        }
    });
};

module.exports = { startAccrualJob, startCarryForwardJob };
