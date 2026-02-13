import numpy as np

def normalize(val, minv, maxv):
    return (val - minv) / (maxv - minv + 1e-5)

def recommend_materials(product_input, materials_df, cost_model, co2_model, scaler):

    recommendations = []

    for _, material in materials_df.iterrows():

        combined = product_input + [
            material["material_strength"],
            material["biodegradability"],
            material["recyclability_percent"]
        ]

        arr = np.array(combined).reshape(1,-1)
        scaled = scaler.transform(arr)

        cost = cost_model.predict(scaled)[0]
        co2 = co2_model.predict(scaled)[0]

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
    "cost": float(round(cost,2)),
    "co2": float(round(co2,2)),
    "suitability": float(round(suitability,3))
})

    return sorted(recommendations,
                  key=lambda x: x["suitability"],
                  reverse=True)[:3]
