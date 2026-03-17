from __future__ import annotations

from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from flask import Flask, jsonify, request


def load_artifacts():
    """
    Load the trained model + scaler saved by train.py.
    """
    project_root = Path(__file__).resolve().parent
    model_path = project_root / "models" / "flood_model.pkl"
    if not model_path.exists():
        raise FileNotFoundError(
            "Trained model not found. Run `python train.py` first to generate "
            f"`{model_path}`."
        )
    return joblib.load(model_path)


app = Flask(__name__)
artifacts = load_artifacts()
model = artifacts["model"]
scaler = artifacts["scaler"]
feature_names = artifacts.get(
    "feature_names",
    ["Rainfall", "River_Level", "Drainage_Level", "Soil_Moisture", "Temperature"],
)


@app.post("/predict")
def predict():
    """
    POST /predict

    Input JSON:
    {
      "rainfall": 120,
      "river_level": 6.2,
      "drainage_level": 40,
      "soil_moisture": 75,
      "temperature": 29
    }

    Output JSON:
    { "flood_risk": 0 or 1 }
    """
    payload = request.get_json(silent=True) or {}

    required = ["rainfall", "river_level", "drainage_level", "soil_moisture", "temperature"]
    missing = [k for k in required if k not in payload]
    if missing:
        return jsonify({"error": f"Missing fields: {missing}"}), 400

    try:
        x = np.array(
            [
                float(payload["rainfall"]),
                float(payload["river_level"]),
                float(payload["drainage_level"]),
                float(payload["soil_moisture"]),
                float(payload["temperature"]),
            ],
            dtype=float,
        ).reshape(1, -1)
    except (TypeError, ValueError):
        return jsonify({"error": "All input fields must be numeric."}), 400

    # Use the same feature names as training to avoid sklearn warnings.
    x_df = pd.DataFrame(x, columns=feature_names)
    x_scaled = scaler.transform(x_df)
    pred = int(model.predict(x_scaled)[0])

    return jsonify({"flood_risk": pred})


if __name__ == "__main__":
    # Run: python app.py
    app.run(host="127.0.0.1", port=5000, debug=True)

