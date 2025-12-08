#!/bin/bash

# Periodic Table Element Information Script
# This script provides information about chemical elements from a PostgreSQL database

PSQL="psql --username=freecodecamp --dbname=periodic_table -t --no-align -c"

# Function to get element information by atomic number
get_element_by_atomic_number() {
  local atomic_number=$1

  # Get element info
  element_info=$($PSQL "SELECT e.atomic_number, e.symbol, e.name, p.type, p.atomic_mass, p.melting_point_celsius, p.boiling_point_celsius
                        FROM elements e
                        JOIN properties p ON e.atomic_number = p.atomic_number
                        WHERE e.atomic_number = $atomic_number;")

  if [[ -z $element_info ]]; then
    echo "I could not find that element in the database."
    return
  fi

  # Parse the information
  IFS='|' read -r atomic_number symbol name type atomic_mass melting_point boiling_point <<< "$element_info"

  # Display information
  echo "The element with atomic number $atomic_number is $name ($symbol). It's a $type, with a mass of $atomic_mass amu. $name has a melting point of $melting_point celsius and a boiling point of $boiling_point celsius."
}

# Function to get element information by symbol
get_element_by_symbol() {
  local symbol=$1

  # Get element info
  element_info=$($PSQL "SELECT e.atomic_number, e.symbol, e.name, p.type, p.atomic_mass, p.melting_point_celsius, p.boiling_point_celsius
                        FROM elements e
                        JOIN properties p ON e.atomic_number = p.atomic_number
                        WHERE UPPER(e.symbol) = UPPER('$symbol');")

  if [[ -z $element_info ]]; then
    echo "I could not find that element in the database."
    return
  fi

  # Parse the information
  IFS='|' read -r atomic_number symbol name type atomic_mass melting_point boiling_point <<< "$element_info"

  # Display information
  echo "The element with atomic number $atomic_number is $name ($symbol). It's a $type, with a mass of $atomic_mass amu. $name has a melting point of $melting_point celsius and a boiling point of $boiling_point celsius."
}

# Function to get element information by name
get_element_by_name() {
  local name=$1

  # Get element info
  element_info=$($PSQL "SELECT e.atomic_number, e.symbol, e.name, p.type, p.atomic_mass, p.melting_point_celsius, p.boiling_point_celsius
                        FROM elements e
                        JOIN properties p ON e.atomic_number = p.atomic_number
                        WHERE LOWER(e.name) = LOWER('$name');")

  if [[ -z $element_info ]]; then
    echo "I could not find that element in the database."
    return
  fi

  # Parse the information
  IFS='|' read -r atomic_number symbol name type atomic_mass melting_point boiling_point <<< "$element_info"

  # Display information
  echo "The element with atomic number $atomic_number is $name ($symbol). It's a $type, with a mass of $atomic_mass amu. $name has a melting point of $melting_point celsius and a boiling point of $boiling_point celsius."
}

# Main script logic
if [[ $# -eq 0 ]]; then
  echo "Please provide an element as an argument."
  exit 0
fi

input=$1

# Check if input is a number (atomic number)
if [[ $input =~ ^[0-9]+$ ]]; then
  get_element_by_atomic_number $input
# Check if input is a symbol (1-2 characters, starts with letter)
elif [[ $input =~ ^[A-Za-z]{1,2}$ ]]; then
  get_element_by_symbol $input
# Otherwise treat as element name
else
  get_element_by_name "$input"
fi
