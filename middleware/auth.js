const jwt = require("jsonwebtoken");
const { getModels } = require("../models");

async function authMiddleware(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Missing token" });

    const payload = jwt.verify(token, process.env.JWT_SECRET || "change_me");
    const { User } = getModels();
    const user = await User.findByPk(payload.sub);
    if (!user) return res.status(401).json({ error: "Invalid token" });

    req.user = { id: user.id, role: user.role, email: user.email, name: user.name };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

module.exports = { authMiddleware };

