#!/usr/bin/env python3
"""
Book Recommendation Engine using KNN
This script implements a book recommendation system using K-Nearest Neighbors algorithm.
"""

import pandas as pd
import numpy as np
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import StandardScaler, MultiLabelBinarizer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import ast
import re


class BookRecommender:
    """
    A book recommendation system using KNN and content-based filtering.
    """

    def __init__(self):
        self.books_df = None
        self.feature_matrix = None
        self.knn_model = None
        self.scaler = StandardScaler()
        self.tfidf_vectorizer = TfidfVectorizer(stop_words='english', max_features=1000)
        self.mlb_genres = MultiLabelBinarizer()

    def load_data(self, filepath):
        """
        Load book data from CSV file.

        Args:
            filepath (str): Path to the CSV file containing book data
        """
        try:
            self.books_df = pd.read_csv(filepath)

            # Clean and preprocess data
            self._preprocess_data()

            print(f"Loaded {len(self.books_df)} books")

        except FileNotFoundError:
            print(f"File {filepath} not found. Using sample data instead.")
            self._create_sample_data()

    def _create_sample_data(self):
        """
        Create sample book data for demonstration.
        """
        sample_books = [
            {
                'title': 'To Kill a Mockingbird',
                'authors': "['Harper Lee']",
                'average_rating': 4.27,
                'isbn': '0061120081',
                'isbn13': '9780061120084',
                'language_code': 'eng',
                'num_pages': 376,
                'ratings_count': 3745184,
                'text_reviews_count': 69453,
                'publication_date': '1960-07-11',
                'publisher': 'Harper Perennial Modern Classics',
                'genres': "['Fiction', 'Classics', 'Historical Fiction']"
            },
            {
                'title': '1984',
                'authors': "['George Orwell']",
                'average_rating': 4.17,
                'isbn': '0451524934',
                'isbn13': '9780451524935',
                'language_code': 'eng',
                'num_pages': 237,
                'ratings_count': 2638734,
                'text_reviews_count': 43724,
                'publication_date': '1950-07-01',
                'publisher': 'Signet Classics',
                'genres': "['Fiction', 'Dystopia', 'Science Fiction']"
            },
            {
                'title': 'The Great Gatsby',
                'authors': "['F. Scott Fitzgerald']",
                'average_rating': 3.91,
                'isbn': '0743273567',
                'isbn13': '9780743273565',
                'language_code': 'eng',
                'num_pages': 180,
                'ratings_count': 3205171,
                'text_reviews_count': 56437,
                'publication_date': '1925-04-10',
                'publisher': 'Scribner',
                'genres': "['Fiction', 'Classics', 'Literature']"
            },
            {
                'title': 'Pride and Prejudice',
                'authors': "['Jane Austen']",
                'average_rating': 4.25,
                'isbn': '0141439513',
                'isbn13': '9780141439518',
                'language_code': 'eng',
                'num_pages': 279,
                'ratings_count': 2451279,
                'text_reviews_count': 49152,
                'publication_date': '1813-01-28',
                'publisher': 'Penguin Classics',
                'genres': "['Fiction', 'Romance', 'Classics']"
            },
            {
                'title': 'The Catcher in the Rye',
                'authors': "['J.D. Salinger']",
                'average_rating': 3.80,
                'isbn': '0316769487',
                'isbn13': '9780316769488',
                'language_code': 'eng',
                'num_pages': 277,
                'ratings_count': 2182765,
                'text_reviews_count': 43070,
                'publication_date': '1951-07-16',
                'publisher': 'Little, Brown and Company',
                'genres': "['Fiction', 'Classics', 'Literature']"
            }
        ]

        self.books_df = pd.DataFrame(sample_books)
        self._preprocess_data()

    def _preprocess_data(self):
        """
        Preprocess the book data for recommendation system.
        """
        # Parse authors and genres from string representations
        self.books_df['authors_list'] = self.books_df['authors'].apply(self._parse_list_string)
        self.books_df['genres_list'] = self.books_df['genres'].apply(self._parse_list_string)

        # Extract publication year
        self.books_df['publication_year'] = pd.to_datetime(
            self.books_df['publication_date'], errors='coerce'
        ).dt.year.fillna(2000).astype(int)

        # Fill missing values
        self.books_df['num_pages'] = self.books_df['num_pages'].fillna(self.books_df['num_pages'].median())
        self.books_df['average_rating'] = self.books_df['average_rating'].fillna(self.books_df['average_rating'].mean())

    def _parse_list_string(self, list_string):
        """
        Parse a string representation of a list into actual list.

        Args:
            list_string (str): String like "['item1', 'item2']"

        Returns:
            list: Parsed list
        """
        try:
            return ast.literal_eval(list_string)
        except (ValueError, SyntaxError):
            # Fallback: extract items between quotes
            items = re.findall(r"'([^']*)'", list_string)
            return items if items else []

    def build_feature_matrix(self):
        """
        Build the feature matrix for KNN algorithm.
        """
        if self.books_df is None:
            raise ValueError("No book data loaded. Call load_data() first.")

        # Create numerical features
        numerical_features = self.books_df[[
            'average_rating', 'num_pages', 'ratings_count',
            'text_reviews_count', 'publication_year'
        ]].copy()

        # Scale numerical features
        numerical_scaled = self.scaler.fit_transform(numerical_features)

        # Process genres (multi-hot encoding)
        genres_encoded = self.mlb_genres.fit_transform(self.books_df['genres_list'])

        # Process authors (TF-IDF on author names)
        authors_text = self.books_df['authors_list'].apply(lambda x: ' '.join(x))
        authors_tfidf = self.tfidf_vectorizer.fit_transform(authors_text).toarray()

        # Combine all features
        self.feature_matrix = np.hstack([
            numerical_scaled,
            genres_encoded,
            authors_tfidf
        ])

        print(f"Feature matrix shape: {self.feature_matrix.shape}")

    def train_model(self, n_neighbors=5, algorithm='auto'):
        """
        Train the KNN model.

        Args:
            n_neighbors (int): Number of neighbors for KNN
            algorithm (str): KNN algorithm to use
        """
        if self.feature_matrix is None:
            self.build_feature_matrix()

        self.knn_model = NearestNeighbors(
            n_neighbors=n_neighbors + 1,  # +1 to exclude the book itself
            algorithm=algorithm,
            metric='cosine'
        )

        self.knn_model.fit(self.feature_matrix)

    def get_recommendations(self, book_title, n_recommendations=5):
        """
        Get book recommendations based on a given book title.

        Args:
            book_title (str): Title of the book to base recommendations on
            n_recommendations (int): Number of recommendations to return

        Returns:
            list: List of recommended book titles
        """
        if self.knn_model is None:
            raise ValueError("Model not trained. Call train_model() first.")

        # Find the book index
        book_indices = self.books_df[self.books_df['title'].str.lower().str.contains(
            book_title.lower(), na=False
        )].index

        if len(book_indices) == 0:
            # Try exact match
            book_indices = self.books_df[self.books_df['title'].str.lower() == book_title.lower()].index

        if len(book_indices) == 0:
            raise ValueError(f"Book '{book_title}' not found in database")

        book_idx = book_indices[0]

        # Get recommendations
        distances, indices = self.knn_model.kneighbors(
            [self.feature_matrix[book_idx]],
            n_neighbors=n_recommendations + 1
        )

        # Remove the book itself from recommendations
        recommended_indices = indices[0][1:]  # Skip first (itself)

        recommendations = []
        for idx in recommended_indices:
            book_info = self.books_df.iloc[idx]
            recommendations.append({
                'title': book_info['title'],
                'authors': book_info['authors_list'],
                'average_rating': book_info['average_rating'],
                'genres': book_info['genres_list'],
                'similarity_score': 1 - distances[0][indices[0].tolist().index(idx)]  # Convert distance to similarity
            })

        return recommendations

    def get_similar_books_by_features(self, target_features, n_recommendations=5):
        """
        Get recommendations based on specific features.

        Args:
            target_features (dict): Dictionary of target features
            n_recommendations (int): Number of recommendations

        Returns:
            list: List of recommended books
        """
        # This is a simplified version - in practice, you'd need to transform
        # the target features into the same feature space
        return self.get_recommendations(
            list(self.books_df['title'])[0],  # Use first book as example
            n_recommendations
        )


def main():
    """
    Example usage of the BookRecommender.
    """
    print("Book Recommendation Engine using KNN")
    print("=" * 50)

    # Initialize recommender
    recommender = BookRecommender()

    # Load sample data
    recommender.load_data('books.csv')  # This will use sample data if file doesn't exist

    # Build feature matrix and train model
    recommender.build_feature_matrix()
    recommender.train_model(n_neighbors=3)

    # Display available books
    print("\nAvailable books:")
    for i, title in enumerate(recommender.books_df['title'], 1):
        authors = recommender.books_df.iloc[i-1]['authors_list']
        rating = recommender.books_df.iloc[i-1]['average_rating']
        print("2d")

    # Get recommendations
    print("\nGetting recommendations for 'To Kill a Mockingbird':")
    try:
        recommendations = recommender.get_recommendations('To Kill a Mockingbird', 3)

        for i, rec in enumerate(recommendations, 1):
            print(f"\n{i}. {rec['title']}")
            print(f"   Authors: {', '.join(rec['authors'])}")
            print(".2f")
            print(f"   Genres: {', '.join(rec['genres'])}")
            print(".3f")

    except Exception as e:
        print(f"Error getting recommendations: {e}")

    print("\n" + "=" * 50)
    print("To use with real data:")
    print("1. Prepare a CSV file with columns: title, authors, average_rating, etc.")
    print("2. Call recommender.load_data('your_file.csv')")
    print("3. Build features and train the model")
    print("4. Get recommendations!")


if __name__ == '__main__':
    main()
