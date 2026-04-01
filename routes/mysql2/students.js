const express = require("express");
const pool = require("../../config/database");

const router = express.Router();

async function groupExists(groupId) {
  const [rows] = await pool.execute(
    "SELECT id FROM `groups` WHERE id = ?",
    [groupId]
  );

  return rows.length > 0;
}

router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT
        students.id,
        students.first_name,
        students.last_name,
        students.email,
        students.birth_date,
        students.enrollment_year,
        students.group_id,
        \`groups\`.name AS group_name,
        \`groups\`.code AS group_code
      FROM students
      JOIN \`groups\` ON students.group_id = \`groups\`.id
      ORDER BY students.id ASC`
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch students with mysql2",
      error: error.message
    });
  }
});

router.post("/", async (req, res) => {
  const { first_name, last_name, email, birth_date, enrollment_year, group_id } = req.body;

  if (!first_name || !last_name || !email || !enrollment_year || !group_id) {
    return res.status(400).json({
      message: "first_name, last_name, email, enrollment_year and group_id are required"
    });
  }

  try {
    const hasGroup = await groupExists(group_id);

    if (!hasGroup) {
      return res.status(400).json({
        message: "The specified group_id does not exist"
      });
    }

    const [result] = await pool.execute(
      `INSERT INTO students
        (first_name, last_name, email, birth_date, enrollment_year, group_id)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [first_name, last_name, email, birth_date || null, enrollment_year, group_id]
    );

    const [rows] = await pool.execute(
      "SELECT id, first_name, last_name, email, birth_date, enrollment_year, group_id, created_at, updated_at FROM students WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json({
      message: "Student created successfully with mysql2",
      student: rows[0]
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create student with mysql2",
      error: error.message
    });
  }
});

router.put("/:id", async (req, res) => {
  const studentId = Number(req.params.id);
  const { first_name, last_name, email, birth_date, enrollment_year, group_id } = req.body;

  if (!studentId) {
    return res.status(400).json({
      message: "Valid student id is required"
    });
  }

  if (!first_name || !last_name || !email || !enrollment_year || !group_id) {
    return res.status(400).json({
      message: "first_name, last_name, email, enrollment_year and group_id are required"
    });
  }

  try {
    const hasGroup = await groupExists(group_id);

    if (!hasGroup) {
      return res.status(400).json({
        message: "The specified group_id does not exist"
      });
    }

    const [result] = await pool.execute(
      `UPDATE students
      SET first_name = ?, last_name = ?, email = ?, birth_date = ?, enrollment_year = ?, group_id = ?
      WHERE id = ?`,
      [first_name, last_name, email, birth_date || null, enrollment_year, group_id, studentId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    const [rows] = await pool.execute(
      "SELECT id, first_name, last_name, email, birth_date, enrollment_year, group_id, created_at, updated_at FROM students WHERE id = ?",
      [studentId]
    );

    res.json({
      message: "Student updated successfully with mysql2",
      student: rows[0]
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update student with mysql2",
      error: error.message
    });
  }
});

router.delete("/:id", async (req, res) => {
  const studentId = Number(req.params.id);

  if (!studentId) {
    return res.status(400).json({
      message: "Valid student id is required"
    });
  }

  try {
    const [result] = await pool.execute(
      "DELETE FROM students WHERE id = ?",
      [studentId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    res.json({
      message: "Student deleted successfully with mysql2"
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete student with mysql2",
      error: error.message
    });
  }
});

module.exports = router;
