const { z } = require("zod");
const { getModels } = require("../models");

async function getFloodStatus(_req, res) {
  const { FloodData } = getModels();
  const latest = await FloodData.findAll({ limit: 20, order: [["timestamp", "DESC"]] });
  res.json({ items: latest });
}

async function getRiskMap(_req, res) {
  // Placeholder: front-end can render map pins from this dataset
  const { FloodData } = getModels();
  const latest = await FloodData.findAll({ limit: 200, order: [["timestamp", "DESC"]] });
  res.json({ items: latest });
}

const submitReportSchema = z.object({
  image: z.string().optional(), // base64 or URL
  location: z.string().min(1),
  description: z.string().optional(),
});

async function submitReport(req, res, next) {
  try {
    const body = submitReportSchema.parse(req.body);
    const { Report } = getModels();
    const report = await Report.create({
      userId: req.user.id,
      image: body.image || null,
      location: body.location,
      description: body.description || null,
      status: "NEW",
    });
    res.status(201).json({ report });
  } catch (err) {
    next(err);
  }
}

async function getAlerts(_req, res) {
  const { Alert } = getModels();
  const latest = await Alert.findAll({ limit: 50, order: [["timestamp", "DESC"]] });
  res.json({ items: latest });
}

module.exports = { getFloodStatus, getRiskMap, submitReport, getAlerts };

