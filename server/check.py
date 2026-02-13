import pandas as pd
df = pd.read_csv("./data/final_ml_dataset.csv")
print(df["cost_score"].value_counts())
