const express = require("express");
const { authMiddleware } = require("../middleware/auth");
const { roleMiddleware } = require("../middleware/role");
const { predict } = require("../controllers/flood.controller");

const router = express.Router();

router.post("/predict", authMiddleware, roleMiddleware("USER", "ADMIN"), predict);

module.exports = router;

