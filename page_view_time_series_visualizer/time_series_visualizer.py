import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
import calendar

def draw_line_plot():
    """
    Create a line plot showing daily page views over time.

    Returns:
        fig: Matplotlib figure object
    """
    # Import data
    df = pd.read_csv('fcc-forum-pageviews.csv', index_col='date', parse_dates=['date'])

    # Clean data: Remove top 2.5% and bottom 2.5% of page views
    df = df[
        (df['value'] >= df['value'].quantile(0.025)) &
        (df['value'] <= df['value'].quantile(0.975))
    ]

    # Create figure and plot
    fig, ax = plt.subplots(figsize=(12, 6))
    ax.plot(df.index, df['value'], color='red', linewidth=1)

    # Set title and labels
    ax.set_title('Daily freeCodeCamp Forum Page Views 5/2016-12/2019')
    ax.set_xlabel('Date')
    ax.set_ylabel('Page Views')

    return fig

def draw_bar_plot():
    """
    Create a bar plot showing average daily page views by month and year.

    Returns:
        fig: Matplotlib figure object
    """
    # Import data
    df = pd.read_csv('fcc-forum-pageviews.csv', index_col='date', parse_dates=['date'])

    # Clean data
    df = df[
        (df['value'] >= df['value'].quantile(0.025)) &
        (df['value'] <= df['value'].quantile(0.975))
    ]

    # Prepare data for monthly bar plot
    df_bar = df.copy()
    df_bar['year'] = df_bar.index.year
    df_bar['month'] = df_bar.index.month

    # Group by year and month, calculate mean
    df_bar = df_bar.groupby(['year', 'month'])['value'].mean().unstack()

    # Create figure and plot
    fig, ax = plt.subplots(figsize=(12, 6))
    df_bar.plot(kind='bar', ax=ax)

    # Set title and labels
    ax.set_title('Average Daily Page Views per Month')
    ax.set_xlabel('Years')
    ax.set_ylabel('Average Page Views')

    # Set legend with month names
    month_names = [calendar.month_name[i] for i in range(1, 13)]
    ax.legend(month_names, title='Months')

    return fig

def draw_box_plot():
    """
    Create box plots showing year-wise and month-wise page view distributions.

    Returns:
        fig: Matplotlib figure object
    """
    # Import data
    df = pd.read_csv('fcc-forum-pageviews.csv', index_col='date', parse_dates=['date'])

    # Clean data
    df = df[
        (df['value'] >= df['value'].quantile(0.025)) &
        (df['value'] <= df['value'].quantile(0.975))
    ]

    # Prepare data for box plots
    df_box = df.copy()
    df_box.reset_index(inplace=True)
    df_box['year'] = [d.year for d in df_box.date]
    df_box['month'] = [d.strftime('%b') for d in df_box.date]

    # Create figure with two subplots
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 6))

    # Year-wise box plot
    sns.boxplot(x='year', y='value', data=df_box, ax=ax1)
    ax1.set_title('Year-wise Box Plot (Trend)')
    ax1.set_xlabel('Year')
    ax1.set_ylabel('Page Views')

    # Month-wise box plot
    month_order = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    sns.boxplot(x='month', y='value', data=df_box, order=month_order, ax=ax2)
    ax2.set_title('Month-wise Box Plot (Seasonality)')
    ax2.set_xlabel('Month')
    ax2.set_ylabel('Page Views')

    return fig
