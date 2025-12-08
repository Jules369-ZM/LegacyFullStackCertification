#!/bin/bash

# Salon Appointment Scheduler
# This script provides a command-line interface for managing salon appointments

PSQL="psql --username=freecodecamp --dbname=salon -t --no-align -c"

# Create database and tables
create_database() {
  # Create database
  createdb salon 2>/dev/null || echo "Database salon already exists"

  # Create tables
  $PSQL "CREATE TABLE IF NOT EXISTS customers (
    customer_id SERIAL PRIMARY KEY,
    phone VARCHAR(15) UNIQUE NOT NULL,
    name VARCHAR(50) NOT NULL
  );"

  $PSQL "CREATE TABLE IF NOT EXISTS services (
    service_id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    price DECIMAL(5,2) NOT NULL
  );"

  $PSQL "CREATE TABLE IF NOT EXISTS appointments (
    appointment_id SERIAL PRIMARY KEY,
    customer_id INT REFERENCES customers(customer_id),
    service_id INT REFERENCES services(service_id),
    time VARCHAR(10) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE
  );"

  # Insert services if not exists
  $PSQL "INSERT INTO services (name, price) VALUES
    ('Haircut', 15.00),
    ('Shampoo', 5.00),
    ('Trim', 10.00),
    ('Style', 25.00),
    ('Color', 50.00)
    ON CONFLICT (name) DO NOTHING;"
}

# Main menu
main_menu() {
  echo -e "\n~~~~~ MY SALON ~~~~~\n"
  echo "Welcome to My Salon, how can I help you?"
  echo ""
  echo "1. View available services"
  echo "2. Book an appointment"
  echo "3. View your appointments"
  echo "4. Cancel an appointment"
  echo "5. Exit"
  echo ""
  read -p "Please select an option (1-5): " choice

  case $choice in
    1) view_services ;;
    2) book_appointment ;;
    3) view_appointments ;;
    4) cancel_appointment ;;
    5) exit 0 ;;
    *) echo "Invalid option. Please try again." && main_menu ;;
  esac
}

# View available services
view_services() {
  echo -e "\n~~~~~ SERVICES ~~~~~\n"
  $PSQL "SELECT service_id, name, CONCAT('$', price) as price FROM services ORDER BY service_id;" | while IFS='|' read -r id name price
  do
    echo "$id) $name $price"
  done
  echo ""
  main_menu
}

# Book an appointment
book_appointment() {
  echo -e "\n~~~~~ BOOK APPOINTMENT ~~~~~\n"

  # Get customer phone
  read -p "What's your phone number? " phone

  # Check if customer exists
  customer_name=$($PSQL "SELECT name FROM customers WHERE phone='$phone';")

  if [[ -z $customer_name ]]; then
    # New customer
    read -p "I don't have a record for that phone number, what's your name? " name
    $PSQL "INSERT INTO customers (phone, name) VALUES ('$phone', '$name');" >/dev/null
    customer_name=$name
  fi

  customer_id=$($PSQL "SELECT customer_id FROM customers WHERE phone='$phone';")

  # Show services
  echo -e "\nHere are the services we offer:"
  $PSQL "SELECT service_id, name FROM services ORDER BY service_id;" | while IFS='|' read -r id name
  do
    echo "$id) $name"
  done

  # Get service selection
  read -p "Which service would you like? " service_id

  # Validate service
  service_name=$($PSQL "SELECT name FROM services WHERE service_id=$service_id;")

  if [[ -z $service_name ]]; then
    echo "Invalid service selection. Please try again."
    book_appointment
    return
  fi

  # Get appointment time
  read -p "What time would you like your $service_name? (HH:MM format) " time

  # Validate time format
  if [[ ! $time =~ ^[0-9]{1,2}:[0-9]{2}$ ]]; then
    echo "Invalid time format. Please use HH:MM format."
    book_appointment
    return
  fi

  # Book appointment
  $PSQL "INSERT INTO appointments (customer_id, service_id, time) VALUES ($customer_id, $service_id, '$time');" >/dev/null

  echo -e "\nI have put you down for a $service_name at $time, $customer_name."
  main_menu
}

# View appointments
view_appointments() {
  echo -e "\n~~~~~ YOUR APPOINTMENTS ~~~~~\n"

  read -p "What's your phone number? " phone

  customer_id=$($PSQL "SELECT customer_id FROM customers WHERE phone='$phone';")

  if [[ -z $customer_id ]]; then
    echo "No appointments found for this phone number."
    main_menu
    return
  fi

  appointments=$($PSQL "SELECT a.appointment_id, s.name, a.time, a.date
                        FROM appointments a
                        JOIN services s ON a.service_id = s.service_id
                        WHERE a.customer_id = $customer_id
                        ORDER BY a.date, a.time;")

  if [[ -z $appointments ]]; then
    echo "No appointments found."
  else
    echo "$appointments" | while IFS='|' read -r id service time date
    do
      echo "Appointment ID: $id - $service on $date at $time"
    done
  fi

  main_menu
}

# Cancel appointment
cancel_appointment() {
  echo -e "\n~~~~~ CANCEL APPOINTMENT ~~~~~\n"

  read -p "What's your phone number? " phone

  customer_id=$($PSQL "SELECT customer_id FROM customers WHERE phone='$phone';")

  if [[ -z $customer_id ]]; then
    echo "No appointments found for this phone number."
    main_menu
    return
  fi

  appointments=$($PSQL "SELECT a.appointment_id, s.name, a.time, a.date
                        FROM appointments a
                        JOIN services s ON a.service_id = s.service_id
                        WHERE a.customer_id = $customer_id
                        ORDER BY a.date, a.time;")

  if [[ -z $appointments ]]; then
    echo "No appointments found."
    main_menu
    return
  fi

  echo "Your appointments:"
  echo "$appointments" | while IFS='|' read -r id service time date
  do
    echo "$id) $service on $date at $time"
  done

  read -p "Which appointment would you like to cancel? (Enter appointment ID) " appointment_id

  # Validate and cancel
  cancelled=$($PSQL "DELETE FROM appointments WHERE appointment_id=$appointment_id AND customer_id=$customer_id;")

  if [[ $cancelled == "DELETE 1" ]]; then
    echo "Appointment cancelled successfully."
  else
    echo "Invalid appointment ID or you don't have permission to cancel this appointment."
  fi

  main_menu
}

# Initialize database
create_database

# Start the application
main_menu
