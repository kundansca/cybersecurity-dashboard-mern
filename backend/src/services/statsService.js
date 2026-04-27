const Vulnerability = require("../models/Vulnerability");

/** Top-N stats endpoints: ?limit= clamp */
const TOP_DEFAULT = 10;
const TOP_MAX = 50;

function parseTopLimit(limitFromQuery) {
  const parsed = parseInt(String(limitFromQuery), 10);
  if (Number.isNaN(parsed) || parsed < 1) {
    return TOP_DEFAULT;
  }
  if (parsed > TOP_MAX) {
    return TOP_MAX;
  }
  return parsed;
}

/** Summary numbers via one `$facet` pipeline. */
async function getSummary() {
  const aggregationPipeline = [
    {
      $facet: {
        totals: [{ $count: "total" }],
        ransomware: [
          { $group: { _id: "$knownRansomwareCampaignUse", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ],
        catalog: [{ $group: { _id: "$catalogVersion" } }, { $limit: 5 }],
        dateBounds: [
          {
            $group: {
              _id: null,
              minAdded: { $min: "$dateAdded" },
              maxAdded: { $max: "$dateAdded" },
            },
          },
        ],
      },
    },
  ];

  const aggregationResult = await Vulnerability.aggregate(aggregationPipeline);
  const firstRow = aggregationResult[0];
  const total = firstRow?.totals?.[0]?.total ?? 0;

  return {
    totalVulnerabilities: total,
    byRansomwareCampaignUse: (firstRow?.ransomware ?? []).map((row) => ({
      value: row._id || "Unknown",
      count: row.count,
    })),
    catalogVersionsPresent: (firstRow?.catalog ?? []).map((c) => c._id).filter(Boolean),
    dateAddedRange: firstRow?.dateBounds?.[0]
      ? {
          min: firstRow.dateBounds[0].minAdded,
          max: firstRow.dateBounds[0].maxAdded,
        }
      : null,
  };
}

/** Vendor-wise counts (charts). */
async function getTopVendors(limitRaw) {
  const topN = parseTopLimit(limitRaw);

  const aggregationPipeline = [
    { $group: { _id: { $trim: { input: "$vendorProject" } }, count: { $sum: 1 } } },
    { $match: { _id: { $ne: "" } } },
    { $sort: { count: -1 } },
    { $limit: topN },
    { $project: { _id: 0, vendor: "$_id", count: 1 } },
  ];

  return Vulnerability.aggregate(aggregationPipeline);
}

/** CWE frequency — cwes array unwind. */
async function getCweDistribution(limitRaw) {
  const topN = parseTopLimit(limitRaw);

  const aggregationPipeline = [
    { $match: { cwes: { $exists: true, $ne: [] } } },
    { $unwind: "$cwes" },
    { $group: { _id: "$cwes", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: topN },
    { $project: { _id: 0, cwe: "$_id", count: 1 } },
  ];

  return Vulnerability.aggregate(aggregationPipeline);
}

/** Month-wise new entries (dateAdded). */
async function getAdditionsByMonth(limitRaw) {
  const topN = parseTopLimit(limitRaw);

  const aggregationPipeline = [
    { $match: { dateAdded: { $type: "date" } } },
    {
      $group: {
        _id: {
          year: { $year: "$dateAdded" },
          month: { $month: "$dateAdded" },
        },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        year: "$_id.year",
        month: "$_id.month",
        count: 1,
        sortKey: { $add: [{ $multiply: ["$_id.year", 100] }, "$_id.month"] },
      },
    },
    { $sort: { sortKey: -1 } },
    { $limit: topN },
    {
      $project: {
        period: {
          $concat: [
            { $toString: "$year" },
            "-",
            { $cond: [{ $lt: ["$month", 10] }, "0", ""] },
            { $toString: "$month" },
          ],
        },
        count: 1,
      },
    },
  ];

  return Vulnerability.aggregate(aggregationPipeline);
}

module.exports = {
  getSummary,
  getTopVendors,
  getCweDistribution,
  getAdditionsByMonth,
};
