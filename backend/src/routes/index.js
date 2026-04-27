const express = require("express");
const statsRoutes = require("./statsRoutes");
const vulnerabilityRoutes = require("./vulnerabilityRoutes");

const router = express.Router();

router.get("/health", (_req, res) => {
  return res.status(200).json({ ok: true, message: "API is running" });
});

router.use("/vulnerabilities", vulnerabilityRoutes);

router.use("/stats", statsRoutes);

module.exports = router;
