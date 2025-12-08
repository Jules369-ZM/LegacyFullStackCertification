class Category:
    """
    A budget category that can track expenses and deposits.
    """

    def __init__(self, name):
        """
        Initialize a budget category.

        Args:
            name (str): Name of the budget category
        """
        self.name = name
        self.ledger = []
        self.balance = 0.0

    def deposit(self, amount, description=""):
        """
        Add funds to the category.

        Args:
            amount (float): Amount to deposit
            description (str): Optional description of the deposit
        """
        self.ledger.append({"amount": amount, "description": description})
        self.balance += amount

    def withdraw(self, amount, description=""):
        """
        Withdraw funds from the category if sufficient balance exists.

        Args:
            amount (float): Amount to withdraw
            description (str): Optional description of the withdrawal

        Returns:
            bool: True if withdrawal was successful, False otherwise
        """
        if self.check_funds(amount):
            self.ledger.append({"amount": -amount, "description": description})
            self.balance -= amount
            return True
        return False

    def get_balance(self):
        """
        Get the current balance of the category.

        Returns:
            float: Current balance
        """
        return self.balance

    def transfer(self, amount, category):
        """
        Transfer funds from this category to another category.

        Args:
            amount (float): Amount to transfer
            category (Category): Category to transfer to

        Returns:
            bool: True if transfer was successful, False otherwise
        """
        if self.check_funds(amount):
            self.withdraw(amount, f"Transfer to {category.name}")
            category.deposit(amount, f"Transfer from {self.name}")
            return True
        return False

    def check_funds(self, amount):
        """
        Check if the category has sufficient funds.

        Args:
            amount (float): Amount to check

        Returns:
            bool: True if sufficient funds, False otherwise
        """
        return self.balance >= amount

    def __str__(self):
        """
        String representation of the category with formatted ledger.

        Returns:
            str: Formatted category information
        """
        title = f"{self.name:*^30}\n"
        items = ""

        for item in self.ledger:
            desc = item["description"][:23] if len(item["description"]) > 23 else item["description"]
            amount = f"{item['amount']:.2f}"
            items += f"{desc:<23}{amount:>7}\n"

        total = f"Total: {self.balance:.2f}"

        return title + items + total


def create_spend_chart(categories):
    """
    Create a bar chart showing spending percentages for each category.

    Args:
        categories (list): List of Category objects

    Returns:
        str: Formatted bar chart
    """
    # Calculate total spending for each category
    spending = {}
    total_spent = 0

    for category in categories:
        spent = sum(-item["amount"] for item in category.ledger if item["amount"] < 0)
        spending[category.name] = spent
        total_spent += spent

    # Calculate percentages (rounded down to nearest 10)
    percentages = {}
    for name, spent in spending.items():
        if total_spent > 0:
            percentage = int((spent / total_spent) * 100 // 10 * 10)
        else:
            percentage = 0
        percentages[name] = percentage

    # Create the chart
    chart = "Percentage spent by category\n"

    # Add percentage lines (100% to 0%)
    for i in range(100, -1, -10):
        chart += f"{i:>3}| "
        for category in categories:
            if percentages[category.name] >= i:
                chart += "o  "
            else:
                chart += "   "
        chart += "\n"

    # Add horizontal line
    chart += "    " + "-" * (len(categories) * 3 + 1) + "\n"

    # Add category names
    max_name_len = max(len(category.name) for category in categories)

    for i in range(max_name_len):
        chart += "     "
        for category in categories:
            if i < len(category.name):
                chart += category.name[i] + "  "
            else:
                chart += "   "
        if i < max_name_len - 1:
            chart += "\n"

    return chart
