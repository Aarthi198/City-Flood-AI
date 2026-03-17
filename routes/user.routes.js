const express = require("express");
const { authMiddleware } = require("../middleware/auth");
const { roleMiddleware } = require("../middleware/role");
const {
  getFloodStatus,
  getRiskMap,
  submitReport,
  getAlerts,
} = require("../controllers/user.controller");

const router = express.Router();

router.use(authMiddleware, roleMiddleware("USER", "ADMIN"));

router.get("/flood-status", getFloodStatus);
router.get("/risk-map", getRiskMap);
router.post("/report", submitReport);
router.get("/alerts", getAlerts);

module.exports = router;

