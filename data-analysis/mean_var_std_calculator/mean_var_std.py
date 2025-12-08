import numpy as np

def calculate(list):
    """
    Calculate statistical measures for a 3x3 matrix.

    Args:
        list: List of 9 numbers to form a 3x3 matrix

    Returns:
        dict: Dictionary containing mean, variance, standard deviation,
              max, min, and sum along both axes and flattened array
    """

    # Check if list has exactly 9 elements
    if len(list) != 9:
        raise ValueError("List must contain nine numbers.")

    # Convert list to 3x3 numpy array
    matrix = np.array(list).reshape(3, 3)

    calculations = {}

    # Calculate mean
    calculations['mean'] = [
        matrix.mean(axis=0).tolist(),  # mean along columns
        matrix.mean(axis=1).tolist(),  # mean along rows
        matrix.mean()                  # mean of flattened array
    ]

    # Calculate variance
    calculations['variance'] = [
        matrix.var(axis=0).tolist(),   # variance along columns
        matrix.var(axis=1).tolist(),   # variance along rows
        matrix.var()                   # variance of flattened array
    ]

    # Calculate standard deviation
    calculations['standard deviation'] = [
        matrix.std(axis=0).tolist(),   # std along columns
        matrix.std(axis=1).tolist(),   # std along rows
        matrix.std()                   # std of flattened array
    ]

    # Calculate max
    calculations['max'] = [
        matrix.max(axis=0).tolist(),   # max along columns
        matrix.max(axis=1).tolist(),   # max along rows
        matrix.max()                   # max of flattened array
    ]

    # Calculate min
    calculations['min'] = [
        matrix.min(axis=0).tolist(),   # min along columns
        matrix.min(axis=1).tolist(),   # min along rows
        matrix.min()                   # min of flattened array
    ]

    # Calculate sum
    calculations['sum'] = [
        matrix.sum(axis=0).tolist(),   # sum along columns
        matrix.sum(axis=1).tolist(),   # sum along rows
        matrix.sum()                   # sum of flattened array
    ]

    return calculations
