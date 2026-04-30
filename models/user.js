const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const User = sequelize.define(
  "User",
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
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    role: {
      type: DataTypes.ENUM("admin", "user"),
      allowNull: false,
      defaultValue: "user"
    },
    refresh_token_hash: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    email_confirmed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    email_confirmation_token: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    reset_password_token: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    reset_password_expires_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    google_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true
    },
    login_attempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    locked_until: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    tableName: "users",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at"
  }
);

module.exports = User;
