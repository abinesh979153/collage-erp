const asyncHandler = require('../../utils/asyncHandler');
const { User } = require('../../models');

exports.summary = asyncHandler(async (_req, res) => {
  const [students, faculty, admins, activeAccounts] = await Promise.all([
    User.countDocuments({ role: 'student', isActive: true }),
    User.countDocuments({ role: 'faculty', isActive: true }),
    User.countDocuments({ role: 'admin', isActive: true }),
    User.countDocuments({ isActive: true }),
  ]);

  const cards = [
    { label: 'Students', value: students },
    { label: 'Faculty', value: faculty },
    { label: 'Admins', value: admins },
    { label: 'Active Accounts', value: activeAccounts },
  ];

  const series = [
    { name: 'Students', value: students },
    { name: 'Faculty', value: faculty },
    { name: 'Admins', value: admins },
  ];

  res.json({ data: { cards, series } });
});
