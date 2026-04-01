const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const Group = sequelize.define(
  "Group",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true
    },
    curator_name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    study_year: {
      type: DataTypes.TINYINT,
      allowNull: false
    }
  },
  {
    tableName: "groups",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
);

module.exports = Group;
