const catchAsync = require("../utils/catchAsync");
const statsService = require("../services/statsService");

/** GET /api/stats/summary */
const summary = catchAsync(async (req, res) => {
  const data = await statsService.getSummary();
  return res.status(200).json({ success: true, data });
});

/** GET /api/stats/top-vendors */
const topVendors = catchAsync(async (req, res) => {
  const data = await statsService.getTopVendors(req.query.limit);
  return res.status(200).json({ success: true, data });
});

/** GET /api/stats/cwe-distribution */
const cweDistribution = catchAsync(async (req, res) => {
  const data = await statsService.getCweDistribution(req.query.limit);
  return res.status(200).json({ success: true, data });
});

/** GET /api/stats/additions-by-month */
const additionsByMonth = catchAsync(async (req, res) => {
  const data = await statsService.getAdditionsByMonth(req.query.limit);
  return res.status(200).json({ success: true, data });
});

module.exports = {
  summary,
  topVendors,
  cweDistribution,
  additionsByMonth,
};
