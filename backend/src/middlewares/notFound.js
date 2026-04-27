/** 404 for unmatched routes (after `/api` in `app.js`). */
function notFound(req, res) {
  return res.status(404).json({
    success: false,
    error: {
      message: `Route not found: ${req.method} ${req.originalUrl}`,
    },
  });
}

module.exports = notFound;
