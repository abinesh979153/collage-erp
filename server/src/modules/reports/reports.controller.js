const asyncHandler = require('../../utils/asyncHandler');
const reportsService = require('./reports.service');

exports.exportCsv = asyncHandler(async (req, res) => {
  const type = req.query.type;
  const csv = await reportsService.exportCsv(type);

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${type}.csv"`
  );
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).send(csv);
});
