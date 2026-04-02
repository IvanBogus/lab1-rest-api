const express = require("express");

const router = express.Router();

let students = [
  { id: 1, name: "Іван Петренко", group: "ІО-31" },
  { id: 2, name: "Марія Коваль", group: "ІО-32" }
];

router.get("/", (req, res) => {
  res.json(students);
});

router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const student = students.find((item) => item.id === id);

  if (!student) {
    return res.status(404).json({
      message: "Студента не знайдено"
    });
  }

  res.json(student);
});

router.post("/", (req, res) => {
  const { id, name, group } = req.body;

  if (id === undefined || !name || !group) {
    return res.status(400).json({
      message: "Потрібно передати id, name, group"
    });
  }

  const exists = students.find((item) => item.id === id);

  if (exists) {
    return res.status(409).json({
      message: "Студент з таким id вже існує"
    });
  }

  const newStudent = { id, name, group };
  students.push(newStudent);

  res.status(201).json({
    message: "Студента додано"
    student: newStudent
  });
});

router.put("/:id", (req, res) => {
  const id = Number(req.params.id);
  const { name, group } = req.body;
  const student = students.find((item) => item.id === id);

  if (!student) {
    return res.status(404).json({
      message: "Студента не знайдено"
    });
  }

  if (name) student.name = name;
  if (group) student.group = group;

  res.json({
    message: "Студента оновлено"
    student
  });
});

router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = students.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(404).json({
      message: "Студента не знайдено"
    });
  }

  const deletedStudent = students[index];
  students.splice(index, 1);

  res.json({
    message: "Студента видалено"
    student: deletedStudent
  });
});

module.exports = router;
