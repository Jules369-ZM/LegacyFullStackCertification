import pandas as pd
import matplotlib.pyplot as plt
from scipy.stats import linregress
import numpy as np

def draw_plot():
    """
    Create a scatter plot with linear regression lines for sea level data.

    Returns:
        fig: Matplotlib figure object
    """
    # Read data from file
    df = pd.read_csv('epa-sea-level.csv')

    # Create scatter plot
    fig, ax = plt.subplots(figsize=(12, 8))
    ax.scatter(df['Year'], df['CSIRO Adjusted Sea Level'], label='CSIRO Adjusted Sea Level')

    # Create first line of best fit (using all data)
    slope, intercept, r_value, p_value, std_err = linregress(df['Year'], df['CSIRO Adjusted Sea Level'])

    # Generate x values for the line (extend to 2050)
    x_future = np.arange(df['Year'].min(), 2051)
    y_future = slope * x_future + intercept

    # Plot the first line
    ax.plot(x_future, y_future, color='red', label='Best fit line (1880-2013)')

    # Create second line of best fit (using data from 2000 onwards)
    df_recent = df[df['Year'] >= 2000]
    slope_recent, intercept_recent, r_value_recent, p_value_recent, std_err_recent = linregress(
        df_recent['Year'], df_recent['CSIRO Adjusted Sea Level']
    )

    # Generate x values for the second line (extend to 2050)
    x_future_recent = np.arange(2000, 2051)
    y_future_recent = slope_recent * x_future_recent + intercept_recent

    # Plot the second line
    ax.plot(x_future_recent, y_future_recent, color='green', label='Best fit line (2000-2013)')

    # Set labels and title
    ax.set_xlabel('Year')
    ax.set_ylabel('Sea Level (inches)')
    ax.set_title('Rise in Sea Level')

    # Add legend
    ax.legend()

    # Add grid
    ax.grid(True, alpha=0.3)

    return fig
