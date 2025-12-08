-- World Cup Database
-- This script creates a database for World Cup tournament data

-- Create the database
-- Run: createdb worldcup
-- Then connect: psql -d worldcup -f worldcup.sql

-- Create tables
CREATE TABLE teams (
    team_id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    confederation VARCHAR(20)
);

CREATE TABLE players (
    player_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    team_id INT REFERENCES teams(team_id),
    position VARCHAR(20),
    date_of_birth DATE,
    height_cm INT,
    weight_kg INT
);

CREATE TABLE stadiums (
    stadium_id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    city VARCHAR(50),
    country VARCHAR(50),
    capacity INT
);

CREATE TABLE referees (
    referee_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    nationality VARCHAR(50),
    experience_years INT
);

CREATE TABLE matches (
    match_id SERIAL PRIMARY KEY,
    year INT NOT NULL,
    round VARCHAR(30),
    home_team_id INT REFERENCES teams(team_id),
    away_team_id INT REFERENCES teams(team_id),
    home_goals INT DEFAULT 0,
    away_goals INT DEFAULT 0,
    match_date DATE,
    stadium_id INT REFERENCES stadiums(stadium_id),
    referee_id INT REFERENCES referees(referee_id),
    attendance INT,
    weather_conditions VARCHAR(50)
);

CREATE TABLE goals (
    goal_id SERIAL PRIMARY KEY,
    match_id INT REFERENCES matches(match_id),
    player_id INT REFERENCES players(player_id),
    minute INT,
    goal_type VARCHAR(20),
    assist_player_id INT REFERENCES players(player_id)
);

-- Insert data into teams table
INSERT INTO teams (name, confederation) VALUES
('Brazil', 'CONMEBOL'),
('Germany', 'UEFA'),
('Argentina', 'CONMEBOL'),
('France', 'UEFA'),
('Spain', 'UEFA'),
('England', 'UEFA'),
('Italy', 'UEFA'),
('Netherlands', 'UEFA'),
('Uruguay', 'CONMEBOL'),
('Portugal', 'UEFA'),
('Colombia', 'CONMEBOL'),
('Mexico', 'CONCACAF'),
('Belgium', 'UEFA'),
('Switzerland', 'UEFA'),
('Japan', 'AFC'),
('United States', 'CONCACAF');

-- Insert data into players table
INSERT INTO players (name, team_id, position, date_of_birth, height_cm, weight_kg) VALUES
('Neymar Jr.', 1, 'Forward', '1992-02-05', 175, 68),
('Lionel Messi', 3, 'Forward', '1987-06-24', 170, 72),
('Cristiano Ronaldo', 10, 'Forward', '1985-02-05', 187, 83),
('Kylian Mbappé', 4, 'Forward', '1998-12-20', 178, 73),
('Sunil Chhetri', 15, 'Forward', '1984-08-03', 170, 70),
('Luis Suarez', 9, 'Forward', '1987-01-24', 182, 86),
('Sergio Ramos', 5, 'Defender', '1986-03-30', 184, 82),
('Manuel Neuer', 2, 'Goalkeeper', '1986-03-27', 193, 92),
('Gianluigi Buffon', 7, 'Goalkeeper', '1978-01-28', 192, 91),
('David Beckham', 6, 'Midfielder', '1975-05-02', 183, 75),
('Robbie Keane', 6, 'Forward', '1980-07-08', 176, 73),
('Wayne Rooney', 6, 'Forward', '1985-10-24', 176, 83),
('Steven Gerrard', 6, 'Midfielder', '1980-05-30', 183, 83),
('Frank Lampard', 6, 'Midfielder', '1978-06-20', 184, 90),
('John Terry', 6, 'Defender', '1980-12-07', 187, 90),
('Rio Ferdinand', 6, 'Defender', '1978-11-07', 189, 87);

-- Insert data into stadiums table
INSERT INTO stadiums (name, city, country, capacity) VALUES
('Maracanã Stadium', 'Rio de Janeiro', 'Brazil', 78838),
('Wembley Stadium', 'London', 'England', 90000),
('Camp Nou', 'Barcelona', 'Spain', 99354),
('Santiago Bernabéu', 'Madrid', 'Spain', 81044),
('Allianz Arena', 'Munich', 'Germany', 75000),
('San Siro', 'Milan', 'Italy', 80018),
('Estadio Azteca', 'Mexico City', 'Mexico', 87000),
('Stade de France', 'Saint-Denis', 'France', 81338),
('Olympic Stadium', 'Berlin', 'Germany', 74228),
('Amsterdam Arena', 'Amsterdam', 'Netherlands', 53733),
('Estadio Monumental', 'Buenos Aires', 'Argentina', 61440),
('Estádio do Morumbi', 'São Paulo', 'Brazil', 66795),
('Old Trafford', 'Manchester', 'England', 74310),
('Anfield', 'Liverpool', 'England', 53394),
('Signal Iduna Park', 'Dortmund', 'Germany', 81365),
('Parc des Princes', 'Paris', 'France', 47929);

-- Insert data into referees table
INSERT INTO referees (name, nationality, experience_years) VALUES
('Pierluigi Collina', 'Italy', 25),
('Howard Webb', 'England', 15),
('Björn Kuipers', 'Netherlands', 20),
('Nestor Pitana', 'Argentina', 18),
('Mark Geiger', 'United States', 12),
('Ravshan Irmatov', 'Uzbekistan', 16),
('Yuichi Nishimura', 'Japan', 14),
('Joel Aguilar', 'El Salvador', 13);

-- Insert data into matches table
INSERT INTO matches (year, round, home_team_id, away_team_id, home_goals, away_goals, match_date, stadium_id, referee_id, attendance, weather_conditions) VALUES
(2018, 'Final', 1, 4, 0, 1, '2018-07-15', 8, 1, 78011, 'Clear'),
(2018, 'Semi-final', 4, 2, 1, 0, '2018-07-10', 8, 2, 64168, 'Cloudy'),
(2018, 'Semi-final', 1, 3, 1, 0, '2018-07-10', 8, 3, 64168, 'Cloudy'),
(2018, 'Quarter-final', 4, 9, 2, 0, '2018-07-06', 8, 4, 42873, 'Clear'),
(2018, 'Quarter-final', 2, 6, 1, 1, '2018-07-07', 9, 5, 74422, 'Sunny'),
(2018, 'Quarter-final', 1, 5, 2, 0, '2018-07-06', 8, 6, 42873, 'Clear'),
(2018, 'Quarter-final', 3, 4, 3, 4, '2018-07-30', 8, 7, 44291, 'Clear'),
(2014, 'Final', 2, 3, 1, 0, '2014-07-13', 1, 1, 74738, 'Clear'),
(2014, 'Semi-final', 1, 2, 1, 0, '2014-07-08', 1, 2, 58141, 'Clear'),
(2014, 'Semi-final', 8, 3, 0, 0, '2014-07-09', 10, 3, 58041, 'Clear'),
(2014, 'Quarter-final', 4, 2, 0, 1, '2014-07-04', 1, 4, 43063, 'Clear'),
(2014, 'Quarter-final', 1, 5, 2, 1, '2014-07-05', 1, 5, 60342, 'Clear'),
(2014, 'Quarter-final', 8, 6, 2, 1, '2014-07-05', 10, 6, 58041, 'Clear'),
(2014, 'Quarter-final', 3, 1, 1, 1, '2014-07-05', 1, 7, 60342, 'Clear'),
(2010, 'Final', 5, 8, 0, 1, '2010-07-11', 12, 1, 84490, 'Clear'),
(2010, 'Semi-final', 8, 2, 0, 1, '2010-07-07', 12, 2, 60960, 'Clear');

-- Insert data into goals table
INSERT INTO goals (match_id, player_id, minute, goal_type) VALUES
(1, 4, 65, 'Penalty'),
(2, 4, 20, 'Open play'),
(3, 1, 51, 'Open play'),
(4, 4, 40, 'Open play'),
(4, 4, 61, 'Open play'),
(6, 1, 20, 'Open play'),
(6, 1, 88, 'Open play'),
(7, 4, 13, 'Open play'),
(7, 4, 64, 'Penalty'),
(7, 4, 68, 'Open play'),
(7, 3, 41, 'Open play'),
(7, 3, 67, 'Open play'),
(7, 3, 109, 'Extra time'),
(8, 8, 113, 'Extra time'),
(9, 1, 90, 'Open play'),
(10, 3, 37, 'Penalty'),
(11, 4, 13, 'Open play'),
(12, 1, 3, 'Open play'),
(12, 1, 17, 'Open play'),
(12, 5, 87, 'Open play'),
(13, 10, 31, 'Open play'),
(13, 10, 71, 'Open play'),
(13, 14, 88, 'Open play'),
(14, 3, 25, 'Open play'),
(14, 1, 39, 'Open play'),
(15, 4, 73, 'Open play'),
(16, 4, 25, 'Open play');
