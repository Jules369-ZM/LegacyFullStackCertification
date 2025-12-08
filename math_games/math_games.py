#!/usr/bin/env python3
"""
Math Games - Educational games to practice mathematical concepts
"""

import random
import time
import math


class MathGames:
    """
    A collection of educational math games.
    """

    def __init__(self):
        self.score = 0
        self.questions_asked = 0
        self.start_time = None

    def start_game(self, game_type, difficulty='medium', num_questions=10):
        """
        Start a math game session.

        Args:
            game_type (str): Type of game ('arithmetic', 'algebra', 'geometry', 'trigonometry')
            difficulty (str): Difficulty level ('easy', 'medium', 'hard')
            num_questions (int): Number of questions to ask
        """
        self.score = 0
        self.questions_asked = 0
        self.start_time = time.time()

        print(f"Starting {difficulty} {game_type} game with {num_questions} questions!")
        print("=" * 60)

        for i in range(num_questions):
            print(f"\nQuestion {i + 1}/{num_questions}:")
            correct = self.ask_question(game_type, difficulty)
            self.questions_asked += 1

            if correct:
                self.score += 1
                print("✅ Correct!")
            else:
                print("❌ Incorrect.")

        self.show_results()

    def ask_question(self, game_type, difficulty):
        """
        Ask a single question based on game type and difficulty.

        Args:
            game_type (str): Type of game
            difficulty (str): Difficulty level

        Returns:
            bool: True if answer is correct, False otherwise
        """
        if game_type == 'arithmetic':
            return self.arithmetic_question(difficulty)
        elif game_type == 'algebra':
            return self.algebra_question(difficulty)
        elif game_type == 'geometry':
            return self.geometry_question(difficulty)
        elif game_type == 'trigonometry':
            return self.trigonometry_question(difficulty)
        else:
            print("Unknown game type!")
            return False

    def arithmetic_question(self, difficulty):
        """Generate arithmetic questions"""
        operations = ['+', '-', '*', '/']

        if difficulty == 'easy':
            max_num = 20
            operations = ['+', '-', '*']
        elif difficulty == 'medium':
            max_num = 50
            operations = ['+', '-', '*', '/']
        else:  # hard
            max_num = 100
            operations = ['+', '-', '*', '/']

        a = random.randint(1, max_num)
        b = random.randint(1, max_num)
        op = random.choice(operations)

        # Avoid division by zero and ensure integer results
        if op == '/':
            # Make sure division results in integer
            result = random.randint(1, max_num // 2)
            b = random.randint(1, max_num // 2)
            a = result * b

        question = f"What is {a} {op} {b}?"
        print(question)

        if op == '+':
            correct_answer = a + b
        elif op == '-':
            correct_answer = a - b
        elif op == '*':
            correct_answer = a * b
        else:  # division
            correct_answer = a // b

        return self.get_answer(correct_answer)

    def algebra_question(self, difficulty):
        """Generate algebra questions"""
        question_types = ['linear_equation', 'quadratic_formula', 'simplify_expression']

        if difficulty == 'easy':
            question_type = random.choice(['linear_equation', 'simplify_expression'])
        else:
            question_type = random.choice(question_types)

        if question_type == 'linear_equation':
            # Solve: ax + b = c
            a = random.randint(1, 5)
            b = random.randint(-10, 10)
            c = random.randint(-20, 20)

            question = f"Solve for x: {a}x + {b} = {c}"
            correct_answer = (c - b) / a

        elif question_type == 'quadratic_formula':
            # Quadratic equation: ax² + bx + c = 0
            if difficulty == 'easy':
                a, b, c = 1, random.randint(-5, 5), random.randint(1, 10)
            else:
                a = random.randint(1, 3)
                b = random.randint(-8, 8)
                c = random.randint(-10, 10)

            discriminant = b**2 - 4*a*c
            if discriminant >= 0:
                root1 = (-b + math.sqrt(discriminant)) / (2*a)
                root2 = (-b - math.sqrt(discriminant)) / (2*a)
                correct_answer = f"{root1:.2f}, {root2:.2f}"
            else:
                correct_answer = "No real roots"

            question = f"Solve: {a}x² + {b}x + {c} = 0"

        else:  # simplify_expression
            # Simple algebraic simplification
            expressions = [
                ("2(x + 3)", "2x + 6"),
                ("3x + 2x", "5x"),
                ("(x + 2)(x + 3)", "x² + 5x + 6"),
            ]
            expr, answer = random.choice(expressions)
            question = f"Simplify: {expr}"
            correct_answer = answer

        print(question)
        return self.get_answer(correct_answer, is_text=True)

    def geometry_question(self, difficulty):
        """Generate geometry questions"""
        shapes = ['circle', 'rectangle', 'triangle', 'square']

        if difficulty == 'easy':
            shape = random.choice(['circle', 'rectangle', 'square'])
        else:
            shape = random.choice(shapes)

        if shape == 'circle':
            radius = random.randint(1, 10)
            question = f"What is the area of a circle with radius {radius}?"
            correct_answer = math.pi * radius ** 2

        elif shape == 'rectangle':
            length = random.randint(1, 10)
            width = random.randint(1, 10)
            question = f"What is the area of a rectangle with length {length} and width {width}?"
            correct_answer = length * width

        elif shape == 'square':
            side = random.randint(1, 10)
            question = f"What is the area of a square with side length {side}?"
            correct_answer = side ** 2

        else:  # triangle
            base = random.randint(1, 10)
            height = random.randint(1, 10)
            question = f"What is the area of a triangle with base {base} and height {height}?"
            correct_answer = (base * height) / 2

        print(question)
        return self.get_answer(correct_answer)

    def trigonometry_question(self, difficulty):
        """Generate trigonometry questions"""
        functions = ['sin', 'cos', 'tan']

        if difficulty == 'easy':
            angle = random.choice([0, 30, 45, 60, 90])
            func = random.choice(['sin', 'cos'])
        else:
            angle = random.randint(0, 360)
            func = random.choice(functions)

        # Convert angle to radians for calculation
        angle_rad = math.radians(angle)

        if func == 'sin':
            correct_answer = math.sin(angle_rad)
        elif func == 'cos':
            correct_answer = math.cos(angle_rad)
        else:  # tan
            if angle % 180 == 90:  # Undefined
                correct_answer = "undefined"
            else:
                correct_answer = math.tan(angle_rad)

        question = f"What is {func}({angle}°)?"
        print(question)

        if isinstance(correct_answer, str):
            return self.get_answer(correct_answer, is_text=True)
        else:
            return self.get_answer(correct_answer)

    def get_answer(self, correct_answer, is_text=False):
        """
        Get user's answer and check if correct.

        Args:
            correct_answer: The correct answer
            is_text (bool): Whether the answer is text or numeric

        Returns:
            bool: True if correct, False otherwise
        """
        try:
            user_input = input("Your answer: ").strip()

            if is_text:
                # Text comparison (case insensitive)
                return user_input.lower() == str(correct_answer).lower()
            else:
                # Numeric comparison with tolerance
                user_answer = float(user_input)
                tolerance = 0.01
                return abs(user_answer - correct_answer) < tolerance

        except (ValueError, KeyboardInterrupt):
            return False

    def show_results(self):
        """Display game results"""
        end_time = time.time()
        duration = end_time - self.start_time

        percentage = (self.score / self.questions_asked) * 100 if self.questions_asked > 0 else 0

        print("\n" + "=" * 60)
        print("GAME RESULTS")
        print("=" * 60)
        print(f"Questions answered: {self.questions_asked}")
        print(f"Correct answers: {self.score}")
        print(".1f")
        print(".1f")
        print(".1f")

        # Performance rating
        if percentage >= 90:
            print("🏆 Excellent performance!")
        elif percentage >= 80:
            print("👏 Great job!")
        elif percentage >= 70:
            print("👍 Good work!")
        elif percentage >= 60:
            print("📚 Keep practicing!")
        else:
            print("🎯 Don't give up! Keep learning!")

    def show_menu(self):
        """Display the game menu"""
        print("\nMath Games Menu")
        print("=" * 30)
        print("1. Arithmetic Practice")
        print("2. Algebra Challenge")
        print("3. Geometry Quiz")
        print("4. Trigonometry Test")
        print("5. Mixed Review")
        print("6. Exit")
        print()

    def run(self):
        """Main game loop"""
        print("🎮 Welcome to Math Games!")
        print("Practice your math skills with fun, educational games!")

        while True:
            self.show_menu()

            try:
                choice = input("Choose a game (1-6): ").strip()

                if choice == '6':
                    print("Thanks for playing! Goodbye! 👋")
                    break

                # Get difficulty
                difficulty = input("Choose difficulty (easy/medium/hard): ").strip().lower()
                if difficulty not in ['easy', 'medium', 'hard']:
                    difficulty = 'medium'

                # Get number of questions
                try:
                    num_questions = int(input("Number of questions (1-20): ").strip())
                    num_questions = max(1, min(20, num_questions))
                except ValueError:
                    num_questions = 10

                # Map choice to game type
                game_types = {
                    '1': 'arithmetic',
                    '2': 'algebra',
                    '3': 'geometry',
                    '4': 'trigonometry',
                    '5': 'mixed'
                }

                if choice in game_types:
                    game_type = game_types[choice]
                    self.start_game(game_type, difficulty, num_questions)
                else:
                    print("Invalid choice. Please try again.")

            except KeyboardInterrupt:
                print("\n\nGame interrupted. Thanks for playing!")
                break
            except Exception as e:
                print(f"An error occurred: {e}")


def main():
    """Main function"""
    game = MathGames()
    game.run()


if __name__ == '__main__':
    main()
