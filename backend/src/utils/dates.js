/**
 * CISA JSON dates "YYYY-MM-DD" -> UTC midnight Date (timezone shift avoid).
 */
function parseCatalogDate(value) {
  if (value == null || value === "") {
    return null;
  }
  const dateString = String(value).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return null;
  }
  const asDate = new Date(dateString + "T00:00:00.000Z");
  return Number.isNaN(asDate.getTime()) ? null : asDate;
}

/** dateTo inclusive — end of that UTC day. */
function endOfUtcDay(value) {
  const startOfDay = parseCatalogDate(value);
  if (!startOfDay) {
    return null;
  }
  const endOfDay = new Date(startOfDay);
  endOfDay.setUTCHours(23, 59, 59, 999);
  return endOfDay;
}

module.exports = { parseCatalogDate, endOfUtcDay };
