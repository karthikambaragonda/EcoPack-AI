import pandas as pd
import joblib
import os

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor
from xgboost import XGBRegressor

# load ML dataset
df = pd.read_csv("./data/final_ml_dataset.csv")

# filter only valid product-material pairs
df = df[df["weight_capacity_score"] <= df["weight_cap"]]

# -------- INPUT FEATURES ----------
X = df[
 [
  "weight_capacity_score",
  "product_strength_req",
  "barrier_score",
  "reuse_potential_score",
  "material_strength",
  "biodegradability",
  "recyclability_percent_y"
 ]
]

# -------- TARGETS ----------
y_cost = df["cost_score"]               # ✔ Cost Efficiency
y_co2  = df["co2_emission_score"]       # ✔ CO₂ Impact

# -------- SCALING ----------
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# -------- TRAIN TEST SPLIT ----------
X_train, X_test, yc_train, yc_test = train_test_split(
    X_scaled, y_cost, test_size=0.2, random_state=42
)

X_train2, X_test2, y2_train, y2_test = train_test_split(
    X_scaled, y_co2, test_size=0.2, random_state=42
)

# -------- COST MODEL ----------
cost_model = RandomForestRegressor(
    n_estimators=200,
    random_state=42
)
cost_model.fit(X_train, yc_train)

# -------- CO2 MODEL ----------
co2_model = XGBRegressor(
    n_estimators=200,
    random_state=42
)
co2_model.fit(X_train2, y2_train)

# -------- SAVE ----------
os.makedirs("models",exist_ok=True)

joblib.dump(cost_model,"models/cost_model.pkl")
joblib.dump(co2_model,"models/co2_model.pkl")
joblib.dump(scaler,"models/scaler.pkl")

print("MODELS TRAINED SUCCESSFULLY")
