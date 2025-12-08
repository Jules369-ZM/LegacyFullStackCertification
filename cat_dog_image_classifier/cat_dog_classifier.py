#!/usr/bin/env python3
"""
Cat and Dog Image Classifier
This script implements a Convolutional Neural Network (CNN) to classify images of cats and dogs.
"""

import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
import numpy as np
import matplotlib.pyplot as plt
import os
import cv2
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
import seaborn as sns


class CatDogClassifier:
    """
    A CNN classifier for distinguishing between cat and dog images.
    """

    def __init__(self, input_shape=(128, 128, 3)):
        """
        Initialize the classifier.

        Args:
            input_shape (tuple): Shape of input images (height, width, channels)
        """
        self.input_shape = input_shape
        self.model = None
        self.history = None

    def build_model(self):
        """
        Build the CNN model architecture.
        """
        model = keras.Sequential([
            # Convolutional layers
            layers.Conv2D(32, (3, 3), activation='relu', input_shape=self.input_shape),
            layers.MaxPooling2D((2, 2)),

            layers.Conv2D(64, (3, 3), activation='relu'),
            layers.MaxPooling2D((2, 2)),

            layers.Conv2D(128, (3, 3), activation='relu'),
            layers.MaxPooling2D((2, 2)),

            layers.Conv2D(128, (3, 3), activation='relu'),
            layers.MaxPooling2D((2, 2)),

            # Flatten and dense layers
            layers.Flatten(),
            layers.Dropout(0.5),
            layers.Dense(512, activation='relu'),
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

    def load_and_preprocess_data(self, data_dir, test_size=0.2, validation_split=0.2):
        """
        Load and preprocess image data.

        Args:
            data_dir (str): Directory containing 'cats' and 'dogs' subdirectories
            test_size (float): Fraction of data to use for testing
            validation_split (float): Fraction of training data for validation

        Returns:
            tuple: (X_train, X_val, X_test, y_train, y_val, y_test)
        """
        images = []
        labels = []

        # Load cat images
        cat_dir = os.path.join(data_dir, 'cats')
        if os.path.exists(cat_dir):
            for filename in os.listdir(cat_dir):
                if filename.endswith(('.jpg', '.jpeg', '.png')):
                    img_path = os.path.join(cat_dir, filename)
                    img = self.load_and_resize_image(img_path)
                    if img is not None:
                        images.append(img)
                        labels.append(0)  # 0 for cats

        # Load dog images
        dog_dir = os.path.join(data_dir, 'dogs')
        if os.path.exists(dog_dir):
            for filename in os.listdir(dog_dir):
                if filename.endswith(('.jpg', '.jpeg', '.png')):
                    img_path = os.path.join(dog_dir, filename)
                    img = self.load_and_resize_image(img_path)
                    if img is not None:
                        images.append(img)
                        labels.append(1)  # 1 for dogs

        if not images:
            raise ValueError("No images found in the specified directory")

        # Convert to numpy arrays
        X = np.array(images)
        y = np.array(labels)

        # Normalize pixel values
        X = X.astype('float32') / 255.0

        # Split the data
        X_train_val, X_test, y_train_val, y_test = train_test_split(
            X, y, test_size=test_size, random_state=42, stratify=y
        )

        X_train, X_val, y_train, y_val = train_test_split(
            X_train_val, y_train_val, test_size=validation_split, random_state=42, stratify=y_train_val
        )

        return X_train, X_val, X_test, y_train, y_val, y_test

    def load_and_resize_image(self, image_path):
        """
        Load and resize an image.

        Args:
            image_path (str): Path to the image file

        Returns:
            numpy.ndarray: Resized image array or None if loading fails
        """
        try:
            img = cv2.imread(image_path)
            if img is None:
                return None

            # Convert BGR to RGB
            img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

            # Resize image
            img = cv2.resize(img, (self.input_shape[1], self.input_shape[0]))

            return img
        except Exception as e:
            print(f"Error loading image {image_path}: {e}")
            return None

    def train(self, X_train, y_train, X_val, y_val, epochs=20, batch_size=32):
        """
        Train the model.

        Args:
            X_train: Training images
            y_train: Training labels
            X_val: Validation images
            y_val: Validation labels
            epochs (int): Number of training epochs
            batch_size (int): Batch size for training
        """
        if self.model is None:
            self.build_model()

        # Add early stopping
        early_stopping = keras.callbacks.EarlyStopping(
            monitor='val_loss',
            patience=5,
            restore_best_weights=True
        )

        # Train the model
        self.history = self.model.fit(
            X_train, y_train,
            epochs=epochs,
            batch_size=batch_size,
            validation_data=(X_val, y_val),
            callbacks=[early_stopping]
        )

        return self.history

    def evaluate(self, X_test, y_test):
        """
        Evaluate the model on test data.

        Args:
            X_test: Test images
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
        class_names = ['Cat', 'Dog']
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

    def predict(self, image_path):
        """
        Predict whether an image contains a cat or dog.

        Args:
            image_path (str): Path to the image file

        Returns:
            tuple: (prediction, confidence)
        """
        if self.model is None:
            raise ValueError("Model not trained yet")

        # Load and preprocess the image
        img = self.load_and_resize_image(image_path)
        if img is None:
            raise ValueError("Could not load image")

        # Normalize
        img = img.astype('float32') / 255.0
        img = np.expand_dims(img, axis=0)  # Add batch dimension

        # Make prediction
        prediction_prob = self.model.predict(img)[0][0]
        prediction = 1 if prediction_prob > 0.5 else 0
        confidence = prediction_prob if prediction == 1 else 1 - prediction_prob

        class_names = ['Cat', 'Dog']
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
    Example usage of the CatDogClassifier.
    Note: This requires actual image data to work properly.
    """
    print("Cat and Dog Image Classifier")
    print("=" * 40)

    # Initialize classifier
    classifier = CatDogClassifier()

    # Note: In a real implementation, you would:
    # 1. Download the Cats vs Dogs dataset from Kaggle or similar
    # 2. Organize images into 'cats' and 'dogs' directories
    # 3. Load and train the model

    print("To use this classifier:")
    print("1. Organize your images into 'cats' and 'dogs' directories")
    print("2. Call load_and_preprocess_data() with the data directory")
    print("3. Train the model using train()")
    print("4. Evaluate and make predictions")

    print("\nExample usage:")
    print("""
    # Initialize and build model
    classifier = CatDogClassifier()
    classifier.build_model()

    # Load data (requires actual image dataset)
    # X_train, X_val, X_test, y_train, y_val, y_test = classifier.load_and_preprocess_data('path/to/data')

    # Train model (requires actual data)
    # history = classifier.train(X_train, y_train, X_val, y_val)

    # Evaluate (requires actual data)
    # results = classifier.evaluate(X_test, y_test)

    # Make prediction on single image
    # prediction, confidence = classifier.predict('path/to/image.jpg')
    # print(f"Predicted: {prediction} (confidence: {confidence:.2f})")
    """)


if __name__ == '__main__':
    main()
