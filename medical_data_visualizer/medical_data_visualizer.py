import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
import numpy as np

def draw_cat_plot():
    """
    Create a categorical plot showing cholesterol levels by cardio disease status.

    Returns:
        fig: Matplotlib figure object
    """
    # Import data
    df = pd.read_csv('medical_examination.csv')

    # Add 'overweight' column
    df['overweight'] = (df['weight'] / ((df['height'] / 100) ** 2) > 25).astype(int)

    # Normalize data by making 0 always good and 1 always bad
    df['cholesterol'] = df['cholesterol'].apply(lambda x: 0 if x == 1 else 1)
    df['gluc'] = df['gluc'].apply(lambda x: 0 if x == 1 else 1)
    df['smoke'] = df['smoke']  # 0 is good, 1 is bad already
    df['alco'] = df['alco']   # 0 is good, 1 is bad already
    df['active'] = df['active'].apply(lambda x: 0 if x == 1 else 1)  # Reverse: 1 is good, 0 is bad
    df['cardio'] = df['cardio']  # 0 is good, 1 is bad already

    # Create DataFrame for cat plot using `pd.melt`
    df_cat = pd.melt(df, id_vars=['cardio'],
                     value_vars=['cholesterol', 'gluc', 'smoke', 'alco', 'active', 'overweight'])

    # Group and reformat the data to split it by 'cardio'
    df_cat = df_cat.groupby(['cardio', 'variable', 'value']).size().reset_index(name='total')

    # Draw the catplot with 'sns.catplot()'
    fig = sns.catplot(x='variable', y='total', hue='value', col='cardio',
                      data=df_cat, kind='bar', height=5, aspect=1).fig

    return fig

def draw_heat_map():
    """
    Create a correlation heatmap of the medical examination data.

    Returns:
        fig: Matplotlib figure object
    """
    # Import data
    df = pd.read_csv('medical_examination.csv')

    # Clean the data
    df_heat = df[
        (df['ap_lo'] <= df['ap_hi']) &
        (df['height'] >= df['height'].quantile(0.025)) &
        (df['height'] <= df['height'].quantile(0.975)) &
        (df['weight'] >= df['weight'].quantile(0.025)) &
        (df['weight'] <= df['weight'].quantile(0.975))
    ]

    # Calculate the correlation matrix
    corr = df_heat.corr()

    # Generate a mask for the upper triangle
    mask = np.triu(np.ones_like(corr, dtype=bool))

    # Set up the matplotlib figure
    fig, ax = plt.subplots(figsize=(12, 9))

    # Draw the heatmap with 'sns.heatmap()'
    sns.heatmap(corr, mask=mask, annot=True, fmt='.1f',
                square=True, linewidths=0.5, center=0, ax=ax)

    return fig
