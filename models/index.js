const sequelize = require("../config/sequelize");
const Group = require("./group");
const Student = require("./student");

Group.hasMany(Student, { foreignKey: "group_id" });
Student.belongsTo(Group, { foreignKey: "group_id" });

async function authenticateSequelize() {
  await sequelize.authenticate();
}

module.exports = {
  sequelize,
  Group,
  Student,
  authenticateSequelize
};
