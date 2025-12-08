#!/usr/bin/env python3
"""
Neural Network SMS Text Classifier
This script implements a neural network to classify SMS messages as spam or ham.
"""

import pandas as pd
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns
import re
from collections import Counter
import nltk
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer


class SMSClassifier:
    """
    A neural network classifier for SMS spam detection.
    """

    def __init__(self, max_words=5000, max_len=100):
        """
        Initialize the SMS classifier.

        Args:
            max_words (int): Maximum number of words in vocabulary
            max_len (int): Maximum length of sequences
        """
        self.max_words = max_words
        self.max_len = max_len
        self.model = None
        self.tokenizer = None
        self.label_encoder = LabelEncoder()
        self.history = None

    def load_data(self, filepath):
        """
        Load and preprocess the SMS dataset.

        Args:
            filepath (str): Path to the CSV file

        Returns:
            pd.DataFrame: Preprocessed dataframe
        """
        try:
            df = pd.read_csv(filepath, encoding='latin-1')
            # Keep only relevant columns (v1=label, v2=message)
            df = df[['v1', 'v2']]
            df.columns = ['label', 'message']
            print(f"Loaded {len(df)} SMS messages from {filepath}")
        except FileNotFoundError:
            print(f"File {filepath} not found. Using sample data.")
            df = self._create_sample_data()

        # Clean the data
        df = self._preprocess_data(df)

        return df

    def _create_sample_data(self):
        """
        Create sample SMS data for demonstration.

        Returns:
            pd.DataFrame: Sample dataset
        """
        sample_messages = [
            ('ham', 'Hey, how are you doing today?'),
            ('ham', 'Call me when you get home'),
            ('ham', 'Thanks for the help yesterday'),
            ('ham', 'Meeting at 3 PM tomorrow'),
            ('ham', 'Dont forget to buy milk'),
            ('spam', 'WINNER! Claim your prize now!'),
            ('spam', 'URGENT: Your account has been hacked'),
            ('spam', 'FREE iPhone! Click here to claim'),
            ('spam', 'You have won $1,000,000! Call now'),
            ('spam', 'CONGRATULATIONS! You are selected'),
            ('ham', 'Happy birthday! Hope you have a great day'),
            ('ham', 'Can we meet for lunch tomorrow?'),
            ('ham', 'Thanks for the gift, it was thoughtful'),
            ('spam', 'Earn $5000 per week from home!'),
            ('spam', 'Your phone bill is overdue. Pay now!'),
        ] * 50  # Multiply for more data

        df = pd.DataFrame(sample_messages, columns=['label', 'message'])
        return df

    def _preprocess_data(self, df):
        """
        Preprocess the SMS data.

        Args:
            df (pd.DataFrame): Raw dataframe

        Returns:
            pd.DataFrame: Preprocessed dataframe
        """
        # Remove duplicates
        df = df.drop_duplicates(subset=['message'])

        # Clean text
        df['clean_message'] = df['message'].apply(self._clean_text)

        # Encode labels
        df['label_encoded'] = self.label_encoder.fit_transform(df['label'])

        return df

    def _clean_text(self, text):
        """
        Clean and preprocess text.

        Args:
            text (str): Raw text

        Returns:
            str: Cleaned text
        """
        # Convert to lowercase
        text = text.lower()

        # Remove special characters and numbers
        text = re.sub(r'[^a-zA-Z\s]', '', text)

        # Remove extra whitespace
        text = ' '.join(text.split())

        return text

    def build_tokenizer(self, texts):
        """
        Build and fit the tokenizer.

        Args:
            texts: List of text messages
        """
        from tensorflow.keras.preprocessing.text import Tokenizer

        self.tokenizer = Tokenizer(num_words=self.max_words, oov_token='<OOV>')
        self.tokenizer.fit_on_texts(texts)

    def texts_to_sequences(self, texts):
        """
        Convert texts to sequences.

        Args:
            texts: List of text messages

        Returns:
            numpy.ndarray: Padded sequences
        """
        from tensorflow.keras.preprocessing.sequence import pad_sequences

        sequences = self.tokenizer.texts_to_sequences(texts)
        padded_sequences = pad_sequences(sequences, maxlen=self.max_len, padding='post', truncating='post')

        return padded_sequences

    def build_model(self):
        """
        Build the neural network model.
        """
        model = keras.Sequential([
            layers.Embedding(self.max_words, 128, input_length=self.max_len),
            layers.GlobalAveragePooling1D(),
            layers.Dense(64, activation='relu'),
            layers.Dropout(0.5),
            layers.Dense(32, activation='relu'),
            layers.Dropout(0.3),
            layers.Dense(1, activation='sigmoid')  # Binary classification
        ])

        # Compile the model
        model.compile(
            optimizer='adam',
            loss='binary_crossentropy',
            metrics=['accuracy']
        )

        self.model = model
        return model

    def train(self, X, y, validation_split=0.2, epochs=10, batch_size=32):
        """
        Train the neural network model.

        Args:
            X: Feature matrix (padded sequences)
            y: Target labels
            validation_split (float): Fraction for validation
            epochs (int): Number of training epochs
            batch_size (int): Batch size

        Returns:
            History: Training history
        """
        if self.model is None:
            self.build_model()

        # Add early stopping
        early_stopping = keras.callbacks.EarlyStopping(
            monitor='val_loss',
            patience=3,
            restore_best_weights=True
        )

        # Train the model
        self.history = self.model.fit(
            X, y,
            epochs=epochs,
            batch_size=batch_size,
            validation_split=validation_split,
            callbacks=[early_stopping],
            verbose=1
        )

        return self.history

    def evaluate(self, X_test, y_test):
        """
        Evaluate the model on test data.

        Args:
            X_test: Test features
            y_test: Test labels

        Returns:
            dict: Evaluation results
        """
        if self.model is None:
            raise ValueError("Model not trained yet")

        # Get predictions
        y_pred_prob = self.model.predict(X_test)
        y_pred = (y_pred_prob > 0.5).astype(int).flatten()

        # Calculate metrics
        test_loss, test_accuracy = self.model.evaluate(X_test, y_test, verbose=0)

        # Classification report
        class_names = self.label_encoder.classes_
        report = classification_report(y_test, y_pred, target_names=class_names)

        # Confusion matrix
        cm = confusion_matrix(y_test, y_pred)

        return {
            'test_loss': test_loss,
            'test_accuracy': test_accuracy,
            'classification_report': report,
            'confusion_matrix': cm,
            'predictions': y_pred,
            'probabilities': y_pred_prob.flatten()
        }

    def predict(self, message):
        """
        Predict whether a message is spam or ham.

        Args:
            message (str): SMS message to classify

        Returns:
            tuple: (prediction, confidence)
        """
        if self.model is None:
            raise ValueError("Model not trained yet")

        # Preprocess the message
        clean_message = self._clean_text(message)

        # Convert to sequence
        sequence = self.texts_to_sequences([clean_message])

        # Make prediction
        prediction_prob = self.model.predict(sequence)[0][0]
        prediction = 1 if prediction_prob > 0.5 else 0
        confidence = prediction_prob if prediction == 1 else 1 - prediction_prob

        class_names = self.label_encoder.classes_
        return class_names[prediction], confidence

    def save_model(self, filepath):
        """
        Save the trained model.

        Args:
            filepath (str): Path to save the model
        """
        if self.model is None:
            raise ValueError("No model to save")
        self.model.save(filepath)

    def load_model(self, filepath):
        """
        Load a trained model.

        Args:
            filepath (str): Path to the saved model
        """
        self.model = keras.models.load_model(filepath)

    def plot_training_history(self):
        """
        Plot the training history.
        """
        if self.history is None:
            raise ValueError("No training history available")

        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 4))

        # Accuracy plot
        ax1.plot(self.history.history['accuracy'], label='Training Accuracy')
        ax1.plot(self.history.history['val_accuracy'], label='Validation Accuracy')
        ax1.set_title('Model Accuracy')
        ax1.set_xlabel('Epoch')
        ax1.set_ylabel('Accuracy')
        ax1.legend()

        # Loss plot
        ax2.plot(self.history.history['loss'], label='Training Loss')
        ax2.plot(self.history.history['val_loss'], label='Validation Loss')
        ax2.set_title('Model Loss')
        ax2.set_xlabel('Epoch')
        ax2.set_ylabel('Loss')
        ax2.legend()

        plt.tight_layout()
        return fig


def main():
    """
    Example usage of the SMSClassifier.
    """
    print("Neural Network SMS Text Classifier")
    print("=" * 50)

    # Initialize classifier
    classifier = SMSClassifier(max_words=5000, max_len=100)

    # Load data
    df = classifier.load_data('spam.csv')

    print(f"\nDataset shape: {df.shape}")
    print(f"Label distribution:\n{df['label'].value_counts()}")

    # Build tokenizer
    classifier.build_tokenizer(df['clean_message'])

    # Convert texts to sequences
    X = classifier.texts_to_sequences(df['clean_message'])
    y = df['label_encoded'].values

    print(f"\nFeature matrix shape: {X.shape}")
    print(f"Vocabulary size: {len(classifier.tokenizer.word_index)}")

    # Split the data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # Build and train the model
    classifier.build_model()
    print("\nTraining the model...")
    history = classifier.train(X_train, y_train, validation_split=0.2, epochs=10)

    # Evaluate the model
    print("\nEvaluating the model...")
    results = classifier.evaluate(X_test, y_test)

    print("
Test Results:")
    print(f"Test Accuracy: {results['test_accuracy']:.4f}")
    print("\nClassification Report:")
    print(results['classification_report'])

    # Example predictions
    print("\nExample Predictions:")
    test_messages = [
        "Hey, how are you doing today?",
        "WINNER! Claim your FREE prize now!",
        "Meeting at 3 PM tomorrow",
        "URGENT: Your account has been suspended",
        "Thanks for the help yesterday"
    ]

    for msg in test_messages:
        prediction, confidence = classifier.predict(msg)
        print(f"Message: {msg[:60]}...")
        print(f"Prediction: {prediction} (confidence: {confidence:.3f})")

    print("\n" + "=" * 50)
    print("Model training and evaluation complete!")
    print("You can now classify SMS messages as spam or ham.")


if __name__ == '__main__':
    main()
