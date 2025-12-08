import pandas as pd

def calculate_demographic_data(print_data=True):
    """
    Analyze demographic data from adult.data.csv

    Args:
        print_data (bool): Whether to print the results

    Returns:
        dict: Dictionary containing demographic analysis results
    """

    # Read the data
    df = pd.read_csv('adult.data.csv')

    # Clean column names (remove extra spaces)
    df.columns = df.columns.str.strip()

    # Calculate race counts
    race_count = df['race'].value_counts()

    # Calculate average age of men
    average_age_men = round(df[df['sex'] == 'Male']['age'].mean(), 1)

    # Calculate percentage with Bachelor's degree
    percentage_bachelors = round((df['education'] == 'Bachelors').sum() / len(df) * 100, 1)

    # Calculate percentage with higher education who earn >50K
    higher_education = df['education'].isin(['Bachelors', 'Masters', 'Doctorate'])
    higher_education_rich = round(
        (df[higher_education & (df['salary'] == '>50K')].shape[0] /
         df[higher_education].shape[0]) * 100, 1
    )

    # Calculate percentage without higher education who earn >50K
    lower_education = ~higher_education
    lower_education_rich = round(
        (df[lower_education & (df['salary'] == '>50K')].shape[0] /
         df[lower_education].shape[0]) * 100, 1
    )

    # Find minimum work hours
    min_work_hours = df['hours-per-week'].min()

    # Calculate percentage of rich among those who work minimum hours
    num_min_workers = df[df['hours-per-week'] == min_work_hours]
    rich_percentage = round(
        (num_min_workers['salary'] == '>50K').sum() / len(num_min_workers) * 100, 1
    )

    # Find country with highest percentage of >50K earners
    country_counts = df['native-country'].value_counts()
    country_rich = df[df['salary'] == '>50K']['native-country'].value_counts()
    highest_earning_country_percentage = round(
        (country_rich / country_counts * 100).max(), 1
    )
    highest_earning_country = (country_rich / country_counts * 100).idxmax()

    # Find most popular occupation for >50K earners in India
    india_rich = df[(df['native-country'] == 'India') & (df['salary'] == '>50K')]
    top_IN_occupation = india_rich['occupation'].value_counts().idxmax()

    # Create results dictionary
    results = {
        'race_count': race_count,
        'average_age_men': average_age_men,
        'percentage_bachelors': percentage_bachelors,
        'higher_education_rich': higher_education_rich,
        'lower_education_rich': lower_education_rich,
        'min_work_hours': min_work_hours,
        'rich_percentage': rich_percentage,
        'highest_earning_country': highest_earning_country,
        'highest_earning_country_percentage': highest_earning_country_percentage,
        'top_IN_occupation': top_IN_occupation
    }

    if print_data:
        print("Number of each race:")
        print(race_count)
        print(f"\nAverage age of men: {average_age_men}")
        print(f"\nPercentage with Bachelors degrees: {percentage_bachelors}%")
        print(f"\nPercentage with higher education that earn >50K: {higher_education_rich}%")
        print(f"\nPercentage without higher education that earn >50K: {lower_education_rich}%")
        print(f"\nMin work time: {min_work_hours} hours/week")
        print(f"\nPercentage of rich among those who work fewest hours: {rich_percentage}%")
        print(f"\nCountry with highest percentage of rich: {highest_earning_country}")
        print(f"\nHighest percentage of rich country: {highest_earning_country_percentage}%")
        print(f"\nTop occupation in India: {top_IN_occupation}")

    return results
