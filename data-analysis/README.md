# Data Analysis with Python

This directory contains implementations of the Data Analysis with Python certification projects from FreeCodeCamp. All projects focus on data manipulation, statistical analysis, and data visualization using Python libraries.

## Projects Implemented

### 1. Mean-Variance-Standard Deviation Calculator (`mean_var_std_calculator/`)
- **Description**: Statistical calculator for 3x3 matrices
- **Library**: NumPy for matrix operations
- **Features**:
  - Mean, variance, and standard deviation calculations
  - Calculations along rows, columns, and flattened array
  - Input validation for 9-element lists
  - Comprehensive statistical analysis

### 2. Demographic Data Analyzer (`demographic_data_analyzer/`)
- **Description**: Census data analysis for demographic insights
- **Library**: Pandas for data manipulation
- **Features**:
  - Race distribution analysis
  - Education level statistics
  - Income bracket analysis
  - Geographic comparisons
  - Age and gender demographics

### 3. Medical Data Visualizer (`medical_data_visualizer/`)
- **Description**: Medical examination data analysis and visualization
- **Libraries**: Pandas, Seaborn, Matplotlib
- **Features**:
  - Categorical plots for health indicators
  - Correlation heatmaps
  - Overweight calculation from BMI
  - Data cleaning and normalization
  - Cardio disease analysis

### 4. Page View Time Series Visualizer (`page_view_time_series_visualizer/`)
- **Description**: Time series analysis of web forum page views
- **Libraries**: Pandas, Matplotlib, Seaborn
- **Features**:
  - Line plots for daily page views
  - Bar plots for monthly averages
  - Box plots for trend and seasonality analysis
  - Data cleaning (outlier removal)
  - Time series visualization

### 5. Sea Level Predictor (`sea_level_predictor/`)
- **Description**: Climate data analysis with linear regression prediction
- **Libraries**: Pandas, Matplotlib, SciPy, NumPy
- **Features**:
  - Scatter plots of historical sea level data
  - Linear regression analysis
  - Future predictions to 2050
  - Multiple regression lines (full data vs. recent data)
  - Climate change visualization

## Technologies Used

- **Pandas**: Data manipulation and analysis
- **NumPy**: Numerical computing and array operations
- **Matplotlib**: Plotting and visualization
- **Seaborn**: Statistical data visualization
- **SciPy**: Scientific computing (linear regression)

## Prerequisites

- Python 3.x installed
- Required libraries: pandas, numpy, matplotlib, seaborn, scipy
- CSV data files for each project (provided by FreeCodeCamp)

## Installation

```bash
pip install pandas numpy matplotlib seaborn scipy
```

## Project Structure

```
data-analysis/
├── mean_var_std_calculator/
│   └── mean_var_std.py
├── demographic_data_analyzer/
│   └── demographic_data_analyzer.py
├── medical_data_visualizer/
│   └── medical_data_visualizer.py
├── page_view_time_series_visualizer/
│   └── time_series_visualizer.py
└── sea_level_predictor/
    └── sea_level_predictor.py
```

## Data Files Required

Each project requires specific CSV data files (provided by FreeCodeCamp):
- `mean_var_std_calculator/`: No external data required
- `demographic_data_analyzer/`: `adult.data.csv`
- `medical_data_visualizer/`: `medical_examination.csv`
- `page_view_time_series_visualizer/`: `fcc-forum-pageviews.csv`
- `sea_level_predictor/`: `epa-sea-level.csv`

## FreeCodeCamp Certification

These implementations fulfill the requirements for the Data Analysis with Python certification from FreeCodeCamp, covering:

- Data manipulation with pandas
- Statistical analysis with numpy
- Data visualization with matplotlib and seaborn
- Scientific computing with scipy
- Real-world data analysis projects

## Project Status

- ✅ Mean-Variance-Standard Deviation Calculator - Completed
- ✅ Demographic Data Analyzer - Completed
- ✅ Medical Data Visualizer - Completed
- ✅ Page View Time Series Visualizer - Completed
- ✅ Sea Level Predictor - Completed
