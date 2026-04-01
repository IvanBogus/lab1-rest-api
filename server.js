require("dotenv").config();
const express = require("express");
const legacyStudentsRoutes = require("./routes/legacy/students");
const mysql2GroupsRoutes = require("./routes/mysql2/groups");
const mysql2StudentsRoutes = require("./routes/mysql2/students");
const sequelizeGroupsRoutes = require("./routes/sequelize/groups");
const sequelizeStudentsRoutes = require("./routes/sequelize/students");
const { authenticateSequelize } = require("./models");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("StudentLab API is running");
});

app.use("/api/legacy/students", legacyStudentsRoutes);
app.use("/api/mysql2/groups", mysql2GroupsRoutes);
app.use("/api/mysql2/students", mysql2StudentsRoutes);
app.use("/api/sequelize/groups", sequelizeGroupsRoutes);
app.use("/api/sequelize/students", sequelizeStudentsRoutes);

async function startServer() {
  try {
    await authenticateSequelize();
    console.log("Sequelize connection is ready");
  } catch (error) {
    console.error("Sequelize authentication failed:", error.message);
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
