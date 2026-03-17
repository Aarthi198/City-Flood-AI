from __future__ import annotations

from pathlib import Path

import joblib
from sklearn.metrics import classification_report, confusion_matrix

from model import build_model
from utils.preprocess import (
    clean_missing_values,
    load_dataset,
    normalize_and_split,
    split_features_target,
)


def main() -> None:
    """
    Training pipeline:
    - load dataset
    - clean missing values
    - split features/target
    - normalize features (StandardScaler)
    - train RandomForest
    - save {model, scaler, feature_names} to models/flood_model.pkl
    """
    project_root = Path(__file__).resolve().parent
    data_path = project_root / "data" / "flood_data.csv"
    model_path = project_root / "models" / "flood_model.pkl"

    df = load_dataset(data_path)
    df = clean_missing_values(df)

    X, y = split_features_target(df)
    prep = normalize_and_split(X, y, test_size=0.2, random_state=42)

    model = build_model(random_state=42)
    model.fit(prep.X_train, prep.y_train)

    y_pred = model.predict(prep.X_test)
    print("Confusion matrix:")
    print(confusion_matrix(prep.y_test, y_pred))
    print("\nClassification report:")
    print(classification_report(prep.y_test, y_pred, digits=4))

    payload = {
        "model": model,
        "scaler": prep.scaler,
        "feature_names": prep.feature_names,
    }
    model_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(payload, model_path)

    print(f"\nSaved trained model to: {model_path}")


if __name__ == "__main__":
    main()

