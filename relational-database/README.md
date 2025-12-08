# Relational Database Projects

This directory contains implementations of the Relational Database certification projects from FreeCodeCamp. All projects use PostgreSQL databases with proper relational design.

## Projects Implemented

### 1. Celestial Bodies Database (`celestial-bodies-database/`)
- **Description**: PostgreSQL database for astronomical data including galaxies, stars, planets, and moons
- **Database**: `universe`
- **Tables**: galaxy, star, planet, moon
- **Features**:
  - Proper foreign key relationships
  - Comprehensive data for celestial bodies
  - Atomic mass, temperature, distance calculations
  - Age and physical property tracking

### 2. World Cup Database (`world-cup-database/`)
- **Description**: PostgreSQL database for World Cup tournament data
- **Database**: `worldcup`
- **Tables**: teams, players, stadiums, referees, matches, goals
- **Features**:
  - Complete tournament structure
  - Player and team statistics
  - Match results and scoring data
  - Referee and stadium information
  - Multi-table relationships

### 3. Salon Appointment Scheduler (`salon-appointment-scheduler/`)
- **Description**: Bash script with PostgreSQL for managing salon appointments
- **Database**: `salon`
- **Tables**: customers, services, appointments
- **Features**:
  - Interactive command-line interface
  - Customer management
  - Service booking and scheduling
  - Appointment viewing and cancellation
  - Input validation and error handling

### 4. Periodic Table Database (`periodic-table-database/`)
- **Description**: Bash script with PostgreSQL for periodic table element information
- **Database**: `periodic_table`
- **Tables**: elements, properties, types
- **Features**:
  - Element lookup by atomic number, symbol, or name
  - Comprehensive element properties
  - Melting/boiling points and atomic masses
  - Element classification (metal, nonmetal, metalloid)

### 5. Number Guessing Game (`number-guessing-game/`)
- **Description**: Bash script with PostgreSQL for a number guessing game with statistics
- **Database**: `number_guess`
- **Tables**: users
- **Features**:
  - Random number generation (1-1000)
  - User statistics tracking
  - Games played and best scores
  - Username validation
  - Persistent game history

## Technologies Used

- **PostgreSQL**: Primary database management system
- **Bash**: Scripting for interactive applications
- **SQL**: Database schema design and queries
- **psql**: PostgreSQL command-line client

## Prerequisites

- PostgreSQL installed and running
- `psql` command available
- Bash shell environment

## Setup Instructions

### For SQL Database Projects:
1. Create the database: `createdb <database_name>`
2. Connect to database: `psql -d <database_name>`
3. Run the SQL file: `\i <project_directory>/<filename>.sql`

### For Bash Script Projects:
1. Make scripts executable: `chmod +x <script_name>.sh`
2. Run the script: `./<script_name>.sh`
3. Scripts will create databases automatically if they don't exist

## Project Structure

```
relational-database/
├── celestial-bodies-database/
│   └── universe.sql
├── world-cup-database/
│   └── worldcup.sql
├── salon-appointment-scheduler/
│   └── salon.sh
├── periodic-table-database/
│   ├── periodic_table.sql
│   └── element.sh
├── number-guessing-game/
│   └── number_guess.sh
└── README.md
```

## FreeCodeCamp Certification

These implementations fulfill the requirements for the Relational Database certification from FreeCodeCamp, covering:

- Database design and normalization
- SQL queries and relationships
- Bash scripting with database integration
- Command-line application development
- Data validation and error handling

## Project Status

- ✅ Celestial Bodies Database - Completed
- ✅ World Cup Database - Completed
- ✅ Salon Appointment Scheduler - Completed
- ✅ Periodic Table Database - Completed
- ✅ Number Guessing Game - Completed
