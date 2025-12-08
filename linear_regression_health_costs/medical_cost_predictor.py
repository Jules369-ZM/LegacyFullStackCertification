#!/usr/bin/env python3
"""
Linear Regression Health Costs Calculator
This script implements linear regression to predict medical insurance costs.
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
import matplotlib.pyplot as plt
import seaborn as sns


class MedicalCostPredictor:
    """
    A linear regression model to predict medical insurance costs.
    """

    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.label_encoders = {}
        self.feature_columns = None
        self.target_column = 'charges'

    def load_data(self, filepath):
        """
        Load and preprocess the medical insurance dataset.

        Args:
            filepath (str): Path to the CSV file

        Returns:
            pd.DataFrame: Preprocessed dataframe
        """
        try:
            df = pd.read_csv(filepath)
            print(f"Loaded {len(df)} records from {filepath}")
        except FileNotFoundError:
            print(f"File {filepath} not found. Using sample data.")
            df = self._create_sample_data()

        # Store original dataframe for reference
        self.original_df = df.copy()

        # Preprocess the data
        df = self._preprocess_data(df)

        return df

    def _create_sample_data(self):
        """
        Create sample medical insurance data for demonstration.

        Returns:
            pd.DataFrame: Sample dataset
        """
        np.random.seed(42)
        n_samples = 1000

        # Generate sample data
        ages = np.random.randint(18, 65, n_samples)
        sexes = np.random.choice(['male', 'female'], n_samples)
        bmis = np.random.normal(25, 5, n_samples).clip(15, 50)
        children = np.random.poisson(1, n_samples).clip(0, 5)
        smokers = np.random.choice(['yes', 'no'], n_samples, p=[0.2, 0.8])
        regions = np.random.choice(['northeast', 'northwest', 'southeast', 'southwest'], n_samples)

        # Generate charges based on features (simplified model)
        base_charge = 1000
        charges = (
            base_charge +
            ages * 250 +  # Age factor
            (bmis - 25) * 100 +  # BMI factor
            children * 300 +  # Children factor
            (smokers == 'yes') * 15000 +  # Smoking factor
            np.random.normal(0, 2000, n_samples)  # Random variation
        )

        # Ensure positive charges
        charges = np.maximum(charges, 1000)

        df = pd.DataFrame({
            'age': ages,
            'sex': sexes,
            'bmi': bmis,
            'children': children,
            'smoker': smokers,
            'region': regions,
            'charges': charges
        })

        return df

    def _preprocess_data(self, df):
        """
        Preprocess the data for modeling.

        Args:
            df (pd.DataFrame): Raw dataframe

        Returns:
            pd.DataFrame: Preprocessed dataframe
        """
        # Handle missing values
        df = df.dropna()

        # Encode categorical variables
        categorical_columns = ['sex', 'smoker', 'region']

        for col in categorical_columns:
            if col not in self.label_encoders:
                self.label_encoders[col] = LabelEncoder()
            df[col] = self.label_encoders[col].fit_transform(df[col])

        # Store feature columns
        self.feature_columns = [col for col in df.columns if col != self.target_column]

        return df

    def train(self, X, y, test_size=0.2, random_state=42):
        """
        Train the linear regression model.

        Args:
            X (pd.DataFrame): Feature matrix
            y (pd.Series): Target variable
            test_size (float): Proportion of data for testing
            random_state (int): Random state for reproducibility

        Returns:
            dict: Training results
        """
        # Split the data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=random_state
        )

        # Scale the features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)

        # Train the model
        self.model = LinearRegression()
        self.model.fit(X_train_scaled, y_train)

        # Make predictions
        y_train_pred = self.model.predict(X_train_scaled)
        y_test_pred = self.model.predict(X_test_scaled)

        # Calculate metrics
        train_mse = mean_squared_error(y_train, y_train_pred)
        test_mse = mean_squared_error(y_test, y_test_pred)
        train_rmse = np.sqrt(train_mse)
        test_rmse = np.sqrt(test_mse)
        train_mae = mean_absolute_error(y_train, y_train_pred)
        test_mae = mean_absolute_error(y_test, y_test_pred)
        train_r2 = r2_score(y_train, y_train_pred)
        test_r2 = r2_score(y_test, y_test_pred)

        results = {
            'train_rmse': train_rmse,
            'test_rmse': test_rmse,
            'train_mae': train_mae,
            'test_mae': test_mae,
            'train_r2': train_r2,
            'test_r2': test_r2,
            'X_train': X_train,
            'X_test': X_test,
            'y_train': y_train,
            'y_test': y_test,
            'y_train_pred': y_train_pred,
            'y_test_pred': y_test_pred
        }

        return results

    def predict(self, features):
        """
        Make a prediction for new data.

        Args:
            features (dict): Dictionary of feature values

        Returns:
            float: Predicted medical cost
        """
        if self.model is None:
            raise ValueError("Model not trained yet")

        # Convert features to DataFrame
        df = pd.DataFrame([features])

        # Preprocess the features
        for col, encoder in self.label_encoders.items():
            if col in df.columns:
                df[col] = encoder.transform(df[col])

        # Ensure all feature columns are present
        for col in self.feature_columns:
            if col not in df.columns:
                df[col] = 0

        df = df[self.feature_columns]

        # Scale features
        features_scaled = self.scaler.transform(df)

        # Make prediction
        prediction = self.model.predict(features_scaled)[0]

        return max(prediction, 0)  # Ensure non-negative prediction

    def get_feature_importance(self):
        """
        Get feature importance based on coefficients.

        Returns:
            pd.DataFrame: Feature importance dataframe
        """
        if self.model is None:
            raise ValueError("Model not trained yet")

        # Get coefficients
        coefficients = self.model.coef_

        # Create feature importance dataframe
        feature_importance = pd.DataFrame({
            'feature': self.feature_columns,
            'coefficient': coefficients,
            'abs_coefficient': np.abs(coefficients)
        })

        # Sort by absolute coefficient
        feature_importance = feature_importance.sort_values('abs_coefficient', ascending=False)

        return feature_importance

    def plot_predictions(self, results):
        """
        Plot actual vs predicted values.

        Args:
            results (dict): Training results from train() method
        """
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 6))

        # Training set
        ax1.scatter(results['y_train'], results['y_train_pred'], alpha=0.5)
        ax1.plot([results['y_train'].min(), results['y_train'].max()],
                [results['y_train'].min(), results['y_train'].max()], 'r--')
        ax1.set_title('Training Set: Actual vs Predicted')
        ax1.set_xlabel('Actual Charges')
        ax1.set_ylabel('Predicted Charges')
        ax1.grid(True, alpha=0.3)

        # Test set
        ax2.scatter(results['y_test'], results['y_test_pred'], alpha=0.5)
        ax2.plot([results['y_test'].min(), results['y_test'].max()],
                [results['y_test'].min(), results['y_test'].max()], 'r--')
        ax2.set_title('Test Set: Actual vs Predicted')
        ax2.set_xlabel('Actual Charges')
        ax2.set_ylabel('Predicted Charges')
        ax2.grid(True, alpha=0.3)

        plt.tight_layout()
        return fig

    def plot_residuals(self, results):
        """
        Plot residuals to check model assumptions.

        Args:
            results (dict): Training results from train() method
        """
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 6))

        # Training residuals
        train_residuals = results['y_train'] - results['y_train_pred']
        ax1.scatter(results['y_train_pred'], train_residuals, alpha=0.5)
        ax1.axhline(y=0, color='r', linestyle='--')
        ax1.set_title('Training Set Residuals')
        ax1.set_xlabel('Predicted Charges')
        ax1.set_ylabel('Residuals')
        ax1.grid(True, alpha=0.3)

        # Test residuals
        test_residuals = results['y_test'] - results['y_test_pred']
        ax2.scatter(results['y_test_pred'], test_residuals, alpha=0.5)
        ax2.axhline(y=0, color='r', linestyle='--')
        ax2.set_title('Test Set Residuals')
        ax2.set_xlabel('Predicted Charges')
        ax2.set_ylabel('Residuals')
        ax2.grid(True, alpha=0.3)

        plt.tight_layout()
        return fig


def main():
    """
    Example usage of the MedicalCostPredictor.
    """
    print("Linear Regression Health Costs Calculator")
    print("=" * 50)

    # Initialize predictor
    predictor = MedicalCostPredictor()

    # Load data
    df = predictor.load_data('insurance.csv')

    print(f"\nDataset shape: {df.shape}")
    print(f"\nFeature columns: {predictor.feature_columns}")
    print(f"Target column: {predictor.target_column}")

    # Prepare features and target
    X = df[predictor.feature_columns]
    y = df[predictor.target_column]

    # Train the model
    print("\nTraining the model...")
    results = predictor.train(X, y)

    print("
Model Performance:")
    print(f"Test MAE: ${results['test_mae']:.2f}")
    print(f"Test RMSE: ${results['test_rmse']:.2f}")
    print(f"Train R²: {results['train_r2']:.4f}")
    print(f"Test R²: {results['test_r2']:.4f}")

    # Feature importance
    print("\nFeature Importance:")
    feature_importance = predictor.get_feature_importance()
    for _, row in feature_importance.head().iterrows():
        print(f"   {row['feature']}: {row['coefficient']:.2f}")

    # Example prediction
    print("\nExample Prediction:")
    sample_patient = {
        'age': 30,
        'sex': 'male',
        'bmi': 25.0,
        'children': 2,
        'smoker': 'no',
        'region': 'northeast'
    }

    predicted_cost = predictor.predict(sample_patient)
    print(f"Sample patient: {sample_patient}")
    print(".2f")

    print("\n" + "=" * 50)
    print("Model training and evaluation complete!")
    print("You can now make predictions for new patients.")


if __name__ == '__main__':
    main()
