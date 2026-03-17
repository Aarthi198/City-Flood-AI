const express = require("express");
const { authMiddleware } = require("../middleware/auth");
const { roleMiddleware } = require("../middleware/role");
const {
  dashboard,
  drainage,
  updateDrain,
  reports,
  sendAlert,
} = require("../controllers/admin.controller");

const router = express.Router();

router.use(authMiddleware, roleMiddleware("ADMIN"));

router.get("/dashboard", dashboard);
router.get("/drainage", drainage);
router.put("/drainage/:id", updateDrain);
router.get("/reports", reports);
router.post("/alert", sendAlert);

module.exports = router;

