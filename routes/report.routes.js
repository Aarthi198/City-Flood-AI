const express = require("express");
const { authMiddleware } = require("../middleware/auth");
const { roleMiddleware } = require("../middleware/role");
const { listReports, createReport } = require("../controllers/report.controller");

const router = express.Router();

// Generic reports endpoints (admin can list all; users can create)
router.get("/", authMiddleware, roleMiddleware("ADMIN"), listReports);
router.post("/", authMiddleware, roleMiddleware("USER", "ADMIN"), createReport);

module.exports = router;

