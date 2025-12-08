def arithmetic_arranger(problems, show_answers=False):
    """
    Arranges arithmetic problems in a vertical format.

    Args:
        problems (list): List of arithmetic problems as strings
        show_answers (bool): Whether to show the answers (optional)

    Returns:
        str: Formatted arithmetic problems or error message
    """

    # Check if there are too many problems
    if len(problems) > 5:
        return "Error: Too many problems."

    # Initialize lists to store formatted lines
    first_line = []
    second_line = []
    dashes = []
    answers = []

    for problem in problems:
        # Split the problem into parts
        parts = problem.split()

        # Validate the problem format
        if len(parts) != 3:
            return "Error: Invalid problem format."

        first_num, operator, second_num = parts

        # Validate operator
        if operator not in ['+', '-']:
            return "Error: Operator must be '+' or '-'."

        # Validate numbers
        if not (first_num.isdigit() and second_num.isdigit()):
            return "Error: Numbers must only contain digits."

        # Check number lengths
        if len(first_num) > 4 or len(second_num) > 4:
            return "Error: Numbers cannot be more than four digits."

        # Calculate the result if needed
        if show_answers:
            if operator == '+':
                result = str(int(first_num) + int(second_num))
            else:
                result = str(int(first_num) - int(second_num))
        else:
            result = ""

        # Determine the width of the problem
        width = max(len(first_num), len(second_num)) + 2

        # Format each line
        first_line.append(first_num.rjust(width))
        second_line.append(operator + second_num.rjust(width - 1))
        dashes.append('-' * width)

        if show_answers:
            answers.append(result.rjust(width))

    # Combine all lines
    arranged_problems = '\n'.join([
        '    '.join(first_line),
        '    '.join(second_line),
        '    '.join(dashes)
    ])

    # Add answers if requested
    if show_answers:
        arranged_problems += '\n' + '    '.join(answers)

    return arranged_problems
