import numpy as np

# normalize helper
def normalize(val, minv, maxv):
    return (val - minv) / (maxv - minv + 1e-5)

def recommend_materials(product_input, materials_df, cost_model, co2_model, scaler):

    recommendations = []

    for _, material in materials_df.iterrows():

        # combine product + material features
        combined = product_input + [
            material["material_strength"],
            material["biodegradability"],
            material["recyclability_percent"]
        ]

        arr = np.array(combined).reshape(1,-1)
        scaled = scaler.transform(arr)

        # ML predictions
        cost = cost_model.predict(scaled)[0]
        co2 = co2_model.predict(scaled)[0]

        # normalize for scoring
        cost_norm = normalize(cost,0,100)
        co2_norm = normalize(co2,0,100)
        bio_norm = normalize(material["biodegradability"],0,10)

        suitability = (
            (1-cost_norm)*0.4 +
            (1-co2_norm)*0.4 +
            bio_norm*0.2
        )

        recommendations.append({
            "material": str(material["material_name"]),
            "predicted_cost": float(round(cost,2)),
            "predicted_co2": float(round(co2,2)),
            "suitability_score": float(round(suitability,3))
        })

    # sort by best suitability
    top = sorted(recommendations,
                 key=lambda x: x["suitability_score"],
                 reverse=True)[:3]

    return top
