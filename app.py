from flask import Flask, request, jsonify
import joblib
import pandas as pd
import os
from recommend import recommend_materials

app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

cost_model = joblib.load("models/cost_model.pkl")
co2_model = joblib.load("models/co2_model.pkl")
scaler = joblib.load("models/scaler.pkl")

materials = pd.read_csv("./data/materials_final.csv")

materials = materials.rename(columns={
    "strength_score":"material_strength",
    "biodegradability_score":"biodegradability",
    "recyclability_percent":"recyclability_percent"
})

@app.route("/predict",methods=["POST"])
def predict():

    data=request.get_json()

    product=[
        data["weight_capacity_score"],
        data["strength_score"],
        data["barrier_score"],
        data["reuse_potential_score"]
    ]

    top=recommend_materials(product,materials,
                            cost_model,co2_model,scaler)

    return jsonify(top)

if __name__=="__main__":
    app.run(debug=True)
