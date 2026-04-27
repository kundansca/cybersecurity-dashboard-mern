const mongoose = require("mongoose");

/** Last middleware on the app. Use `next(err)` from routes/async code. */
function globalErrorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  let statusCode =
    err.statusCode ||
    err.status ||
    (err instanceof mongoose.Error.ValidationError ? 400 : null) ||
    (err instanceof mongoose.Error.CastError ? 400 : null) ||
    500;

  const isProduction = process.env.NODE_ENV === "production";

  const errorBody = {
    message: err.message || "Something went wrong on server",
  };

  if (!isProduction && err.stack) {
    errorBody.stack = err.stack;
  }

  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      error: {
        message: "Duplicate key: a record with this identifier already exists.",
        details: err.keyValue,
      },
    });
  }

  return res.status(statusCode).json({
    success: false,
    error: errorBody,
  });
}

module.exports = globalErrorHandler;
