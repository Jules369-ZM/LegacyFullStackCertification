#!/usr/bin/env python3
"""
Financial Calculator - Calculate loans, mortgages, investments, and savings
"""

import math
from decimal import Decimal, getcontext
import datetime


class FinancialCalculator:
    """
    A comprehensive financial calculator for loans, mortgages, investments, and savings.
    """

    def __init__(self):
        getcontext().prec = 10  # Set decimal precision

    def calculate_loan_payment(self, principal, annual_rate, years, payment_frequency=12):
        """
        Calculate loan/mortgage payment using the amortization formula.

        Args:
            principal (float): Loan amount
            annual_rate (float): Annual interest rate (as decimal, e.g., 0.05 for 5%)
            years (float): Loan term in years
            payment_frequency (int): Number of payments per year (default: 12)

        Returns:
            dict: Payment details
        """
        if principal <= 0 or annual_rate < 0 or years <= 0:
            raise ValueError("Invalid loan parameters")

        # Convert to periodic rate and number of payments
        periodic_rate = annual_rate / payment_frequency
        num_payments = years * payment_frequency

        # Calculate payment using amortization formula
        if periodic_rate == 0:
            payment = principal / num_payments
        else:
            payment = principal * (periodic_rate * (1 + periodic_rate) ** num_payments) / \
                     ((1 + periodic_rate) ** num_payments - 1)

        # Calculate total payments and interest
        total_payments = payment * num_payments
        total_interest = total_payments - principal

        return {
            'monthly_payment': payment,
            'total_payments': total_payments,
            'total_interest': total_interest,
            'num_payments': num_payments,
            'principal': principal,
            'annual_rate': annual_rate,
            'years': years
        }

    def calculate_investment_growth(self, principal, annual_rate, years, compound_frequency=12, monthly_contribution=0):
        """
        Calculate investment growth with compound interest and regular contributions.

        Args:
            principal (float): Initial investment amount
            annual_rate (float): Annual interest rate (as decimal)
            years (float): Investment period in years
            compound_frequency (int): Compounding frequency per year
            monthly_contribution (float): Monthly contribution amount

        Returns:
            dict: Investment growth details
        """
        if principal < 0 or annual_rate < 0 or years <= 0:
            raise ValueError("Invalid investment parameters")

        periodic_rate = annual_rate / compound_frequency
        num_periods = years * compound_frequency

        # Future value calculation
        if monthly_contribution == 0:
            # Simple compound interest
            future_value = principal * (1 + periodic_rate) ** num_periods
            total_contributions = principal
        else:
            # With regular contributions
            future_value = principal * (1 + periodic_rate) ** num_periods
            # Future value of annuity
            contribution_fv = monthly_contribution * \
                            (((1 + periodic_rate) ** num_periods - 1) / periodic_rate)
            future_value += contribution_fv
            total_contributions = principal + (monthly_contribution * years * 12)

        total_earnings = future_value - total_contributions

        return {
            'future_value': future_value,
            'total_contributions': total_contributions,
            'total_earnings': total_earnings,
            'principal': principal,
            'annual_rate': annual_rate,
            'years': years,
            'monthly_contribution': monthly_contribution
        }

    def calculate_savings_goal(self, target_amount, annual_rate, years, initial_amount=0, compound_frequency=12):
        """
        Calculate required monthly savings to reach a financial goal.

        Args:
            target_amount (float): Target savings amount
            annual_rate (float): Annual interest rate (as decimal)
            years (float): Time horizon in years
            initial_amount (float): Initial amount saved
            compound_frequency (int): Compounding frequency per year

        Returns:
            dict: Savings plan details
        """
        if target_amount <= 0 or annual_rate < 0 or years <= 0:
            raise ValueError("Invalid savings parameters")

        periodic_rate = annual_rate / compound_frequency
        num_periods = years * compound_frequency

        # Future value of initial amount
        initial_fv = initial_amount * (1 + periodic_rate) ** num_periods

        # Required future value from contributions
        required_fv = target_amount - initial_fv

        if required_fv <= 0:
            return {
                'monthly_contribution': 0,
                'total_contributions': 0,
                'target_amount': target_amount,
                'initial_amount': initial_amount,
                'years': years
            }

        # Calculate required monthly contribution
        monthly_contribution = required_fv / \
                             (((1 + periodic_rate) ** num_periods - 1) / periodic_rate) / \
                             (12 / compound_frequency)  # Adjust for monthly contributions

        total_contributions = monthly_contribution * years * 12

        return {
            'monthly_contribution': monthly_contribution,
            'total_contributions': total_contributions,
            'target_amount': target_amount,
            'initial_amount': initial_amount,
            'years': years,
            'annual_rate': annual_rate
        }

    def calculate_retirement_projection(self, current_age, retirement_age, current_savings,
                                      annual_contribution, expected_annual_return, inflation_rate=0.03):
        """
        Project retirement savings with inflation adjustment.

        Args:
            current_age (int): Current age
            retirement_age (int): Target retirement age
            current_savings (float): Current retirement savings
            annual_contribution (float): Annual contribution amount
            expected_annual_return (float): Expected annual return (as decimal)
            inflation_rate (float): Annual inflation rate (as decimal)

        Returns:
            dict: Retirement projection details
        """
        if current_age >= retirement_age or current_savings < 0 or annual_contribution < 0:
            raise ValueError("Invalid retirement parameters")

        years_to_retirement = retirement_age - current_age

        # Calculate future value with inflation-adjusted contributions
        real_return_rate = (1 + expected_annual_return) / (1 + inflation_rate) - 1

        # Future value of current savings
        future_savings = current_savings * (1 + real_return_rate) ** years_to_retirement

        # Future value of annual contributions (adjusted for inflation)
        contribution_fv = 0
        for year in range(years_to_retirement):
            # Each year's contribution grows at real return rate
            contribution_fv += annual_contribution * (1 + real_return_rate) ** (years_to_retirement - year - 1)

        total_future_value = future_savings + contribution_fv

        # Calculate purchasing power at retirement
        total_nominal_value = current_savings * (1 + expected_annual_return) ** years_to_retirement + \
                           annual_contribution * (((1 + expected_annual_return) ** years_to_retirement - 1) / expected_annual_return)

        inflation_adjusted_value = total_future_value

        return {
            'retirement_age': retirement_age,
            'years_to_retirement': years_to_retirement,
            'future_real_value': inflation_adjusted_value,
            'future_nominal_value': total_nominal_value,
            'current_savings': current_savings,
            'annual_contribution': annual_contribution,
            'expected_return': expected_annual_return,
            'inflation_rate': inflation_rate
        }

    def calculate_tax_impact(self, income, tax_brackets, deductions=0):
        """
        Calculate income tax based on tax brackets.

        Args:
            income (float): Gross income
            tax_brackets (list): List of (min_income, max_income, rate) tuples
            deductions (float): Tax deductions

        Returns:
            dict: Tax calculation details
        """
        taxable_income = max(0, income - deductions)
        total_tax = 0
        tax_breakdown = []

        for min_income, max_income, rate in tax_brackets:
            if taxable_income > min_income:
                taxable_in_bracket = min(taxable_income - min_income, max_income - min_income)
                if max_income == float('inf'):
                    taxable_in_bracket = max(0, taxable_income - min_income)

                tax_in_bracket = taxable_in_bracket * rate
                total_tax += tax_in_bracket

                if tax_in_bracket > 0:
                    tax_breakdown.append({
                        'bracket': f"${min_income:,} - ${max_income if max_income != float('inf') else '∞'}",
                        'rate': f"{rate:.1%}",
                        'taxable_amount': taxable_in_bracket,
                        'tax_amount': tax_in_bracket
                    })

        net_income = income - total_tax

        return {
            'gross_income': income,
            'deductions': deductions,
            'taxable_income': taxable_income,
            'total_tax': total_tax,
            'net_income': net_income,
            'effective_rate': total_tax / income if income > 0 else 0,
            'tax_breakdown': tax_breakdown
        }

    def calculate_break_even(self, fixed_costs, variable_cost_per_unit, selling_price_per_unit):
        """
        Calculate break-even point for business analysis.

        Args:
            fixed_costs (float): Total fixed costs
            variable_cost_per_unit (float): Variable cost per unit
            selling_price_per_unit (float): Selling price per unit

        Returns:
            dict: Break-even analysis
        """
        if selling_price_per_unit <= variable_cost_per_unit:
            return {
                'break_even_units': float('inf'),
                'break_even_revenue': float('inf'),
                'contribution_margin': selling_price_per_unit - variable_cost_per_unit,
                'message': 'Selling price must be greater than variable cost per unit'
            }

        contribution_margin = selling_price_per_unit - variable_cost_per_unit
        break_even_units = fixed_costs / contribution_margin
        break_even_revenue = break_even_units * selling_price_per_unit

        return {
            'break_even_units': break_even_units,
            'break_even_revenue': break_even_revenue,
            'contribution_margin': contribution_margin,
            'fixed_costs': fixed_costs,
            'variable_cost_per_unit': variable_cost_per_unit,
            'selling_price_per_unit': selling_price_per_unit
        }

    def display_loan_summary(self, loan_details):
        """Display formatted loan payment summary"""
        print("\n" + "="*50)
        print("LOAN/MORTGAGE PAYMENT SUMMARY")
        print("="*50)
        print(f"Principal: ${loan_details['principal']:,.2f}")
        print(f"Interest Rate: {loan_details['annual_rate']:.1%}")
        print(f"Term: {loan_details['years']} years")
        print(f"Number of payments: {loan_details['num_payments']}")
        print(f"Monthly Payment: ${loan_details['monthly_payment']:,.2f}")
        print(f"Total Payments: ${loan_details['total_payments']:,.2f}")
        print(f"Total Interest: ${loan_details['total_interest']:,.2f}")
        print(f"Payoff Amount: ${loan_details['total_payments']:,.2f}")

    def display_investment_summary(self, investment_details):
        """Display formatted investment growth summary"""
        print("\n" + "="*50)
        print("INVESTMENT GROWTH PROJECTION")
        print("="*50)
        print(f"Initial Investment: ${investment_details['principal']:,.2f}")
        print(f"Expected Return: {investment_details['annual_rate']:.1%}")
        print(f"Time horizon: {investment_details['years']} years")
        if investment_details['monthly_contribution'] > 0:
            print(f"Monthly Contribution: ${investment_details['monthly_contribution']:,.2f}")
        print(f"Future Value: ${investment_details['future_value']:,.2f}")
        print(f"Total Contributions: ${investment_details['total_contributions']:,.2f}")
        print(f"Total Earnings: ${investment_details['total_earnings']:,.2f}")

    def display_savings_plan(self, savings_details):
        """Display formatted savings plan"""
        print("\n" + "="*50)
        print("SAVINGS PLAN TO REACH GOAL")
        print("="*50)
        print(f"Target Amount: ${savings_details['target_amount']:,.2f}")
        print(f"Initial Amount: ${savings_details['initial_amount']:,.2f}")
        print(f"Expected Return: {savings_details['annual_rate']:.1%}")
        print(f"Time horizon: {savings_details['years']} years")
        print(f"Monthly Contribution: ${savings_details['monthly_contribution']:,.2f}")
        print(f"Total Contributions: ${savings_details['total_contributions']:,.2f}")

    def run_interactive_calculator(self):
        """Run interactive financial calculator"""
        print("💰 Financial Calculator")
        print("=" * 40)
        print("Choose a calculation type:")
        print("1. Loan/Mortgage Payment")
        print("2. Investment Growth")
        print("3. Savings Goal Calculator")
        print("4. Retirement Projection")
        print("5. Tax Calculator")
        print("6. Break-Even Analysis")
        print("7. Exit")

        while True:
            try:
                choice = input("\nEnter your choice (1-7): ").strip()

                if choice == '7':
                    print("Thank you for using the Financial Calculator!")
                    break

                elif choice == '1':
                    # Loan calculator
                    principal = float(input("Loan amount: $"))
                    rate = float(input("Annual interest rate (%): ")) / 100
                    years = float(input("Loan term (years): "))

                    result = self.calculate_loan_payment(principal, rate, years)
                    self.display_loan_summary(result)

                elif choice == '2':
                    # Investment calculator
                    principal = float(input("Initial investment: $"))
                    rate = float(input("Annual return rate (%): ")) / 100
                    years = float(input("Investment period (years): "))
                    monthly_contrib = float(input("Monthly contribution ($): "))

                    result = self.calculate_investment_growth(principal, rate, years,
                                                            monthly_contribution=monthly_contrib)
                    self.display_investment_summary(result)

                elif choice == '3':
                    # Savings calculator
                    target = float(input("Savings goal: $"))
                    rate = float(input("Annual interest rate (%): ")) / 100
                    years = float(input("Time horizon (years): "))
                    initial = float(input("Initial amount: $"))

                    result = self.calculate_savings_goal(target, rate, years, initial)
                    self.display_savings_plan(result)

                elif choice == '4':
                    # Retirement calculator
                    current_age = int(input("Current age: "))
                    retirement_age = int(input("Retirement age: "))
                    current_savings = float(input("Current retirement savings: $"))
                    annual_contrib = float(input("Annual contribution: $"))
                    expected_return = float(input("Expected annual return (%): ")) / 100

                    result = self.calculate_retirement_projection(
                        current_age, retirement_age, current_savings,
                        annual_contrib, expected_return
                    )

                    print("
Retirement Projection:")
                    print(f"Real Value at Retirement: ${result['future_real_value']:,.2f}")
                    print(f"Nominal Value at Retirement: ${result['future_nominal_value']:,.2f}")
                    print(f"Years to retirement: {result['years_to_retirement']}")

                elif choice == '5':
                    # Tax calculator (simplified US brackets)
                    income = float(input("Annual income: $"))

                    # Simplified 2023 US federal tax brackets (single filer)
                    tax_brackets = [
                        (0, 11000, 0.10),
                        (11000, 44725, 0.12),
                        (44725, 95375, 0.22),
                        (95375, 182100, 0.24),
                        (182100, 231250, 0.32),
                        (231250, 578125, 0.35),
                        (578125, float('inf'), 0.37)
                    ]

                    result = self.calculate_tax_impact(income, tax_brackets)

                    print("
Tax Calculation:")
                    print(f"Gross Income: ${result['gross_income']:,.2f}")
                    print(f"Taxable Income: ${result['taxable_income']:,.2f}")
                    print(f"Total Tax: ${result['total_tax']:,.2f}")
                    print(f"Net Income: ${result['net_income']:,.2f}")
                    print(f"Effective Tax Rate: {result['effective_rate']:.1%}")

                elif choice == '6':
                    # Break-even calculator
                    fixed_costs = float(input("Fixed costs: $"))
                    variable_cost = float(input("Variable cost per unit: $"))
                    selling_price = float(input("Selling price per unit: $"))

                    result = self.calculate_break_even(fixed_costs, variable_cost, selling_price)

                    print("
Break-Even Analysis:")
                    print(f"Break-Even Units: {result['break_even_units']:.0f}")
                    print(f"Break-Even Revenue: ${result['break_even_revenue']:,.2f}")
                    print(f"Contribution Margin: ${result['contribution_margin']:,.2f}")

                else:
                    print("Invalid choice. Please try again.")

            except ValueError as e:
                print(f"Invalid input: {e}")
            except KeyboardInterrupt:
                print("\nCalculator interrupted. Goodbye!")
                break
            except Exception as e:
                print(f"An error occurred: {e}")


def main():
    """Main function"""
    calculator = FinancialCalculator()
    calculator.run_interactive_calculator()


if __name__ == '__main__':
    main()
