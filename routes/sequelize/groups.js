const express = require("express");
const { Group } = require("../../models");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const groups = await Group.findAll({
      order: [["id", "ASC"]]
    });

    res.json(groups);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch groups with Sequelize",
      error: error.message
    });
  }
});

module.exports = router;
