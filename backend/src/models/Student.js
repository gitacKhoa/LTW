const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const Student = sequelize.define(
  "Student",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    fullName: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    studentCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    className: {
      type: DataTypes.STRING(80),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    gpa: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: true,
    },
    academicRank: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("none", "pass", "fail"),
      allowNull: false,
      defaultValue: "none",
    },
  },
  {
    tableName: "students",
    timestamps: true,
  }
);

module.exports = Student;
