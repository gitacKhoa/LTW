const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");
const Student = require("./Student");
const Subject = require("./Subject");

const Grade = sequelize.define(
  "Grade",
  {
    id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
    },
    studentId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Student,
        key: "id",
      },
    },
    subjectId: {
      type: DataTypes.STRING(20),
      allowNull: false,
      references: {
        model: Subject,
        key: "id",
      },
    },
    processScore: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: true,
    },
    examScore: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: true,
    },
    totalScore: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: true,
    },
    evaluation: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
  },
  {
    tableName: "grades",
    timestamps: true,
  }
);

Student.hasMany(Grade, { foreignKey: "studentId", as: "grades" });
Grade.belongsTo(Student, { foreignKey: "studentId", as: "student" });

Subject.hasMany(Grade, { foreignKey: "subjectId", as: "grades" });
Grade.belongsTo(Subject, { foreignKey: "subjectId", as: "subject" });

module.exports = Grade;
