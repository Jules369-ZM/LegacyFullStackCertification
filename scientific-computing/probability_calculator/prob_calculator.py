import random
import copy

class Hat:
    """
    A hat containing colored balls for probability experiments.
    """

    def __init__(self, **balls):
        """
        Initialize the hat with balls of different colors.

        Args:
            **balls: Keyword arguments where key is color and value is count
        """
        self.contents = []
        for color, count in balls.items():
            self.contents.extend([color] * count)

    def draw(self, num_balls):
        """
        Draw balls from the hat.

        Args:
            num_balls (int): Number of balls to draw

        Returns:
            list: List of drawn ball colors
        """
        if num_balls >= len(self.contents):
            return self.contents

        drawn = random.sample(self.contents, num_balls)

        # Remove drawn balls from contents
        for ball in drawn:
            self.contents.remove(ball)

        return drawn


def experiment(hat, expected_balls, num_balls_drawn, num_experiments):
    """
    Run probability experiments to calculate the likelihood of drawing certain balls.

    Args:
        hat (Hat): Hat object containing balls
        expected_balls (dict): Dictionary of expected balls {color: count}
        num_balls_drawn (int): Number of balls to draw each experiment
        num_experiments (int): Number of experiments to run

    Returns:
        float: Probability of getting at least the expected balls
    """
    successful_experiments = 0

    for _ in range(num_experiments):
        # Create a copy of the hat for each experiment
        hat_copy = copy.deepcopy(hat)

        # Draw balls
        drawn_balls = hat_copy.draw(num_balls_drawn)

        # Count drawn balls
        drawn_count = {}
        for ball in drawn_balls:
            drawn_count[ball] = drawn_count.get(ball, 0) + 1

        # Check if we have at least the expected balls
        success = True
        for color, expected_count in expected_balls.items():
            if drawn_count.get(color, 0) < expected_count:
                success = False
                break

        if success:
            successful_experiments += 1

    return successful_experiments / num_experiments
