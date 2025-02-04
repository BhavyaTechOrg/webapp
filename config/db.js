const { Sequelize } = require("sequelize");
require("dotenv").config();

const isTestEnv = process.env.NODE_ENV === "test"; // Check if running in test mode

const sequelize = new Sequelize(
  process.env.POSTGRESQL_DB,
  process.env.POSTGRESQL_USER,
  process.env.POSTGRESQL_PASSWORD,
  {
    host: process.env.POSTGRESQL_HOST,
    dialect: "postgres",
    logging: isTestEnv ? false : console.log, // Disable logging in test mode
  }
);

// Initialize DB only if not running in test mode
if (!isTestEnv) {
  (async () => {
    try {
      await sequelize.authenticate();
      console.log("Connection has been established successfully.");
      await sequelize.sync();
      console.log("Database synced successfully.");
    } catch (error) {
      console.error("Unable to connect to the database:", error);
    }
  })();
}

module.exports = sequelize;
