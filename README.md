# City-Flood-AI

## CityFlood AI – Urban Flood Management and Prediction System (ML Module)

## Project structure

```
ml-model/
│
├── data/
│   └── flood_data.csv
│
├── models/
│   └── flood_model.pkl          (generated after training)
│
├── utils/
│   └── preprocess.py
│
├── model.py
├── train.py
├── app.py
├── run_all.bat
└── requirements.txt
```

## Setup

```bash
cd "C:\Users\Admin\Desktop\ML -FLOOD\ml-model"
python -m pip install -r requirements.txt
```

## Train the model

```bash
python train.py
```

This creates `models/flood_model.pkl`.

## Run the API

```bash
python app.py
```

### Predict endpoint

- **POST** `/predict`
- **JSON body**

```json
{
  "rainfall": 120,
  "river_level": 6.2,
  "drainage_level": 40,
  "soil_moisture": 75,
  "temperature": 29
}
```

- **Response**

```json
{ "flood_risk": 1 }
```

## One-command run (Windows)

```bat
run_all.bat
```

