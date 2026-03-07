import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
import joblib
import os

from generate_data import generate_dataset

MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.pkl")
DATA_PATH = os.path.join(os.path.dirname(__file__), "synthetic_circuits.csv")

def train_model():
    # Generate data if it doesn't exist
    if not os.path.exists(DATA_PATH):
        generate_dataset(num_samples=2000)
        
    print("Loading data...")
    df = pd.read_csv(DATA_PATH)
    
    X = df.drop('score', axis=1)
    y = df['score']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training Random Forest Regressor...")
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    print("Evaluating...")
    predictions = model.predict(X_test)
    mse = mean_squared_error(y_test, predictions)
    r2 = r2_score(y_test, predictions)
    
    print(f"MSE: {mse:.2f}")
    print(f"R2 Score: {r2:.2f}")
    
    print(f"Saving model to {MODEL_PATH}...")
    joblib.dump(model, MODEL_PATH)
    print("Training complete.")

if __name__ == "__main__":
    train_model()
