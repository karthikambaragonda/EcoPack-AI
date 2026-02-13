import pandas as pd

# normalize helper
def normalize(val, minv, maxv):
    return (val - minv) / (maxv - minv + 1e-5)

def recommend_materials(product_input, materials_df, cost_model, co2_model, scaler):

    recommendations = []

    cols = [
        "weight_capacity_score",
        "product_strength_req",
        "barrier_score",
        "reuse_potential_score",
        "material_strength",
        "biodegradability",
        "recyclability_percent_y"
    ]

    for _, material in materials_df.iterrows():

        combined = product_input + [
            material["material_strength"],
            material["biodegradability"],
            material["recyclability_percent"]
        ]

        # convert into dataframe with feature names
        input_df = pd.DataFrame([combined], columns=cols)

        # scale properly
        scaled = scaler.transform(input_df)

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
            "predicted_cost": float(round(cost,2)),
            "predicted_co2": float(round(co2,2)),
            "suitability_score": float(round(suitability,3))
        })

    top = sorted(recommendations,
                 key=lambda x: x["suitability_score"],
                 reverse=True)[:3]

    return top
