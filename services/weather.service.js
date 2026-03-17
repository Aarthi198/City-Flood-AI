const axios = require("axios");

async function fetchWeatherForLocation({ lat, lon }) {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    return { rainfallMmLastHour: null, source: "OPENWEATHER", note: "Missing OPENWEATHER_API_KEY" };
  }
  const url = "https://api.openweathermap.org/data/2.5/weather";
  const { data } = await axios.get(url, {
    params: { lat, lon, appid: apiKey, units: "metric" },
    timeout: 15000,
  });
  const rain = data?.rain?.["1h"] ?? 0;
  return { rainfallMmLastHour: rain, source: "OPENWEATHER" };
}

module.exports = { fetchWeatherForLocation };

