from flask import Flask, request, jsonify
import joblib
import pandas as pd
import os
from recommend import recommend_materials
from flask_cors import CORS


app = Flask(__name__)
CORS(app)


BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# load models
cost_model = joblib.load("models/cost_model.pkl")
co2_model = joblib.load("models/co2_model.pkl")
scaler = joblib.load("models/scaler.pkl")

# load materials
materials = pd.read_csv("./data/materials_final.csv")

# rename to match ML training features
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
        data["product_strength_req"],
        data["barrier_score"],
        data["reuse_potential_score"]
    ]

    top=recommend_materials(product,
                            materials,
                            cost_model,
                            co2_model,
                            scaler)

    return jsonify(top)

@app.route("/")
def home():
    return "EcoPackAI AI Recommendation Backend Running!"

if __name__=="__main__":
    app.run(debug=True)
