const axios = require("axios");

async function predictFloodRisk(payload) {
  const baseUrl = process.env.ML_API_URL || "http://localhost:8000";
  const url = `${baseUrl.replace(/\/+$/, "")}/predict`;
  const { data } = await axios.post(url, payload, { timeout: 15000 });
  return data;
}

module.exports = { predictFloodRisk };

