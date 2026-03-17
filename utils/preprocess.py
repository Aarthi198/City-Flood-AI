from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Tuple

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler


DATA_COLUMNS = [
    "Rainfall",
    "River_Level",
    "Drainage_Level",
    "Soil_Moisture",
    "Temperature",
]
TARGET_COLUMN = "Flood_Risk"


def load_dataset(csv_path: str | Path) -> pd.DataFrame:
    """
    Load the flood dataset from disk.
    """
    csv_path = Path(csv_path)
    if not csv_path.exists():
        raise FileNotFoundError(f"Dataset not found at: {csv_path}")
    return pd.read_csv(csv_path)


def clean_missing_values(df: pd.DataFrame) -> pd.DataFrame:
    """
    Basic cleaning:
    - Coerce feature/target columns to numeric
    - Fill missing values with the column median (robust for outliers)
    """
    df = df.copy()

    expected = set(DATA_COLUMNS + [TARGET_COLUMN])
    missing_cols = expected - set(df.columns)
    if missing_cols:
        raise ValueError(f"Dataset is missing columns: {sorted(missing_cols)}")

    # Ensure numeric types (invalid values become NaN and are filled below)
    for col in DATA_COLUMNS + [TARGET_COLUMN]:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    # Fill NaNs using median per column (simple, deterministic baseline)
    medians = df[DATA_COLUMNS + [TARGET_COLUMN]].median(numeric_only=True)
    df[DATA_COLUMNS + [TARGET_COLUMN]] = df[DATA_COLUMNS + [TARGET_COLUMN]].fillna(medians)

    # Flood_Risk must be 0/1
    df[TARGET_COLUMN] = df[TARGET_COLUMN].round().astype(int).clip(0, 1)

    return df


def split_features_target(df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series]:
    """
    Split dataset into X (features) and y (target).
    """
    X = df[DATA_COLUMNS].copy()
    y = df[TARGET_COLUMN].copy()
    return X, y


@dataclass(frozen=True)
class PreprocessResult:
    """
    Container for preprocessed arrays + fitted scaler.
    """

    X_train: np.ndarray
    X_test: np.ndarray
    y_train: np.ndarray
    y_test: np.ndarray
    scaler: StandardScaler
    feature_names: list[str]


def normalize_and_split(
    X: pd.DataFrame,
    y: pd.Series,
    *,
    test_size: float = 0.2,
    random_state: int = 42,
) -> PreprocessResult:
    """
    Train/test split, then normalize features using StandardScaler.

    IMPORTANT: Fit scaler on training data only to avoid data leakage.
    """
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=test_size,
        random_state=random_state,
        stratify=y if len(np.unique(y)) > 1 else None,
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    return PreprocessResult(
        X_train=X_train_scaled,
        X_test=X_test_scaled,
        y_train=y_train.to_numpy(),
        y_test=y_test.to_numpy(),
        scaler=scaler,
        feature_names=list(X.columns),
    )

