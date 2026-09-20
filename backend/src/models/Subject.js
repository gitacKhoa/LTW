const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const Subject = sequelize.define(
  "Subject",
  {
    id: {
      type: DataTypes.STRING(20),
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    credits: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "subjects",
    timestamps: true,
  }
);

module.exports = Subject;
