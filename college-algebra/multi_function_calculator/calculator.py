#!/usr/bin/env python3
"""
Multi-Function Calculator
A comprehensive calculator supporting basic arithmetic, advanced math, and scientific functions.
"""

import math
import cmath
import statistics
from decimal import Decimal, getcontext
import re


class MultiFunctionCalculator:
    """
    A versatile calculator supporting various mathematical operations.
    """

    def __init__(self):
        self.memory = 0
        self.history = []
        self.angle_mode = 'degrees'  # 'degrees' or 'radians'
        getcontext().prec = 10  # Set decimal precision

    def evaluate_expression(self, expression):
        """
        Evaluate a mathematical expression safely.

        Args:
            expression (str): Mathematical expression to evaluate

        Returns:
            float or complex: Result of the expression
        """
        try:
            # Replace mathematical functions with their Python equivalents
            expr = self._preprocess_expression(expression)

            # Use eval with restricted globals for safety
            allowed_names = {
                k: v for k, v in math.__dict__.items() if not k.startswith("__")
            }
            allowed_names.update({
                k: v for k, v in cmath.__dict__.items() if not k.startswith("__")
            })
            allowed_names.update({
                'sqrt': math.sqrt,
                'log': math.log,
                'ln': math.log,
                'exp': math.exp,
                'sin': self._sin,
                'cos': self._cos,
                'tan': self._tan,
                'asin': self._asin,
                'acos': self._acos,
                'atan': self._atan,
                'pi': math.pi,
                'e': math.e,
                'abs': abs,
                'round': round,
                'min': min,
                'max': max,
                'sum': sum,
                'len': len,
            })

            result = eval(expr, {"__builtins__": {}}, allowed_names)

            # Store in history
            self.history.append({
                'expression': expression,
                'result': result
            })

            return result

        except Exception as e:
            raise ValueError(f"Invalid expression: {str(e)}")

    def _preprocess_expression(self, expr):
        """
        Preprocess the expression to handle custom syntax.

        Args:
            expr (str): Input expression

        Returns:
            str: Processed expression
        """
        # Remove whitespace
        expr = expr.replace(' ', '')

        # Handle implicit multiplication (e.g., 2pi -> 2*pi)
        expr = re.sub(r'(\d)([a-zA-Z(])', r'\1*\2', expr)

        # Handle power notation (e.g., x^2 -> x**2)
        expr = expr.replace('^', '**')

        # Handle square root notation (e.g., sqrt(x) -> math.sqrt(x))
        expr = re.sub(r'sqrt\(([^)]+)\)', r'math.sqrt(\1)', expr)

        return expr

    def _sin(self, x):
        """Sine function with angle mode support"""
        if self.angle_mode == 'degrees':
            x = math.radians(x)
        return math.sin(x)

    def _cos(self, x):
        """Cosine function with angle mode support"""
        if self.angle_mode == 'degrees':
            x = math.radians(x)
        return math.cos(x)

    def _tan(self, x):
        """Tangent function with angle mode support"""
        if self.angle_mode == 'degrees':
            x = math.radians(x)
        return math.tan(x)

    def _asin(self, x):
        """Arc sine function"""
        result = math.asin(x)
        if self.angle_mode == 'degrees':
            result = math.degrees(result)
        return result

    def _acos(self, x):
        """Arc cosine function"""
        result = math.acos(x)
        if self.angle_mode == 'degrees':
            result = math.degrees(result)
        return result

    def _atan(self, x):
        """Arc tangent function"""
        result = math.atan(x)
        if self.angle_mode == 'degrees':
            result = math.degrees(result)
        return result

    def calculate_basic(self, a, b, operation):
        """
        Perform basic arithmetic operations.

        Args:
            a, b: Numbers to operate on
            operation (str): Operation (+, -, *, /, ^, %)

        Returns:
            float: Result of the operation
        """
        operations = {
            '+': lambda x, y: x + y,
            '-': lambda x, y: x - y,
            '*': lambda x, y: x * y,
            '/': lambda x, y: x / y if y != 0 else float('inf'),
            '^': lambda x, y: x ** y,
            '%': lambda x, y: x % y,
        }

        if operation not in operations:
            raise ValueError(f"Unknown operation: {operation}")

        result = operations[operation](a, b)
        self.history.append({
            'operation': f"{a} {operation} {b}",
            'result': result
        })

        return result

    def calculate_scientific(self, func_name, value):
        """
        Perform scientific calculations.

        Args:
            func_name (str): Function name (sin, cos, tan, log, ln, exp, sqrt, etc.)
            value: Input value

        Returns:
            float: Result of the function
        """
        functions = {
            'sin': self._sin,
            'cos': self._cos,
            'tan': self._tan,
            'asin': self._asin,
            'acos': self._acos,
            'atan': self._atan,
            'log': lambda x: math.log10(x),  # log base 10
            'ln': math.log,  # natural log
            'exp': math.exp,
            'sqrt': math.sqrt,
            'abs': abs,
            'factorial': math.factorial,
        }

        if func_name not in functions:
            raise ValueError(f"Unknown function: {func_name}")

        result = functions[func_name](value)
        self.history.append({
            'operation': f"{func_name}({value})",
            'result': result
        })

        return result

    def calculate_statistics(self, data, operation):
        """
        Perform statistical calculations.

        Args:
            data (list): List of numbers
            operation (str): Statistical operation (mean, median, mode, std, var, etc.)

        Returns:
            float: Result of the statistical calculation
        """
        if not data:
            raise ValueError("Data list cannot be empty")

        operations = {
            'mean': statistics.mean,
            'median': statistics.median,
            'mode': statistics.mode,
            'stdev': statistics.stdev,
            'variance': statistics.variance,
            'min': min,
            'max': max,
            'range': lambda x: max(x) - min(x),
            'sum': sum,
            'count': len,
        }

        if operation not in operations:
            raise ValueError(f"Unknown statistical operation: {operation}")

        result = operations[operation](data)
        self.history.append({
            'operation': f"{operation}({data})",
            'result': result
        })

        return result

    def solve_quadratic(self, a, b, c):
        """
        Solve quadratic equation ax² + bx + c = 0.

        Args:
            a, b, c: Coefficients of the quadratic equation

        Returns:
            tuple: (root1, root2) - can be complex numbers
        """
        if a == 0:
            raise ValueError("Coefficient 'a' cannot be zero")

        discriminant = b**2 - 4*a*c

        if discriminant >= 0:
            root1 = (-b + math.sqrt(discriminant)) / (2*a)
            root2 = (-b - math.sqrt(discriminant)) / (2*a)
        else:
            # Complex roots
            root1 = (-b + cmath.sqrt(discriminant)) / (2*a)
            root2 = (-b - cmath.sqrt(discriminant)) / (2*a)

        result = (root1, root2)
        self.history.append({
            'operation': f"Solve {a}x² + {b}x + {c} = 0",
            'result': result
        })

        return result

    def memory_store(self, value):
        """Store a value in memory"""
        self.memory = value

    def memory_recall(self):
        """Recall value from memory"""
        return self.memory

    def memory_add(self, value):
        """Add value to memory"""
        self.memory += value

    def memory_clear(self):
        """Clear memory"""
        self.memory = 0

    def set_angle_mode(self, mode):
        """
        Set angle mode for trigonometric functions.

        Args:
            mode (str): 'degrees' or 'radians'
        """
        if mode.lower() not in ['degrees', 'radians']:
            raise ValueError("Angle mode must be 'degrees' or 'radians'")
        self.angle_mode = mode.lower()

    def get_history(self, limit=None):
        """
        Get calculation history.

        Args:
            limit (int, optional): Maximum number of history items to return

        Returns:
            list: History of calculations
        """
        history = self.history
        if limit:
            history = history[-limit:]
        return history

    def clear_history(self):
        """Clear calculation history"""
        self.history = []


def main():
    """
    Command-line interface for the Multi-Function Calculator.
    """
    calc = MultiFunctionCalculator()

    print("Multi-Function Calculator")
    print("=" * 40)
    print("Commands:")
    print("  <expression>    - Evaluate mathematical expression")
    print("  basic <a> <op> <b>  - Basic arithmetic (+, -, *, /, ^, %)")
    print("  sci <func> <val>    - Scientific functions (sin, cos, log, etc.)")
    print("  stats <op> <nums>   - Statistics (mean, median, etc.)")
    print("  quad <a> <b> <c>    - Solve quadratic equation")
    print("  mem store <val>     - Store value in memory")
    print("  mem recall          - Recall memory value")
    print("  mem add <val>       - Add to memory")
    print("  mem clear           - Clear memory")
    print("  mode <deg|rad>      - Set angle mode")
    print("  history [limit]     - Show calculation history")
    print("  clear               - Clear history")
    print("  quit                - Exit calculator")
    print()

    while True:
        try:
            command = input("calc> ").strip()

            if not command:
                continue

            if command.lower() == 'quit':
                print("Goodbye!")
                break

            parts = command.split()
            cmd = parts[0].lower()

            if cmd == 'basic' and len(parts) == 4:
                a, op, b = float(parts[1]), parts[2], float(parts[3])
                result = calc.calculate_basic(a, b, op)
                print(f"Result: {result}")

            elif cmd == 'sci' and len(parts) == 3:
                func, val = parts[1], float(parts[2])
                result = calc.calculate_scientific(func, val)
                print(f"Result: {result}")

            elif cmd == 'stats' and len(parts) >= 3:
                op = parts[1]
                nums = [float(x) for x in parts[2:]]
                result = calc.calculate_statistics(nums, op)
                print(f"Result: {result}")

            elif cmd == 'quad' and len(parts) == 4:
                a, b, c = float(parts[1]), float(parts[2]), float(parts[3])
                root1, root2 = calc.calculate_quadratic(a, b, c)
                print(f"Roots: {root1}, {root2}")

            elif cmd == 'mem' and len(parts) >= 2:
                subcmd = parts[1].lower()
                if subcmd == 'store' and len(parts) == 3:
                    val = float(parts[2])
                    calc.memory_store(val)
                    print(f"Stored {val} in memory")
                elif subcmd == 'recall':
                    val = calc.memory_recall()
                    print(f"Memory: {val}")
                elif subcmd == 'add' and len(parts) == 3:
                    val = float(parts[2])
                    calc.memory_add(val)
                    print(f"Added {val} to memory")
                elif subcmd == 'clear':
                    calc.memory_clear()
                    print("Memory cleared")

            elif cmd == 'mode' and len(parts) == 2:
                mode = parts[1].lower()
                if mode in ['deg', 'degrees']:
                    calc.set_angle_mode('degrees')
                    print("Angle mode set to degrees")
                elif mode in ['rad', 'radians']:
                    calc.set_angle_mode('radians')
                    print("Angle mode set to radians")
                else:
                    print("Invalid mode. Use 'deg' or 'rad'")

            elif cmd == 'history':
                limit = int(parts[1]) if len(parts) > 1 else None
                history = calc.get_history(limit)
                for i, item in enumerate(history, 1):
                    print(f"{i}. {item.get('expression', item.get('operation', 'Unknown'))} = {item['result']}")

            elif cmd == 'clear':
                calc.clear_history()
                print("History cleared")

            else:
                # Try to evaluate as expression
                result = calc.evaluate_expression(command)
                print(f"Result: {result}")

        except Exception as e:
            print(f"Error: {e}")


if __name__ == '__main__':
    main()
