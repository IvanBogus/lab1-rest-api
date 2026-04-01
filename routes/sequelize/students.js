const express = require("express");
const { Student, Group } = require("../../models");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const students = await Student.findAll({
      include: [
        {
          model: Group,
          attributes: ["id", "name", "code", "curator_name", "study_year"]
        }
      ],
      order: [["id", "ASC"]]
    });

    res.json(students);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch students with Sequelize",
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
    const group = await Group.findByPk(group_id);

    if (!group) {
      return res.status(400).json({
        message: "The specified group_id does not exist"
      });
    }

    const student = await Student.create({
      first_name,
      last_name,
      email,
      birth_date: birth_date || null,
      enrollment_year,
      group_id
    });

    res.status(201).json({
      message: "Student created successfully with Sequelize",
      student
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create student with Sequelize",
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
    const student = await Student.findByPk(studentId);

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    const group = await Group.findByPk(group_id);

    if (!group) {
      return res.status(400).json({
        message: "The specified group_id does not exist"
      });
    }

    await student.update({
      first_name,
      last_name,
      email,
      birth_date: birth_date || null,
      enrollment_year,
      group_id
    });

    res.json({
      message: "Student updated successfully with Sequelize",
      student
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update student with Sequelize",
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
    const student = await Student.findByPk(studentId);

    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    await student.destroy();

    res.json({
      message: "Student deleted successfully with Sequelize"
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete student with Sequelize",
      error: error.message
    });
  }
});

module.exports = router;
