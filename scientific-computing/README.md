# Scientific Computing with Python

This directory contains implementations of the Scientific Computing with Python certification projects from FreeCodeCamp. All projects focus on Python programming, algorithms, data structures, and computational thinking.

## Projects Implemented

### 1. Arithmetic Formatter (`arithmetic_formatter/`)
- **Description**: Function to format arithmetic problems vertically for display
- **Features**:
  - Supports addition and subtraction
  - Validates input (operators, number length, problem count)
  - Optional answer display
  - Proper alignment and formatting

### 2. Time Calculator (`time_calculator/`)
- **Description**: Function to add time durations and calculate new times
- **Features**:
  - 12-hour format time calculations
  - Day of week handling
  - Duration parsing (HH:MM format)
  - Day counting for multi-day results

### 3. Budget App (`budget_app/`)
- **Description**: Object-oriented budget management system
- **Features**:
  - Category-based expense tracking
  - Deposit and withdrawal operations
  - Fund transfers between categories
  - Spending percentage visualization charts
  - Formatted ledger display

### 4. Polygon Area Calculator (`polygon_area_calculator/`)
- **Description**: Shape calculator classes for rectangles and squares
- **Features**:
  - Rectangle and Square classes with inheritance
  - Area, perimeter, and diagonal calculations
  - ASCII art representation
  - Shape fitting calculations
  - Property modification methods

### 5. Probability Calculator (`probability_calculator/`)
- **Description**: Statistical probability calculator using Monte Carlo methods
- **Features**:
  - Hat class for ball drawing simulations
  - Probability experiment runner
  - Statistical analysis of outcomes
  - Random sampling without replacement

## Technologies Used

- **Python**: Primary programming language
- **Object-Oriented Programming**: Classes, inheritance, encapsulation
- **Algorithm Design**: Time calculations, formatting algorithms, probability simulations
- **Data Structures**: Lists, dictionaries, custom classes
- **Mathematical Operations**: Arithmetic, geometric calculations, statistical analysis

## Prerequisites

- Python 3.x installed
- Basic understanding of Python syntax

## Running the Projects

Each project contains the main implementation file. You can test the functions by importing and calling them:

```python
# Example usage
from arithmetic_formatter.arithmetic_arranger import arithmetic_arranger

problems = ["32 + 698", "3801 - 2", "45 + 43", "123 + 49"]
print(arithmetic_arranger(problems))
```

## Project Structure

```
scientific-computing/
├── arithmetic_formatter/
│   └── arithmetic_arranger.py
├── time_calculator/
│   └── time_calculator.py
├── budget_app/
│   └── budget.py
├── polygon_area_calculator/
│   └── shape_calculator.py
├── probability_calculator/
│   └── prob_calculator.py
└── README.md
```

## FreeCodeCamp Certification

These implementations fulfill the requirements for the Scientific Computing with Python certification from FreeCodeCamp, covering:

- Python programming fundamentals
- Algorithm development and implementation
- Object-oriented design principles
- Mathematical and statistical computations
- Data structure manipulation
- Code organization and documentation

## Project Status

- ✅ Arithmetic Formatter - Completed
- ✅ Time Calculator - Completed
- ✅ Budget App - Completed
- ✅ Polygon Area Calculator - Completed
- ✅ Probability Calculator - Completed
