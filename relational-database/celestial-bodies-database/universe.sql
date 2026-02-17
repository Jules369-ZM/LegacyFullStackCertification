-- Celestial Bodies Database
-- This script creates a database of celestial bodies including galaxies, stars, planets, and moons

-- Create the database
-- Run: createdb universe
-- Then connect: psql -d universe -f universe.sql

-- Create tables
CREATE TABLE galaxy (
    galaxy_id SERIAL PRIMARY KEY,
    name VARCHAR(30) UNIQUE NOT NULL,
    description TEXT,
    galaxy_type VARCHAR(20),
    age_in_millions_of_years NUMERIC(6,1),
    distance_from_earth NUMERIC(5,2)
);

CREATE TABLE star (
    star_id SERIAL PRIMARY KEY,
    name VARCHAR(30) UNIQUE NOT NULL,
    galaxy_id INT REFERENCES galaxy(galaxy_id),
    star_type VARCHAR(10),
    age_in_millions_of_years NUMERIC(6,1),
    temperature_in_kelvin INT,
    is_spherical BOOLEAN DEFAULT true
);

CREATE TABLE planet (
    planet_id SERIAL PRIMARY KEY,
    name VARCHAR(30) UNIQUE NOT NULL,
    star_id INT REFERENCES star(star_id),
    planet_type VARCHAR(15),
    age_in_millions_of_years NUMERIC(6,1),
    has_life BOOLEAN DEFAULT false,
    is_spherical BOOLEAN DEFAULT true,
    distance_from_earth NUMERIC(6,2)
);

CREATE TABLE moon (
    moon_id SERIAL PRIMARY KEY,
    name VARCHAR(30) UNIQUE NOT NULL,
    planet_id INT REFERENCES planet(planet_id),
    moon_type VARCHAR(15),
    age_in_millions_of_years NUMERIC(6,1),
    is_spherical BOOLEAN DEFAULT true,
    distance_from_earth NUMERIC(6,2)
);

-- Insert data into galaxy table
INSERT INTO galaxy (name, description, galaxy_type, age_in_millions_of_years, distance_from_earth)
VALUES
('Milky Way', 'Our home galaxy containing hundreds of billions of stars', 'Spiral', 13610.0, 0.00),
('Andromeda', 'Largest galaxy in the Local Group', 'Spiral', 10000.0, 2.54),
('Triangulum', 'Third largest galaxy in the Local Group', 'Spiral', 12000.0, 3.00),
('Whirlpool', 'Classic spiral galaxy with a prominent companion', 'Spiral', 400.0, 23.16),
('Sombrero', 'Galaxy with a bright nucleus and large central bulge', 'Spiral', 13250.0, 31.10),
('Black Eye', 'Galaxy with a dark band of dust', 'Spiral', 13280.0, 17.30);

-- Insert data into star table
INSERT INTO star (name, galaxy_id, star_type, age_in_millions_of_years, temperature_in_kelvin, is_spherical)
VALUES
('Sun', 1, 'G-Type', 4603.0, 5778, true),
('Sirius', 1, 'A-Type', 242.0, 9940, true),
('Betelgeuse', 1, 'M-Type', 10.0, 3600, true),
('Rigel', 1, 'B-Type', 10.0, 12100, true),
('Vega', 1, 'A-Type', 455.0, 10100, true),
('Altair', 1, 'A-Type', 1200.0, 7550, true);

-- Insert data into planet table
INSERT INTO planet (name, star_id, planet_type, age_in_millions_of_years, has_life, is_spherical, distance_from_earth)
VALUES
('Mercury', 1, 'Terrestrial', 4503.0, false, true, 0.39),
('Venus', 1, 'Terrestrial', 4503.0, false, true, 0.72),
('Earth', 1, 'Terrestrial', 4543.0, true, true, 1.00),
('Mars', 1, 'Terrestrial', 4603.0, false, true, 1.52),
('Jupiter', 1, 'Gas Giant', 4603.0, false, true, 5.20),
('Saturn', 1, 'Gas Giant', 4503.0, false, true, 9.58),
('Uranus', 1, 'Ice Giant', 4503.0, false, true, 19.18),
('Neptune', 1, 'Ice Giant', 4503.0, false, true, 30.07),
('Proxima b', 2, 'Terrestrial', 4853.0, false, true, 4.24),
('Kepler-452b', 5, 'Super-Earth', 6000.0, false, true, 1402.00),
('Gliese 581g', 3, 'Super-Earth', 11000.0, false, true, 20.30),
('HD 209458 b', 6, 'Hot Jupiter', 5000.0, false, true, 153.00);

-- Insert data into moon table
INSERT INTO moon (name, planet_id, moon_type, age_in_millions_of_years, is_spherical, distance_from_earth)
VALUES
('Moon', 3, 'Natural', 4533.0, true, 1.00),
('Phobos', 4, 'Natural', 4503.0, false, 1.52),
('Deimos', 4, 'Natural', 4503.0, false, 1.52),
('Io', 5, 'Natural', 4503.0, true, 5.20),
('Europa', 5, 'Natural', 4503.0, true, 5.20),
('Ganymede', 5, 'Natural', 4503.0, true, 5.20),
('Callisto', 5, 'Natural', 4503.0, true, 5.20),
('Titan', 6, 'Natural', 4503.0, true, 9.58),
('Rhea', 6, 'Natural', 4503.0, false, 9.58),
('Iapetus', 6, 'Natural', 4503.0, false, 9.58),
('Titania', 7, 'Natural', 4503.0, false, 19.18),
('Oberon', 7, 'Natural', 4503.0, false, 19.18),
('Triton', 8, 'Natural', 4503.0, true, 30.07),
('Nereid', 8, 'Natural', 4503.0, false, 30.07),
('Charon', 9, 'Natural', 4853.0, false, 4.24),
('Phobos b', 10, 'Natural', 6000.0, false, 1402.00),
('Deimos b', 11, 'Natural', 11000.0, false, 20.30),
('Io b', 12, 'Natural', 5000.0, false, 153.00),
('Europa b', 12, 'Natural', 5000.0, false, 153.00),
('Ganymede b', 12, 'Natural', 5000.0, false, 153.00);
