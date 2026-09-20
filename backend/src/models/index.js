const sequelize = require("../config/sequelize");
const User = require("./User");
const Student = require("./Student");
const Subject = require("./Subject");
const Grade = require("./Grade");
const Notification = require("./Notification");

User.belongsTo(Student, { foreignKey: "studentId", as: "student" });
Student.hasOne(User, { foreignKey: "studentId", as: "user" });

const db = {
  sequelize,
  User,
  Student,
  Subject,
  Grade,
  Notification,
};

module.exports = db;
