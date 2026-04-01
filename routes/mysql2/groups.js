const express = require("express");
const pool = require("../../config/database");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id, name, code, curator_name, study_year, created_at, updated_at FROM `groups` ORDER BY id ASC"
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch groups with mysql2",
      error: error.message
    });
  }
});

module.exports = router;
