def add_time(start, duration, day=None):
    """
    Adds duration to start time and returns the result.

    Args:
        start (str): Starting time in 12-hour format (e.g., "3:00 PM")
        duration (str): Duration to add in HH:MM format (e.g., "2:30")
        day (str, optional): Starting day of the week

    Returns:
        str: New time in 12-hour format with optional day and day count
    """

    # Parse start time
    start_parts = start.split()
    time_part = start_parts[0]
    period = start_parts[1].upper()

    hours, minutes = map(int, time_part.split(':'))

    # Convert to 24-hour format
    if period == 'PM' and hours != 12:
        hours += 12
    elif period == 'AM' and hours == 12:
        hours = 0

    # Parse duration
    duration_hours, duration_minutes = map(int, duration.split(':'))

    # Add duration
    total_minutes = hours * 60 + minutes + duration_hours * 60 + duration_minutes

    # Calculate new time
    new_hours = (total_minutes // 60) % 24
    new_minutes = total_minutes % 60

    # Calculate days passed
    days_passed = total_minutes // (24 * 60)

    # Convert back to 12-hour format
    if new_hours == 0:
        display_hours = 12
        display_period = 'AM'
    elif new_hours < 12:
        display_hours = new_hours
        display_period = 'AM'
    elif new_hours == 12:
        display_hours = 12
        display_period = 'PM'
    else:
        display_hours = new_hours - 12
        display_period = 'PM'

    # Format time string
    time_string = f"{display_hours}:{new_minutes:02d} {display_period}"

    # Handle day of the week
    if day:
        days_of_week = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        day_lower = day.lower()

        if day_lower not in days_of_week:
            return "Error: Invalid day"

        current_day_index = days_of_week.index(day_lower)
        new_day_index = (current_day_index + days_passed) % 7
        new_day = days_of_week[new_day_index].capitalize()

        time_string += f", {new_day}"

    # Add day count if more than one day has passed
    if days_passed == 1:
        time_string += " (next day)"
    elif days_passed > 1:
        time_string += f" ({days_passed} days later)"

    return time_string
