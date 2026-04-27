const express = require("express");
const statsController = require("../controllers/statsController");

const router = express.Router();

router.get("/summary", statsController.summary);
router.get("/top-vendors", statsController.topVendors);
router.get("/cwe-distribution", statsController.cweDistribution);
router.get("/additions-by-month", statsController.additionsByMonth);

module.exports = router;
