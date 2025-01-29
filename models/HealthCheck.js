// models/HealthCheck.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const HealthCheck = sequelize.define("HealthCheck", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  datetime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

module.exports = HealthCheck;