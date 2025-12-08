#!/usr/bin/env python3
"""
Graphing Calculator
A tool for plotting mathematical functions and analyzing their properties.
"""

import numpy as np
import matplotlib.pyplot as plt
import math
import re
from scipy.optimize import minimize_scalar
import sympy as sp


class GraphingCalculator:
    """
    A graphing calculator for plotting and analyzing mathematical functions.
    """

    def __init__(self):
        self.functions = {}
        self.current_range = (-10, 10)
        self.points = 1000

    def add_function(self, name, expression):
        """
        Add a mathematical function to the calculator.

        Args:
            name (str): Name of the function
            expression (str): Mathematical expression (e.g., 'x**2 + 2*x + 1')
        """
        # Validate the expression
        self._validate_expression(expression)

        self.functions[name] = {
            'expression': expression,
            'compiled': compile(expression, '<string>', 'eval'),
            'color': self._get_next_color()
        }

    def _validate_expression(self, expression):
        """
        Validate a mathematical expression.

        Args:
            expression (str): Expression to validate

        Raises:
            ValueError: If expression is invalid
        """
        # Test with a sample value
        test_x = 1.0
        try:
            # Safe evaluation with limited globals
            allowed_names = {
                k: v for k, v in math.__dict__.items() if not k.startswith("__")
            }
            allowed_names.update({
                'x': test_x,
                'pi': math.pi,
                'e': math.e,
                'sin': math.sin,
                'cos': math.cos,
                'tan': math.tan,
                'log': math.log,
                'exp': math.exp,
                'sqrt': math.sqrt,
                'abs': abs,
            })

            eval(expression, {"__builtins__": {}}, allowed_names)
        except Exception as e:
            raise ValueError(f"Invalid expression: {e}")

    def _get_next_color(self):
        """Get next color for plotting"""
        colors = ['blue', 'red', 'green', 'orange', 'purple', 'brown', 'pink', 'gray', 'olive', 'cyan']
        used_colors = [f['color'] for f in self.functions.values()]
        available_colors = [c for c in colors if c not in used_colors]
        return available_colors[0] if available_colors else 'black'

    def evaluate_function(self, name, x_value):
        """
        Evaluate a function at a specific x value.

        Args:
            name (str): Function name
            x_value (float): x value to evaluate at

        Returns:
            float: Function value at x
        """
        if name not in self.functions:
            raise ValueError(f"Function '{name}' not found")

        func_data = self.functions[name]
        expression = func_data['expression']

        # Safe evaluation
        allowed_names = {
            k: v for k, v in math.__dict__.items() if not k.startswith("__")
        }
        allowed_names.update({
            'x': x_value,
            'pi': math.pi,
            'e': math.e,
            'sin': math.sin,
            'cos': math.cos,
            'tan': math.tan,
            'log': math.log,
            'exp': math.exp,
            'sqrt': math.sqrt,
            'abs': abs,
        })

        try:
            result = eval(expression, {"__builtins__": {}}, allowed_names)
            return float(result)
        except Exception as e:
            raise ValueError(f"Error evaluating function: {e}")

    def plot_functions(self, x_range=None, show_grid=True, show_legend=True):
        """
        Plot all functions.

        Args:
            x_range (tuple, optional): (min_x, max_x) range for plotting
            show_grid (bool): Whether to show grid
            show_legend (bool): Whether to show legend
        """
        if not self.functions:
            print("No functions to plot. Add functions first.")
            return

        if x_range is None:
            x_range = self.current_range

        x_min, x_max = x_range
        x_values = np.linspace(x_min, x_max, self.points)

        plt.figure(figsize=(12, 8))

        for name, func_data in self.functions.items():
            try:
                y_values = []
                for x in x_values:
                    try:
                        y = self.evaluate_function(name, x)
                        # Skip infinite or very large values
                        if abs(y) > 1e6 or not np.isfinite(y):
                            y = np.nan
                        y_values.append(y)
                    except:
                        y_values.append(np.nan)

                y_values = np.array(y_values)
                valid_mask = np.isfinite(y_values)

                if np.any(valid_mask):
                    plt.plot(x_values[valid_mask], y_values[valid_mask],
                           label=f'{name}: {func_data["expression"]}',
                           color=func_data['color'], linewidth=2)

            except Exception as e:
                print(f"Error plotting function {name}: {e}")

        plt.title('Function Plotter', fontsize=16, fontweight='bold')
        plt.xlabel('x', fontsize=12)
        plt.ylabel('y', fontsize=12)

        if show_grid:
            plt.grid(True, alpha=0.3)

        if show_legend:
            plt.legend(bbox_to_anchor=(1.05, 1), loc='upper left')

        plt.axhline(y=0, color='black', linewidth=0.8, alpha=0.5)
        plt.axvline(x=0, color='black', linewidth=0.8, alpha=0.5)

        plt.tight_layout()
        plt.show()

    def find_roots(self, name, x_range=None):
        """
        Find roots (zeros) of a function using numerical methods.

        Args:
            name (str): Function name
            x_range (tuple, optional): Range to search in

        Returns:
            list: List of approximate roots found
        """
        if name not in self.functions:
            raise ValueError(f"Function '{name}' not found")

        if x_range is None:
            x_range = self.current_range

        x_min, x_max = x_range
        roots = []

        # Check multiple intervals for roots
        intervals = 50
        x_test = np.linspace(x_min, x_max, intervals)

        for i in range(len(x_test) - 1):
            try:
                x1, x2 = x_test[i], x_test[i + 1]
                y1 = self.evaluate_function(name, x1)
                y2 = self.evaluate_function(name, x2)

                # Check if there's a sign change (indicating a root)
                if y1 * y2 <= 0 and np.isfinite(y1) and np.isfinite(y2):
                    # Use bisection method to find root
                    root = self._bisection_method(name, x1, x2)
                    if root is not None:
                        roots.append(round(root, 6))
            except:
                continue

        # Remove duplicates (within tolerance)
        unique_roots = []
        tolerance = 1e-6
        for root in sorted(roots):
            if not unique_roots or abs(root - unique_roots[-1]) > tolerance:
                unique_roots.append(root)

        return unique_roots

    def _bisection_method(self, name, a, b, tol=1e-6, max_iter=100):
        """
        Find root using bisection method.

        Args:
            name (str): Function name
            a, b (float): Interval endpoints
            tol (float): Tolerance for convergence
            max_iter (int): Maximum iterations

        Returns:
            float or None: Approximate root or None if not found
        """
        fa = self.evaluate_function(name, a)
        fb = self.evaluate_function(name, b)

        if fa * fb >= 0:
            return None  # No sign change

        for _ in range(max_iter):
            c = (a + b) / 2
            fc = self.evaluate_function(name, c)

            if abs(fc) < tol:
                return c

            if fa * fc < 0:
                b = c
                fb = fc
            else:
                a = c
                fa = fc

        return (a + b) / 2

    def find_extrema(self, name, x_range=None):
        """
        Find local extrema of a function.

        Args:
            name (str): Function name
            x_range (tuple, optional): Range to search in

        Returns:
            dict: Dictionary with 'maxima' and 'minima' lists
        """
        if name not in self.functions:
            raise ValueError(f"Function '{name}' not found")

        if x_range is None:
            x_range = self.current_range

        x_min, x_max = x_range

        # Sample points to find potential extrema
        x_test = np.linspace(x_min, x_max, 1000)
        y_values = []

        for x in x_test:
            try:
                y = self.evaluate_function(name, x)
                y_values.append(y if np.isfinite(y) else np.nan)
            except:
                y_values.append(np.nan)

        y_values = np.array(y_values)

        # Find local maxima and minima
        maxima = []
        minima = []

        for i in range(1, len(x_test) - 1):
            if (not np.isnan(y_values[i-1]) and not np.isnan(y_values[i]) and not np.isnan(y_values[i+1])):
                if y_values[i] > y_values[i-1] and y_values[i] > y_values[i+1]:
                    maxima.append((round(x_test[i], 4), round(y_values[i], 4)))
                elif y_values[i] < y_values[i-1] and y_values[i] < y_values[i+1]:
                    minima.append((round(x_test[i], 4), round(y_values[i], 4)))

        return {
            'maxima': maxima,
            'minima': minima
        }

    def calculate_integral(self, name, a, b, method='trapezoidal', n=1000):
        """
        Approximate definite integral using numerical integration.

        Args:
            name (str): Function name
            a, b (float): Integration limits
            method (str): Integration method ('trapezoidal' or 'simpson')
            n (int): Number of intervals

        Returns:
            float: Approximate integral value
        """
        if name not in self.functions:
            raise ValueError(f"Function '{name}' not found")

        if method == 'trapezoidal':
            return self._trapezoidal_integral(name, a, b, n)
        elif method == 'simpson':
            return self._simpson_integral(name, a, b, n)
        else:
            raise ValueError("Method must be 'trapezoidal' or 'simpson'")

    def _trapezoidal_integral(self, name, a, b, n):
        """Trapezoidal rule integration"""
        h = (b - a) / n
        x_values = np.linspace(a, b, n + 1)
        y_values = [self.evaluate_function(name, x) for x in x_values]

        integral = h * (0.5 * y_values[0] + 0.5 * y_values[-1] + sum(y_values[1:-1]))
        return integral

    def _simpson_integral(self, name, a, b, n):
        """Simpson's rule integration"""
        if n % 2 != 0:
            n += 1  # Simpson's rule requires even number of intervals

        h = (b - a) / n
        x_values = np.linspace(a, b, n + 1)
        y_values = [self.evaluate_function(name, x) for x in x_values]

        integral = h/3 * (y_values[0] + y_values[-1] +
                         4 * sum(y_values[1:-1:2]) +
                         2 * sum(y_values[2:-1:2]))
        return integral

    def get_function_info(self, name):
        """
        Get information about a function.

        Args:
            name (str): Function name

        Returns:
            dict: Function information
        """
        if name not in self.functions:
            raise ValueError(f"Function '{name}' not found")

        func_data = self.functions[name]

        return {
            'name': name,
            'expression': func_data['expression'],
            'color': func_data['color']
        }

    def list_functions(self):
        """
        List all available functions.

        Returns:
            list: List of function names
        """
        return list(self.functions.keys())

    def remove_function(self, name):
        """
        Remove a function.

        Args:
            name (str): Function name to remove
        """
        if name in self.functions:
            del self.functions[name]
        else:
            raise ValueError(f"Function '{name}' not found")

    def set_plot_range(self, x_min, x_max):
        """
        Set the plotting range.

        Args:
            x_min, x_max (float): Plotting range
        """
        if x_min >= x_max:
            raise ValueError("x_min must be less than x_max")
        self.current_range = (x_min, x_max)

    def reset(self):
        """Reset the calculator"""
        self.functions = {}
        self.current_range = (-10, 10)


def main():
    """
    Command-line interface for the Graphing Calculator.
    """
    calc = GraphingCalculator()

    print("Graphing Calculator")
    print("=" * 40)
    print("Commands:")
    print("  add <name> <expression>  - Add function (e.g., add f x**2 + 2*x + 1)")
    print("  plot                     - Plot all functions")
    print("  roots <name>            - Find roots of function")
    print("  extrema <name>          - Find extrema of function")
    print("  integral <name> <a> <b> - Calculate definite integral")
    print("  eval <name> <x>         - Evaluate function at x")
    print("  range <min> <max>       - Set plotting range")
    print("  list                     - List all functions")
    print("  remove <name>           - Remove function")
    print("  info <name>             - Get function info")
    print("  reset                    - Reset calculator")
    print("  help                     - Show this help")
    print("  quit                     - Exit calculator")
    print()

    while True:
        try:
            command = input("graph> ").strip()

            if not command:
                continue

            if command.lower() == 'quit':
                print("Goodbye!")
                break

            parts = command.split()
            cmd = parts[0].lower()

            if cmd == 'add' and len(parts) >= 3:
                name = parts[1]
                expression = ' '.join(parts[2:])
                calc.add_function(name, expression)
                print(f"Added function '{name}': {expression}")

            elif cmd == 'plot':
                calc.plot_functions()

            elif cmd == 'roots' and len(parts) == 2:
                name = parts[1]
                roots = calc.find_roots(name)
                if roots:
                    print(f"Roots of {name}: {roots}")
                else:
                    print(f"No roots found for {name} in current range")

            elif cmd == 'extrema' and len(parts) == 2:
                name = parts[1]
                extrema = calc.find_extrema(name)
                print(f"Local maxima of {name}: {extrema['maxima']}")
                print(f"Local minima of {name}: {extrema['minima']}")

            elif cmd == 'integral' and len(parts) == 4:
                name = parts[1]
                a, b = float(parts[2]), float(parts[3])
                integral = calc.calculate_integral(name, a, b)
                print(".4f")

            elif cmd == 'eval' and len(parts) == 3:
                name = parts[1]
                x_val = float(parts[2])
                result = calc.evaluate_function(name, x_val)
                print(".4f")

            elif cmd == 'range' and len(parts) == 3:
                x_min, x_max = float(parts[1]), float(parts[2])
                calc.set_plot_range(x_min, x_max)
                print(f"Plot range set to ({x_min}, {x_max})")

            elif cmd == 'list':
                functions = calc.list_functions()
                if functions:
                    print("Available functions:")
                    for name in functions:
                        info = calc.get_function_info(name)
                        print(f"  {name}: {info['expression']}")
                else:
                    print("No functions defined")

            elif cmd == 'remove' and len(parts) == 2:
                name = parts[1]
                calc.remove_function(name)
                print(f"Removed function '{name}'")

            elif cmd == 'info' and len(parts) == 2:
                name = parts[1]
                info = calc.get_function_info(name)
                print(f"Function: {info['name']}")
                print(f"Expression: {info['expression']}")
                print(f"Color: {info['color']}")

            elif cmd == 'reset':
                calc.reset()
                print("Calculator reset")

            elif cmd == 'help':
                print("Available commands:")
                print("  add <name> <expression>  - Add function")
                print("  plot                     - Plot all functions")
                print("  roots <name>            - Find roots")
                print("  extrema <name>          - Find extrema")
                print("  integral <name> <a> <b> - Calculate integral")
                print("  eval <name> <x>         - Evaluate at x")
                print("  range <min> <max>       - Set plot range")
                print("  list                     - List functions")
                print("  remove <name>           - Remove function")
                print("  reset                    - Reset calculator")
                print("  quit                     - Exit")

            else:
                print("Invalid command. Type 'help' for available commands.")

        except Exception as e:
            print(f"Error: {e}")


if __name__ == '__main__':
    main()
