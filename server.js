const express = require("express");

const app = express();
const PORT = 3000;

// Middleware для роботи з JSON
app.use(express.json());

// Тестовий маршрут
app.get("/", (req, res) => {
  res.send("Server is working 🚀");
});

// Тимчасове "сховище" студентів
let students = [
  { id: 1, name: "Іван Петренко", group: "ІО-31" },
  { id: 2, name: "Марія Коваль", group: "ІО-32" }
];


// =======================
// GET — отримати всіх студентів
// =======================
app.get("/students", (req, res) => {
  res.json(students);
});


// =======================
// POST — додати студента
// =======================
app.post("/students", (req, res) => {
  const { id, name, group } = req.body;

  // базова валідація
  if (!id || !name || !group) {
    return res.status(400).json({
      message: "Потрібно передати id, name, group"
    });
  }

  // перевірка на унікальний id
  const exists = students.find(s => s.id === id);

  if (exists) {
    return res.status(409).json({
      message: "Студент з таким id вже існує"
    });
  }

  const newStudent = { id, name, group };
  students.push(newStudent);

  res.status(201).json({
    message: "Студента додано",
    student: newStudent
  });
});


// =======================
// PUT — оновити студента
// =======================
app.put("/students/:id", (req, res) => {
  const id = Number(req.params.id);
  const { name, group } = req.body;

  const student = students.find(s => s.id === id);

  if (!student) {
    return res.status(404).json({
      message: "Студента не знайдено"
    });
  }

  if (name) student.name = name;
  if (group) student.group = group;

  res.json({
    message: "Студента оновлено",
    student
  });
});


// =======================
// DELETE — видалити студента
// =======================
app.delete("/students/:id", (req, res) => {
  const id = Number(req.params.id);

  const index = students.findIndex(s => s.id === id);

  if (index === -1) {
    return res.status(404).json({
      message: "Студента не знайдено"
    });
  }

  const deletedStudent = students[index];
  students.splice(index, 1);

  res.json({
    message: "Студента видалено",
    student: deletedStudent
  });
});


// =======================
// Запуск сервера
// =======================
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});