const cors = require("cors");
const express = require("express");
const morgan = require("morgan");

const globalErrorHandler = require("./middlewares/globalErrorHandler");
const notFound = require("./middlewares/notFound");
const apiRoutes = require("./routes");

/** Express app; `server.js` calls listen. Order: middleware → `/api` → 404 → errors. */
const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || true,
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));

app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

app.use("/api", apiRoutes);

app.all("*", notFound);

app.use(globalErrorHandler);

module.exports = app;
