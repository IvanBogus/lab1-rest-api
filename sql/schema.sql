-- StudentLab schema for Lab 2
CREATE DATABASE IF NOT EXISTS studentlab_db;
USE studentlab_db;

DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS `groups`;

CREATE TABLE `groups` (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    curator_name VARCHAR(100),
    study_year TINYINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    birth_date DATE,
    enrollment_year YEAR NOT NULL,
    group_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_students_group
        FOREIGN KEY (group_id) REFERENCES `groups`(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
    refresh_token_hash VARCHAR(255),
    email_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
    email_confirmation_token VARCHAR(255),
    reset_password_token VARCHAR(255),
    reset_password_expires_at DATETIME,
    google_id VARCHAR(100) UNIQUE,
    login_attempts INT NOT NULL DEFAULT 0,
    locked_until DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO `groups` (name, code, curator_name, study_year) VALUES
('Software Engineering 31', 'SE-31', 'Olena Marchenko', 3),
('Computer Science 22', 'CS-22', 'Andrii Kovalenko', 2),
('Applied Informatics 11', 'AI-11', 'Iryna Shevchenko', 1);

INSERT INTO students (first_name, last_name, email, birth_date, enrollment_year, group_id) VALUES
('Ivan', 'Petrenko', 'ivan.petrenko@studentlab.ua', '2004-05-14', 2022, 1),
('Maria', 'Koval', 'maria.koval@studentlab.ua', '2005-02-21', 2023, 2),
('Oleh', 'Ivanenko', 'oleh.ivanenko@studentlab.ua', '2006-09-09', 2024, 3),
('Sofiia', 'Melnyk', 'sofiia.melnyk@studentlab.ua', '2004-11-30', 2022, 1);
