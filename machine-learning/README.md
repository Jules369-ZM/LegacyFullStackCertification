# Machine Learning with Python

This directory contains implementations of the Machine Learning with Python certification projects from FreeCodeCamp. All projects focus on machine learning algorithms, data preprocessing, model training, and evaluation using Python libraries.

## Projects Implemented

### 1. Rock Paper Scissors (`rock_paper_scissors/`)
- **Description**: Interactive Rock-Paper-Scissors game with ML opponent
- **Technology**: Pattern recognition, probability, machine learning basics
- **Features**:
  - Computer learns from player patterns using frequency analysis
  - Memory persistence across game sessions
  - Statistical tracking and performance metrics
  - Interactive command-line interface

### 2. Cat and Dog Image Classifier (`cat_dog_image_classifier/`)
- **Description**: Convolutional Neural Network for image classification
- **Libraries**: TensorFlow, Keras, OpenCV, scikit-learn
- **Features**:
  - CNN architecture with convolutional and pooling layers
  - Image preprocessing and augmentation
  - Model training with early stopping
  - Evaluation metrics and visualization
  - Single image prediction capability

### 3. Book Recommendation Engine using KNN (`book_recommendation_engine/`)
- **Description**: Content-based book recommendation system
- **Libraries**: scikit-learn, pandas, numpy
- **Features**:
  - K-Nearest Neighbors algorithm implementation
  - Feature engineering from book metadata
  - Text processing and TF-IDF vectorization
  - Multi-label genre encoding
  - Similarity-based recommendations

### 4. Linear Regression Health Costs Calculator (`linear_regression_health_costs/`)
- **Description**: Medical insurance cost prediction model
- **Libraries**: scikit-learn, pandas, matplotlib, seaborn
- **Features**:
  - Linear regression with feature scaling
  - Categorical variable encoding
  - Model evaluation with multiple metrics
  - Residual analysis and visualization
  - Feature importance analysis

### 5. Neural Network SMS Text Classifier (`neural_network_sms_classifier/`)
- **Description**: Deep learning model for spam SMS detection
- **Libraries**: TensorFlow, Keras, NLTK, scikit-learn
- **Features**:
  - Text preprocessing and tokenization
  - Embedding layers and neural network architecture
  - Binary classification with sigmoid activation
  - Model evaluation and confusion matrix
  - Real-time text classification

## Technologies Used

- **TensorFlow/Keras**: Deep learning frameworks for neural networks
- **scikit-learn**: Machine learning algorithms and evaluation metrics
- **pandas**: Data manipulation and analysis
- **NumPy**: Numerical computing and array operations
- **Matplotlib/Seaborn**: Data visualization and plotting
- **OpenCV**: Computer vision for image processing
- **NLTK**: Natural language processing for text analysis

## Prerequisites

- Python 3.x installed
- Required libraries: tensorflow, scikit-learn, pandas, numpy, matplotlib, seaborn, opencv-python, nltk
- GPU recommended for deep learning models (optional)

## Installation

```bash
pip install tensorflow scikit-learn pandas numpy matplotlib seaborn opencv-python nltk
```

## Project Structure

```
machine-learning/
├── rock_paper_scissors/
│   └── RPS_game.py
├── cat_dog_image_classifier/
│   └── cat_dog_classifier.py
├── book_recommendation_engine/
│   └── book_recommendation.py
├── linear_regression_health_costs/
│   └── medical_cost_predictor.py
└── neural_network_sms_classifier/
    └── sms_classifier.py
```

## Data Files Required

Each project requires specific data files (provided by FreeCodeCamp or publicly available):
- `rock_paper_scissors/`: No external data (generates patterns during gameplay)
- `cat_dog_image_classifier/`: Image datasets (cats/ and dogs/ directories)
- `book_recommendation_engine/`: `books.csv` (book metadata)
- `linear_regression_health_costs/`: `insurance.csv` (insurance data)
- `neural_network_sms_classifier/`: `spam.csv` (SMS spam dataset)

## Machine Learning Concepts Covered

### Supervised Learning
- **Classification**: Binary and multi-class classification problems
- **Regression**: Predicting continuous numerical values
- **Model Evaluation**: Accuracy, precision, recall, F1-score, RMSE, R²

### Unsupervised Learning
- **Pattern Recognition**: Identifying patterns in sequential data
- **Similarity Measures**: Cosine similarity, Euclidean distance

### Deep Learning
- **Convolutional Neural Networks**: Image feature extraction
- **Recurrent Neural Networks**: Sequence processing (implicit in embeddings)
- **Natural Language Processing**: Text classification and tokenization

### Data Processing
- **Feature Engineering**: Creating meaningful features from raw data
- **Data Preprocessing**: Normalization, encoding, cleaning
- **Text Processing**: Tokenization, TF-IDF, embeddings

## FreeCodeCamp Certification

These implementations fulfill the requirements for the Machine Learning with Python certification from FreeCodeCamp, covering:

- Machine learning fundamentals and algorithms
- Data preprocessing and feature engineering
- Model training and evaluation
- Deep learning with neural networks
- Real-world application of ML techniques
- Python programming for data science

## Model Performance

Each project includes comprehensive evaluation:
- **Rock Paper Scissors**: Pattern learning effectiveness tracking
- **Cat/Dog Classifier**: Accuracy, loss curves, confusion matrix
- **Book Recommender**: Recommendation relevance and similarity scores
- **Health Costs**: RMSE, MAE, R² scores, residual analysis
- **SMS Classifier**: Precision, recall, F1-score, classification reports

## Project Status

- ✅ Rock Paper Scissors - Completed
- ✅ Cat and Dog Image Classifier - Completed
- ✅ Book Recommendation Engine using KNN - Completed
- ✅ Linear Regression Health Costs Calculator - Completed
- ✅ Neural Network SMS Text Classifier - Completed
