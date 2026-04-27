/** List APIs: default page size + hard cap on limit. */
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function parsePositiveInt(value, defaultValue) {
  const parsed = parseInt(String(value), 10);
  if (Number.isNaN(parsed) || parsed < 1) {
    return defaultValue;
  }
  return parsed;
}

/** req.query -> { page, limit, skip } */
function getPagination(query) {
  const page = parsePositiveInt(query.page, DEFAULT_PAGE);
  let limit = parsePositiveInt(query.limit, DEFAULT_LIMIT);
  if (limit > MAX_LIMIT) {
    limit = MAX_LIMIT;
  }
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

module.exports = {
  getPagination,
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MAX_LIMIT,
};
