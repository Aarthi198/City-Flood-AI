const { z } = require("zod");
const { getModels } = require("../models");

async function listReports(_req, res) {
  const { Report } = getModels();
  const items = await Report.findAll({ limit: 200, order: [["id", "DESC"]] });
  res.json({ items });
}

const createSchema = z.object({
  userId: z.number().optional(),
  image: z.string().optional(),
  location: z.string().min(1),
  description: z.string().optional(),
});

async function createReport(req, res, next) {
  try {
    const body = createSchema.parse(req.body);
    const { Report } = getModels();
    const report = await Report.create({
      userId: body.userId || req.user?.id || 0,
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

module.exports = { listReports, createReport };

