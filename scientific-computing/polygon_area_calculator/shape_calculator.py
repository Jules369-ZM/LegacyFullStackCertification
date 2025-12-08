class Rectangle:
    """
    A rectangle shape with width and height.
    """

    def __init__(self, width, height):
        """
        Initialize a rectangle.

        Args:
            width (int): Width of the rectangle
            height (int): Height of the rectangle
        """
        self.width = width
        self.height = height

    def set_width(self, width):
        """
        Set the width of the rectangle.

        Args:
            width (int): New width
        """
        self.width = width

    def set_height(self, height):
        """
        Set the height of the rectangle.

        Args:
            height (int): New height
        """
        self.height = height

    def get_area(self):
        """
        Calculate the area of the rectangle.

        Returns:
            int: Area of the rectangle
        """
        return self.width * self.height

    def get_perimeter(self):
        """
        Calculate the perimeter of the rectangle.

        Returns:
            int: Perimeter of the rectangle
        """
        return 2 * (self.width + self.height)

    def get_diagonal(self):
        """
        Calculate the diagonal of the rectangle.

        Returns:
            float: Diagonal length
        """
        return (self.width ** 2 + self.height ** 2) ** 0.5

    def get_picture(self):
        """
        Generate an ASCII art representation of the rectangle.

        Returns:
            str: ASCII art or message if too large
        """
        if self.width > 50 or self.height > 50:
            return "Too big for picture."

        picture = ""
        for _ in range(self.height):
            picture += "*" * self.width + "\n"
        return picture

    def get_amount_inside(self, shape):
        """
        Calculate how many of the given shape can fit inside this rectangle.

        Args:
            shape: Another shape object with get_area method

        Returns:
            int: Number of shapes that can fit
        """
        return self.get_area() // shape.get_area()

    def __str__(self):
        """
        String representation of the rectangle.

        Returns:
            str: Description of the rectangle
        """
        return f"Rectangle(width={self.width}, height={self.height})"


class Square(Rectangle):
    """
    A square shape (special case of rectangle where width = height).
    """

    def __init__(self, side):
        """
        Initialize a square.

        Args:
            side (int): Length of each side
        """
        super().__init__(side, side)
        self.side = side

    def set_side(self, side):
        """
        Set the side length of the square.

        Args:
            side (int): New side length
        """
        self.side = side
        self.width = side
        self.height = side

    def set_width(self, width):
        """
        Set the width (and height) of the square.

        Args:
            width (int): New width (also sets height)
        """
        self.set_side(width)

    def set_height(self, height):
        """
        Set the height (and width) of the square.

        Args:
            height (int): New height (also sets width)
        """
        self.set_side(height)

    def __str__(self):
        """
        String representation of the square.

        Returns:
            str: Description of the square
        """
        return f"Square(side={self.side})"
