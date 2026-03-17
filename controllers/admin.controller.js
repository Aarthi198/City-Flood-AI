const { z } = require("zod");
const { getModels } = require("../models");

async function dashboard(_req, res) {
  const { FloodData, Drainage, Report } = getModels();

  const latest = await FloodData.findOne({ order: [["timestamp", "DESC"]] });
  const activeBlockages = await Drainage.count({ where: { status: "BLOCKED" } });
  const pendingReports = await Report.count({ where: { status: "NEW" } });

  res.json({
    rainfall: latest?.rainfall ?? 0,
    riskScore: latest?.riskScore ?? null,
    riskLevel: latest?.riskLevel ?? "UNKNOWN",
    activeBlockages,
    pendingReports,
  });
}

async function drainage(_req, res) {
  const { Drainage } = getModels();
  const items = await Drainage.findAll({ limit: 200, order: [["id", "ASC"]] });
  res.json({ items });
}

const updateDrainSchema = z.object({
  flowRate: z.number().optional(),
  status: z.string().min(1).optional(),
});

async function updateDrain(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid id" });

    const body = updateDrainSchema.parse(req.body);
    const { Drainage } = getModels();
    const item = await Drainage.findByPk(id);
    if (!item) return res.status(404).json({ error: "Drainage not found" });

    await item.update({
      ...(body.flowRate !== undefined ? { flowRate: body.flowRate } : {}),
      ...(body.status !== undefined ? { status: body.status } : {}),
    });
    res.json({ item });
  } catch (err) {
    next(err);
  }
}

async function reports(_req, res) {
  const { Report, User } = getModels();
  const items = await Report.findAll({
    limit: 200,
    order: [["id", "DESC"]],
    include: [{ model: User, attributes: ["id", "name", "email"] }],
  });
  res.json({ items });
}

const sendAlertSchema = z.object({
  message: z.string().min(1),
  area: z.string().min(1),
  riskLevel: z.string().min(1).optional(),
});

async function sendAlert(req, res, next) {
  try {
    const body = sendAlertSchema.parse(req.body);
    const { Alert } = getModels();
    const alert = await Alert.create({
      message: body.message,
      area: body.area,
      riskLevel: body.riskLevel || "MEDIUM",
    });

    const io = req.app.get("io");
    if (io) io.emit("alert:new", alert.toJSON());

    res.status(201).json({ alert });
  } catch (err) {
    next(err);
  }
}

module.exports = { dashboard, drainage, updateDrain, reports, sendAlert };

