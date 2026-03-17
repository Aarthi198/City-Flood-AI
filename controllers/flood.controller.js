const { z } = require("zod");
const { getModels } = require("../models");
const { predictFloodRisk } = require("../services/ml.service");

const predictSchema = z.object({
  location: z.string().min(1),
  rainfall: z.number().optional(),
  features: z.record(z.any()).optional(),
});

async function predict(req, res, next) {
  try {
    const body = predictSchema.parse(req.body);
    const mlResult = await predictFloodRisk({
      location: body.location,
      rainfall: body.rainfall,
      features: body.features,
    });

    const riskScore = mlResult?.riskScore ?? mlResult?.risk_score ?? null;
    const riskLevel = mlResult?.riskLevel ?? mlResult?.risk_level ?? (riskScore == null ? "UNKNOWN" : "MEDIUM");

    const { FloodData } = getModels();
    const row = await FloodData.create({
      location: body.location,
      rainfall: body.rainfall ?? 0,
      riskScore,
      riskLevel,
    });

    const io = req.app.get("io");
    if (io) io.emit("flood:update", row.toJSON());

    res.json({ prediction: mlResult, stored: row });
  } catch (err) {
    next(err);
  }
}

module.exports = { predict };

