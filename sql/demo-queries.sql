-- Demo SELECT queries
SELECT id, name, code, curator_name, study_year, created_at, updated_at
FROM groups
ORDER BY id ASC;

SELECT
    students.id,
    students.first_name,
    students.last_name,
    students.email,
    students.birth_date,
    students.enrollment_year,
    students.group_id,
    groups.name AS group_name,
    groups.code AS group_code
FROM students
JOIN groups ON students.group_id = groups.id
ORDER BY students.id ASC;

-- Demo INSERT queries
INSERT INTO groups (name, code, curator_name, study_year)
VALUES ('Cybersecurity 41', 'CY-41', 'Mykola Bondar', 4);

INSERT INTO students (first_name, last_name, email, birth_date, enrollment_year, group_id)
VALUES ('Anna', 'Tkachenko', 'anna.tkachenko@studentlab.ua', '2005-07-18', 2023, 2);

-- Demo UPDATE queries
UPDATE students
SET group_id = 1
WHERE email = 'maria.koval@studentlab.ua';

UPDATE groups
SET curator_name = 'Nataliia Hrytsenko'
WHERE code = 'AI-11';

-- Demo DELETE queries
DELETE FROM students
WHERE email = 'anna.tkachenko@studentlab.ua';

-- This delete works only when no students reference the group
DELETE FROM groups
WHERE code = 'CY-41';
