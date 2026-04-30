-- Run this ONLY if you want to reset. 
-- Spring Boot auto-creates tables via JPA (ddl-auto=update).
-- Just create the database:

CREATE DATABASE IF NOT EXISTS cab_system;
USE cab_system;

-- Tables are auto-created by Hibernate on first run.
-- Seed data is inserted by DataSeeder.java on startup.
