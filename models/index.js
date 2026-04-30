const sequelize = require("../config/sequelize");
const Group = require("./group");
const Student = require("./student");
const User = require("./user");

Group.hasMany(Student, { foreignKey: "group_id" });
Student.belongsTo(Group, { foreignKey: "group_id" });

async function authenticateSequelize() {
  await sequelize.authenticate();
  await User.sync();
}

module.exports = {
  sequelize,
  Group,
  Student,
  User,
  authenticateSequelize
};
