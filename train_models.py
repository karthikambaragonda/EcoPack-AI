import pandas as pd
import joblib
import os

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor
from xgboost import XGBRegressor

df = pd.read_csv("./data/final_ml_dataset.csv")

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

y_cost = df["cost_score"]
y_co2 = df["co2_emission"]

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

X_train, X_test, y_cost_train, y_cost_test = train_test_split(
    X_scaled, y_cost, test_size=0.2
)

X_train2, X_test2, y_co2_train, y_co2_test = train_test_split(
    X_scaled, y_co2, test_size=0.2
)

cost_model = RandomForestRegressor(n_estimators=200)
cost_model.fit(X_train, y_cost_train)

co2_model = XGBRegressor(n_estimators=200)
co2_model.fit(X_train2, y_co2_train)

os.makedirs("models", exist_ok=True)

joblib.dump(cost_model, "models/cost_model.pkl")
joblib.dump(co2_model, "models/co2_model.pkl")
joblib.dump(scaler, "models/scaler.pkl")

print("Models Trained Successfully")
