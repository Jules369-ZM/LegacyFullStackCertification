#!/bin/bash

# Number Guessing Game
# This script implements a number guessing game with PostgreSQL database tracking

PSQL="psql --username=freecodecamp --dbname=number_guess -t --no-align -c"

# Create database and table
create_database() {
  # Create database
  createdb number_guess 2>/dev/null || echo "Database number_guess already exists"

  # Create table
  $PSQL "CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(22) UNIQUE NOT NULL,
    games_played INT DEFAULT 0,
    best_game INT DEFAULT 1001
  );"
}

# Generate random number
generate_random_number() {
  echo $(( RANDOM % 1000 + 1 ))
}

# Main game function
play_game() {
  local username=$1
  local secret_number=$(generate_random_number)
  local guess_count=0

  echo "Guess the secret number between 1 and 1000:"

  while true; do
    read guess

    # Validate input
    if [[ ! $guess =~ ^[0-9]+$ ]]; then
      echo "That is not an integer, guess again:"
      continue
    fi

    ((guess_count++))

    if [[ $guess -eq $secret_number ]]; then
      echo "You guessed it in $guess_count tries. The secret number was $secret_number. Nice job!"

      # Update user statistics
      update_user_stats "$username" $guess_count
      return
    elif [[ $guess -gt $secret_number ]]; then
      echo "It's lower than that, guess again:"
    else
      echo "It's higher than that, guess again:"
    fi
  done
}

# Update user statistics in database
update_user_stats() {
  local username=$1
  local guesses=$2

  # Get current user data
  user_data=$($PSQL "SELECT games_played, best_game FROM users WHERE username='$username';")

  if [[ -z $user_data ]]; then
    # New user
    $PSQL "INSERT INTO users (username, games_played, best_game) VALUES ('$username', 1, $guesses);" >/dev/null
  else
    # Existing user
    IFS='|' read -r games_played best_game <<< "$user_data"
    new_games_played=$((games_played + 1))

    # Update best game if current game is better
    if [[ $guesses -lt $best_game ]]; then
      $PSQL "UPDATE users SET games_played = $new_games_played, best_game = $guesses WHERE username = '$username';" >/dev/null
    else
      $PSQL "UPDATE users SET games_played = $new_games_played WHERE username = '$username';" >/dev/null
    fi
  fi
}

# Get user information
get_user_info() {
  local username=$1

  user_data=$($PSQL "SELECT games_played, best_game FROM users WHERE username='$username';")

  if [[ -n $user_data ]]; then
    IFS='|' read -r games_played best_game <<< "$user_data"
    echo "Welcome back, $username! You have played $games_played games, and your best game took $best_game guesses."
  else
    echo "Welcome, $username! It looks like this is your first time here."
  fi
}

# Main script
main() {
  # Initialize database
  create_database

  echo "Enter your username:"
  read username

  # Validate username length
  if [[ ${#username} -gt 22 ]]; then
    echo "Username must be 22 characters or less."
    exit 1
  fi

  # Get user information
  get_user_info "$username"

  # Start the game
  play_game "$username"
}

# Run main function
main
