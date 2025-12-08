#!/usr/bin/env python3
"""
Data Graph Explorer - Interactive data visualization and analysis tool
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
import warnings
warnings.filterwarnings('ignore')


class DataGraphExplorer:
    """
    An interactive tool for exploring and visualizing data through various chart types.
    """

    def __init__(self):
        self.data = None
        self.data_name = None
        self.numeric_columns = []
        self.categorical_columns = []
        self.datetime_columns = []

    def load_data(self, filepath, data_name=None):
        """
        Load data from various file formats.

        Args:
            filepath (str): Path to data file (CSV, Excel, JSON)
            data_name (str, optional): Name for the dataset
        """
        try:
            if filepath.endswith('.csv'):
                self.data = pd.read_csv(filepath)
            elif filepath.endswith(('.xlsx', '.xls')):
                self.data = pd.read_excel(filepath)
            elif filepath.endswith('.json'):
                self.data = pd.read_json(filepath)
            else:
                raise ValueError("Unsupported file format. Use CSV, Excel, or JSON.")

            self.data_name = data_name or filepath.split('/')[-1].split('.')[0]

            # Analyze data types
            self._analyze_columns()

            print(f"✅ Loaded {len(self.data)} rows and {len(self.data.columns)} columns from {filepath}")
            print(f"Dataset: {self.data_name}")
            print(f"Memory usage: {self.data.memory_usage(deep=True).sum() / 1024:.1f} KB")

        except FileNotFoundError:
            print(f"❌ File not found: {filepath}")
            self._create_sample_data()
        except Exception as e:
            print(f"❌ Error loading data: {e}")
            self._create_sample_data()

    def _create_sample_data(self):
        """Create sample data for demonstration"""
        np.random.seed(42)
        n_samples = 1000

        # Generate sample data
        data = {
            'age': np.random.randint(18, 80, n_samples),
            'income': np.random.normal(50000, 15000, n_samples).clip(10000, 200000),
            'education_years': np.random.randint(8, 22, n_samples),
            'work_experience': np.random.randint(0, 40, n_samples),
            'satisfaction': np.random.randint(1, 11, n_samples),
            'department': np.random.choice(['Engineering', 'Sales', 'Marketing', 'HR', 'Finance'], n_samples),
            'gender': np.random.choice(['Male', 'Female'], n_samples),
            'city': np.random.choice(['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'], n_samples),
            'performance_score': np.random.normal(75, 15, n_samples).clip(0, 100),
            'salary_increase': np.random.normal(5, 2, n_samples).clip(0, 20)
        }

        self.data = pd.DataFrame(data)
        self.data_name = "Sample Employee Dataset"
        self._analyze_columns()

        print("ℹ️  Using sample dataset for demonstration")

    def _analyze_columns(self):
        """Analyze and categorize columns by data type"""
        self.numeric_columns = []
        self.categorical_columns = []
        self.datetime_columns = []

        for col in self.data.columns:
            if pd.api.types.is_numeric_dtype(self.data[col]):
                self.numeric_columns.append(col)
            elif pd.api.types.is_datetime64_any_dtype(self.data[col]):
                self.datetime_columns.append(col)
            else:
                self.categorical_columns.append(col)

        print(f"📊 Data Types:")
        print(f"   Numeric: {len(self.numeric_columns)} columns")
        print(f"   Categorical: {len(self.categorical_columns)} columns")
        print(f"   DateTime: {len(self.datetime_columns)} columns")

    def show_overview(self):
        """Display dataset overview"""
        if self.data is None:
            print("❌ No data loaded")
            return

        print(f"\n📋 Dataset Overview: {self.data_name}")
        print("=" * 50)
        print(f"Shape: {self.data.shape[0]} rows × {self.data.shape[1]} columns")
        print(f"\nColumn Types:")

        for col in self.data.columns:
            dtype = str(self.data[col].dtype)
            if col in self.numeric_columns:
                stats = f"(min: {self.data[col].min():.1f}, max: {self.data[col].max():.1f}, mean: {self.data[col].mean():.1f})"
                print(f"   🔢 {col}: {dtype} {stats}")
            elif col in self.categorical_columns:
                unique_count = self.data[col].nunique()
                print(f"   📝 {col}: {dtype} ({unique_count} unique values)")
            else:
                print(f"   📅 {col}: {dtype}")

        print(f"\nMissing Values:")
        missing = self.data.isnull().sum()
        if missing.sum() == 0:
            print("   ✅ No missing values")
        else:
            for col, count in missing[missing > 0].items():
                print(f"   ⚠️  {col}: {count} missing values")

    def plot_histogram(self, column, bins=30):
        """
        Create histogram for a numeric column.

        Args:
            column (str): Column name
            bins (int): Number of bins
        """
        if column not in self.numeric_columns:
            print(f"❌ Column '{column}' is not numeric")
            return

        plt.figure(figsize=(10, 6))
        plt.hist(self.data[column], bins=bins, alpha=0.7, edgecolor='black')
        plt.title(f'Distribution of {column}', fontsize=14, fontweight='bold')
        plt.xlabel(column, fontsize=12)
        plt.ylabel('Frequency', fontsize=12)
        plt.grid(True, alpha=0.3)
        plt.show()

    def plot_boxplot(self, column, group_by=None):
        """
        Create boxplot for a numeric column, optionally grouped by categorical column.

        Args:
            column (str): Numeric column name
            group_by (str, optional): Categorical column to group by
        """
        if column not in self.numeric_columns:
            print(f"❌ Column '{column}' is not numeric")
            return

        plt.figure(figsize=(12, 6))

        if group_by and group_by in self.categorical_columns:
            # Grouped boxplot
            unique_groups = self.data[group_by].unique()
            if len(unique_groups) > 10:
                print(f"⚠️  Too many groups in '{group_by}' ({len(unique_groups)}). Showing first 10.")
                unique_groups = unique_groups[:10]

            data_to_plot = []
            labels = []

            for group in unique_groups:
                group_data = self.data[self.data[group_by] == group][column].dropna()
                if len(group_data) > 0:
                    data_to_plot.append(group_data)
                    labels.append(str(group))

            plt.boxplot(data_to_plot, labels=labels)
            plt.title(f'{column} by {group_by}', fontsize=14, fontweight='bold')
        else:
            # Single boxplot
            plt.boxplot(self.data[column].dropna())
            plt.title(f'Boxplot of {column}', fontsize=14, fontweight='bold')
            plt.xticks([1], [column])

        plt.ylabel(column, fontsize=12)
        plt.grid(True, alpha=0.3)
        plt.show()

    def plot_scatter(self, x_column, y_column, color_by=None, size_by=None):
        """
        Create scatter plot between two numeric columns.

        Args:
            x_column (str): X-axis column
            y_column (str): Y-axis column
            color_by (str, optional): Column to color points by
            size_by (str, optional): Column to size points by
        """
        if x_column not in self.numeric_columns or y_column not in self.numeric_columns:
            print("❌ Both columns must be numeric")
            return

        plt.figure(figsize=(10, 6))

        # Prepare data
        x_data = self.data[x_column]
        y_data = self.data[y_column]

        # Scatter plot
        scatter_kwargs = {'alpha': 0.6}

        if color_by and color_by in self.numeric_columns:
            scatter_kwargs['c'] = self.data[color_by]
            scatter_kwargs['cmap'] = 'viridis'
            plt.colorbar(label=color_by)

        if size_by and size_by in self.numeric_columns:
            # Normalize size data to reasonable range
            size_data = self.data[size_by]
            size_normalized = (size_data - size_data.min()) / (size_data.max() - size_data.min())
            scatter_kwargs['s'] = size_normalized * 100 + 20

        plt.scatter(x_data, y_data, **scatter_kwargs)

        plt.title(f'{y_column} vs {x_column}', fontsize=14, fontweight='bold')
        plt.xlabel(x_column, fontsize=12)
        plt.ylabel(y_column, fontsize=12)
        plt.grid(True, alpha=0.3)
        plt.show()

    def plot_bar_chart(self, column, top_n=10):
        """
        Create bar chart for categorical column.

        Args:
            column (str): Categorical column name
            top_n (int): Show only top N categories
        """
        if column not in self.categorical_columns:
            print(f"❌ Column '{column}' is not categorical")
            return

        # Get value counts
        value_counts = self.data[column].value_counts().head(top_n)

        plt.figure(figsize=(12, 6))
        bars = plt.bar(range(len(value_counts)), value_counts.values, alpha=0.7, edgecolor='black')

        plt.title(f'Top {top_n} Categories in {column}', fontsize=14, fontweight='bold')
        plt.xlabel(column, fontsize=12)
        plt.ylabel('Count', fontsize=12)
        plt.xticks(range(len(value_counts)), value_counts.index, rotation=45, ha='right')
        plt.grid(True, alpha=0.3, axis='y')

        # Add value labels on bars
        for bar, value in zip(bars, value_counts.values):
            plt.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.5,
                    f'{value}', ha='center', va='bottom')

        plt.tight_layout()
        plt.show()

    def plot_correlation_heatmap(self, columns=None):
        """
        Create correlation heatmap for numeric columns.

        Args:
            columns (list, optional): Specific columns to include
        """
        if not columns:
            columns = self.numeric_columns[:10]  # Limit to first 10 for readability

        if len(columns) < 2:
            print("❌ Need at least 2 numeric columns for correlation analysis")
            return

        # Calculate correlation matrix
        corr_matrix = self.data[columns].corr()

        plt.figure(figsize=(10, 8))
        sns.heatmap(corr_matrix, annot=True, cmap='coolwarm', center=0,
                   square=True, linewidths=0.5, cbar_kws={"shrink": 0.8})

        plt.title('Correlation Heatmap', fontsize=14, fontweight='bold')
        plt.tight_layout()
        plt.show()

    def plot_line_chart(self, x_column, y_column, group_by=None):
        """
        Create line chart (useful for time series or ordered data).

        Args:
            x_column (str): X-axis column
            y_column (str): Y-axis column
            group_by (str, optional): Column to group lines by
        """
        plt.figure(figsize=(12, 6))

        if group_by and group_by in self.categorical_columns:
            # Multiple lines by group
            groups = self.data[group_by].unique()[:5]  # Limit to 5 groups

            for group in groups:
                group_data = self.data[self.data[group_by] == group]
                if len(group_data) > 1:  # Need at least 2 points for line
                    plt.plot(group_data[x_column], group_data[y_column],
                           label=str(group), marker='o', alpha=0.7)

            plt.legend(title=group_by)
        else:
            # Single line
            if len(self.data) > 1:
                plt.plot(self.data[x_column], self.data[y_column],
                        marker='o', alpha=0.7)

        plt.title(f'{y_column} vs {x_column}', fontsize=14, fontweight='bold')
        plt.xlabel(x_column, fontsize=12)
        plt.ylabel(y_column, fontsize=12)
        plt.grid(True, alpha=0.3)
        plt.show()

    def plot_pie_chart(self, column, top_n=8):
        """
        Create pie chart for categorical column.

        Args:
            column (str): Categorical column name
            top_n (int): Show only top N categories
        """
        if column not in self.categorical_columns:
            print(f"❌ Column '{column}' is not categorical")
            return

        # Get value counts
        value_counts = self.data[column].value_counts()

        if len(value_counts) > top_n:
            # Group smaller categories as "Others"
            top_categories = value_counts.head(top_n - 1)
            others_sum = value_counts.tail(len(value_counts) - top_n + 1).sum()

            labels = list(top_categories.index) + ['Others']
            sizes = list(top_categories.values) + [others_sum]
        else:
            labels = value_counts.index
            sizes = value_counts.values

        plt.figure(figsize=(10, 8))
        plt.pie(sizes, labels=labels, autopct='%1.1f%%', startangle=90)
        plt.title(f'Distribution of {column}', fontsize=14, fontweight='bold')
        plt.axis('equal')  # Equal aspect ratio ensures pie is drawn as circle
        plt.show()

    def perform_pca_analysis(self, n_components=2):
        """
        Perform PCA analysis on numeric data.

        Args:
            n_components (int): Number of principal components
        """
        if len(self.numeric_columns) < 2:
            print("❌ Need at least 2 numeric columns for PCA")
            return

        # Prepare data
        numeric_data = self.data[self.numeric_columns].dropna()
        if len(numeric_data) == 0:
            print("❌ No valid numeric data for PCA")
            return

        # Standardize data
        scaler = StandardScaler()
        scaled_data = scaler.fit_transform(numeric_data)

        # Perform PCA
        pca = PCA(n_components=n_components)
        pca_result = pca.fit_transform(scaled_data)

        # Create DataFrame for plotting
        pca_df = pd.DataFrame(data=pca_result,
                            columns=[f'PC{i+1}' for i in range(n_components)])

        # Explained variance
        explained_variance = pca.explained_variance_ratio_

        print("PCA Analysis Results:")
        print(f"Explained variance by component: {explained_variance}")
        print(".1%")

        # Plot PCA results
        if n_components >= 2:
            plt.figure(figsize=(10, 6))
            plt.scatter(pca_df['PC1'], pca_df['PC2'], alpha=0.6)
            plt.title('PCA: First Two Principal Components', fontsize=14, fontweight='bold')
            plt.xlabel(f'PC1 ({explained_variance[0]:.1%} variance)')
            plt.ylabel(f'PC2 ({explained_variance[1]:.1%} variance)')
            plt.grid(True, alpha=0.3)
            plt.show()

        return pca_df, explained_variance

    def show_statistics(self, column=None):
        """
        Show statistical summary of data or specific column.

        Args:
            column (str, optional): Specific column to analyze
        """
        if self.data is None:
            print("❌ No data loaded")
            return

        if column:
            if column not in self.data.columns:
                print(f"❌ Column '{column}' not found")
                return

            print(f"\n📊 Statistics for '{column}':")
            print("-" * 40)

            if column in self.numeric_columns:
                print(f"Count: {self.data[column].count()}")
                print(f"Mean: {self.data[column].mean():.2f}")
                print(f"Std Dev: {self.data[column].std():.2f}")
                print(f"Min: {self.data[column].min():.2f}")
                print(f"25%: {self.data[column].quantile(0.25):.2f}")
                print(f"Median: {self.data[column].median():.2f}")
                print(f"75%: {self.data[column].quantile(0.75):.2f}")
                print(f"Max: {self.data[column].max():.2f}")
            else:
                print(f"Unique values: {self.data[column].nunique()}")
                print(f"Most common: {self.data[column].mode().iloc[0] if len(self.data[column].mode()) > 0 else 'N/A'}")
                print("Top 5 values:")
                value_counts = self.data[column].value_counts().head(5)
                for val, count in value_counts.items():
                    print(f"   {val}: {count}")
        else:
            print(f"\n📊 Dataset Statistics:")
            print("-" * 40)
            print(self.data.describe())

    def interactive_explorer(self):
        """Run interactive data exploration mode"""
        if self.data is None:
            print("❌ No data loaded. Please load data first.")
            return

        print("📊 Interactive Data Graph Explorer")
        print("=" * 50)
        print(f"Dataset: {self.data_name} ({len(self.data)} rows, {len(self.data.columns)} columns)")
        print("\nAvailable chart types:")
        print("1. Histogram (distribution of numeric column)")
        print("2. Boxplot (distribution with outliers)")
        print("3. Scatter plot (relationship between two numeric columns)")
        print("4. Bar chart (categorical data)")
        print("5. Correlation heatmap (relationships between numeric columns)")
        print("6. Line chart (trends over ordered data)")
        print("7. Pie chart (categorical proportions)")
        print("8. PCA analysis (dimensionality reduction)")
        print("9. Statistics summary")
        print("10. Dataset overview")
        print("11. Exit")

        while True:
            try:
                choice = input("\nChoose chart type (1-11): ").strip()

                if choice == '11':
                    print("👋 Thanks for exploring your data!")
                    break

                elif choice == '1':
                    # Histogram
                    print(f"\nNumeric columns: {self.numeric_columns}")
                    col = input("Enter column name: ").strip()
                    if col in self.numeric_columns:
                        bins = input("Number of bins (default 30): ").strip()
                        bins = int(bins) if bins.isdigit() else 30
                        self.plot_histogram(col, bins)

                elif choice == '2':
                    # Boxplot
                    print(f"\nNumeric columns: {self.numeric_columns}")
                    col = input("Enter column name: ").strip()
                    if col in self.numeric_columns:
                        print(f"Categorical columns: {self.categorical_columns}")
                        group = input("Group by (optional): ").strip()
                        group = group if group and group in self.categorical_columns else None
                        self.plot_boxplot(col, group)

                elif choice == '3':
                    # Scatter plot
                    print(f"\nNumeric columns: {self.numeric_columns}")
                    x_col = input("X-axis column: ").strip()
                    y_col = input("Y-axis column: ").strip()
                    if x_col in self.numeric_columns and y_col in self.numeric_columns:
                        print(f"Numeric columns: {self.numeric_columns}")
                        color_col = input("Color by (optional): ").strip()
                        size_col = input("Size by (optional): ").strip()
                        color_col = color_col if color_col and color_col in self.numeric_columns else None
                        size_col = size_col if size_col and size_col in self.numeric_columns else None
                        self.plot_scatter(x_col, y_col, color_col, size_col)

                elif choice == '4':
                    # Bar chart
                    print(f"\nCategorical columns: {self.categorical_columns}")
                    col = input("Enter column name: ").strip()
                    if col in self.categorical_columns:
                        top_n = input("Top N categories (default 10): ").strip()
                        top_n = int(top_n) if top_n.isdigit() else 10
                        self.plot_bar_chart(col, top_n)

                elif choice == '5':
                    # Correlation heatmap
                    self.plot_correlation_heatmap()

                elif choice == '6':
                    # Line chart
                    print(f"\nColumns: {list(self.data.columns)}")
                    x_col = input("X-axis column: ").strip()
                    y_col = input("Y-axis column: ").strip()
                    if x_col in self.data.columns and y_col in self.data.columns:
                        print(f"Categorical columns: {self.categorical_columns}")
                        group_col = input("Group by (optional): ").strip()
                        group_col = group_col if group_col and group_col in self.categorical_columns else None
                        self.plot_line_chart(x_col, y_col, group_col)

                elif choice == '7':
                    # Pie chart
                    print(f"\nCategorical columns: {self.categorical_columns}")
                    col = input("Enter column name: ").strip()
                    if col in self.categorical_columns:
                        top_n = input("Top N categories (default 8): ").strip()
                        top_n = int(top_n) if top_n.isdigit() else 8
                        self.plot_pie_chart(col, top_n)

                elif choice == '8':
                    # PCA analysis
                    n_comp = input("Number of components (default 2): ").strip()
                    n_comp = int(n_comp) if n_comp.isdigit() and 1 <= int(n_comp) <= 3 else 2
                    self.perform_pca_analysis(n_comp)

                elif choice == '9':
                    # Statistics
                    print(f"\nColumns: {list(self.data.columns)}")
                    col = input("Column name (leave empty for full summary): ").strip()
                    self.show_statistics(col if col else None)

                elif choice == '10':
                    # Overview
                    self.show_overview()

                else:
                    print("Invalid choice. Please try again.")

            except KeyboardInterrupt:
                print("\n👋 Explorer interrupted. Goodbye!")
                break
            except Exception as e:
                print(f"❌ Error: {e}")


def main():
    """Main function"""
    explorer = DataGraphExplorer()

    # Try to load data, use sample if not available
    print("🔍 Data Graph Explorer")
    print("=" * 40)

    data_file = input("Enter data file path (or press Enter for sample data): ").strip()
    if data_file:
        explorer.load_data(data_file)
    else:
        explorer._create_sample_data()

    explorer.show_overview()
    explorer.interactive_explorer()


if __name__ == '__main__':
    main()
