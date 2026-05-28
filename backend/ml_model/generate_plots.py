import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
import os

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "synthetic_circuits.csv")
IMAGE_DIR = os.path.join(os.path.dirname(BASE_DIR), "images", "ml_results")

if not os.path.exists(IMAGE_DIR):
    os.makedirs(IMAGE_DIR)

def generate_plots():
    if not os.path.exists(DATA_PATH):
        print("Data file not found. Please run generate_data.py first.")
        return

    df = pd.read_csv(DATA_PATH)
    X = df.drop('score', axis=1)
    y = df['score']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    predictions = model.predict(X_test)

    # Set theme
    sns.set_theme(style="whitegrid")
    
    # 1. Actual vs Predicted
    plt.figure(figsize=(10, 6))
    sns.scatterplot(x=y_test, y=predictions, alpha=0.5, color="#4e73df")
    plt.plot([y_test.min(), y_test.max()], [y_test.min(), y_test.max()], 'r--', lw=2)
    plt.title('Actual vs Predicted Scores (Auto-Grading Model)', fontsize=14)
    plt.xlabel('Actual Score', fontsize=12)
    plt.ylabel('Predicted Score', fontsize=12)
    plt.tight_layout()
    plt.savefig(os.path.join(IMAGE_DIR, "actual_vs_predicted.png"))
    plt.close()

    # 2. Feature Importance
    feature_importance = pd.DataFrame({
        'Feature': X.columns,
        'Importance': model.feature_importances_
    }).sort_values('Importance', ascending=False)

    plt.figure(figsize=(10, 6))
    sns.barplot(x='Importance', y='Feature', data=feature_importance, palette="viridis")
    plt.title('ML Model Feature Importance', fontsize=14)
    plt.xlabel('Importance Weight', fontsize=12)
    plt.ylabel('Circuit Feature', fontsize=12)
    plt.tight_layout()
    plt.savefig(os.path.join(IMAGE_DIR, "feature_importance.png"))
    plt.close()

    # 3. Score Distribution
    plt.figure(figsize=(10, 6))
    sns.histplot(df['score'], bins=20, kde=True, color="#1cc88a")
    plt.title('Distribution of Scores in Dataset', fontsize=14)
    plt.xlabel('Score', fontsize=12)
    plt.ylabel('Frequency', fontsize=12)
    plt.tight_layout()
    plt.savefig(os.path.join(IMAGE_DIR, "score_distribution.png"))
    plt.close()

    print(f"MSE: {mean_squared_error(y_test, predictions):.2f}")
    print(f"R2: {r2_score(y_test, predictions):.2f}")
    print(f"Plots saved to {IMAGE_DIR}")

if __name__ == "__main__":
    generate_plots()
