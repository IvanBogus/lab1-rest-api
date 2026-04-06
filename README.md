# lab1-rest-api

Навчальний серверний вебзастосунок, виконаний у межах лабораторних робіт з дисципліни **"Технології розроблення серверного ПЗ (Back-end)"**.

Проєкт об'єднує:
- **Лабораторну роботу 1**: REST API для обліку студентів з in-memory зберіганням.
- **Лабораторну роботу 2**: розширення API з використанням MySQL, `mysql2` та Sequelize ORM.

## Опис проєкту

Мета проєкту — продемонструвати базову побудову серверного REST API для роботи з даними студентів та показати два підходи до доступу до бази даних:
- через SQL-запити за допомогою `mysql2`
- через ORM Sequelize

У проєкті реалізовано три окремі набори маршрутів:
- `/api/legacy` — логіка Лабораторної роботи 1, дані зберігаються у пам'яті сервера
- `/api/mysql2` — робота з MySQL через сирі SQL-запити
- `/api/sequelize` — робота з MySQL через Sequelize ORM

## Технології

- Node.js
- Express.js
- MySQL
- mysql2
- Sequelize
- dotenv

## Структура бази даних

Для Лабораторної роботи 2 використовується база даних **`studentlab_db`**.

### Таблиця `groups`

Містить інформацію про академічні групи:
- `id`
- `name`
- `code`
- `curator_name`
- `study_year`
- `created_at`
- `updated_at`

### Таблиця `students`

Містить інформацію про студентів:
- `id`
- `first_name`
- `last_name`
- `email`
- `birth_date`
- `enrollment_year`
- `group_id`
- `created_at`
- `updated_at`

### Зв'язок між таблицями

- Один запис у таблиці `groups` може мати багато студентів
- Один студент належить до однієї групи
- Тип зв'язку: **One-to-Many (`Group -> Students`)**

## Встановлення та запуск

### 1. Клонувати репозиторій

```bash
git clone https://github.com/IvanBogus/lab1-rest-api.git
cd lab1-rest-api
```

### 2. Встановити залежності

```bash
npm install
```

### 3. Налаштувати `.env`

Створити файл `.env` у корені проєкту на основі `.env.example` або заповнити його вручну.

Приклад:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=admin
DB_PASSWORD=password123
DB_NAME=studentlab_db
PORT=3000
```

### 4. Створити базу даних

Запустити `sql/schema.sql` у **MySQL Workbench** або через **MySQL CLI**.

### 5. Запустити сервер

```bash
npm start
```

Після запуску сервер буде доступний за адресою:

```bash
http://localhost:3000
```

## Змінні середовища

У проєкті використовуються такі змінні середовища:
- `DB_HOST` — хост MySQL-сервера
- `DB_PORT` — порт MySQL
- `DB_USER` — користувач MySQL
- `DB_PASSWORD` — пароль MySQL
- `DB_NAME` — назва бази даних
- `PORT` — порт запуску Express-сервера

## SQL-скрипти

У каталозі `sql` містяться такі файли:

### `sql/schema.sql`

Скрипт створює:
- базу даних `studentlab_db`
- таблиці `groups` і `students`
- зовнішній ключ `students.group_id -> groups.id`
- початкові тестові дані

### `sql/demo-queries.sql`

Скрипт містить приклади SQL-запитів:
- `SELECT`
- `INSERT`
- `UPDATE`
- `DELETE`

## API маршрути

### 1. Legacy API (Lab 1, in-memory)

Базовий шлях:

```bash
/api/legacy/students
```

Маршрути:
- `GET /api/legacy/students` — отримати список студентів
- `GET /api/legacy/students/:id` — отримати студента за `id`
- `POST /api/legacy/students` — додати студента
- `PUT /api/legacy/students/:id` — оновити студента
- `DELETE /api/legacy/students/:id` — видалити студента

Приклад тіла запиту для `POST`:

```json
{
  "id": 3,
  "name": "Олег Іваненко",
  "group": "ІО-33"
}
```

### 2. MySQL2 API (raw SQL)

#### Групи

- `GET /api/mysql2/groups` — отримати список груп

#### Студенти

- `GET /api/mysql2/students` — отримати список студентів разом із даними групи
- `POST /api/mysql2/students` — додати студента
- `PUT /api/mysql2/students/:id` — оновити студента
- `DELETE /api/mysql2/students/:id` — видалити студента

Приклад тіла запиту для `POST` / `PUT`:

```json
{
  "first_name": "Ivan",
  "last_name": "Petrenko",
  "email": "ivan.petrenko@studentlab.ua",
  "birth_date": "2004-05-14",
  "enrollment_year": 2022,
  "group_id": 1
}
```

### 3. Sequelize API (ORM)

#### Групи

- `GET /api/sequelize/groups` — отримати список груп

#### Студенти

- `GET /api/sequelize/students` — отримати список студентів разом із пов'язаною групою
- `POST /api/sequelize/students` — додати студента
- `PUT /api/sequelize/students/:id` — оновити студента
- `DELETE /api/sequelize/students/:id` — видалити студента

Приклад тіла запиту для `POST` / `PUT`:

```json
{
  "first_name": "Ivan",
  "last_name": "Petrenko",
  "email": "ivan.petrenko@studentlab.ua",
  "birth_date": "2004-05-14",
  "enrollment_year": 2022,
  "group_id": 1
}
```

## Architecture

- `config/` — налаштування підключення до MySQL через `mysql2` і Sequelize
- `models/` — Sequelize-моделі та опис зв'язків між сутностями
- `routes/` — маршрути API, розділені за підходом реалізації: legacy, mysql2, sequelize
- `sql/` — SQL-скрипти для створення структури бази даних і демонстраційних запитів

## Структура проєкту

```bash
lab1-rest-api/
├── config/
│   ├── .gitkeep
│   ├── database.js
│   └── sequelize.js
├── models/
│   ├── .gitkeep
│   ├── group.js
│   ├── index.js
│   └── student.js
├── routes/
│   ├── legacy/
│   │   └── students.js
│   ├── mysql2/
│   │   ├── groups.js
│   │   └── students.js
│   └── sequelize/
│       ├── groups.js
│       └── students.js
├── sql/
│   ├── demo-queries.sql
│   └── schema.sql
├── .env
├── .env.example
├── package.json
├── server.js
└── README.md
```
