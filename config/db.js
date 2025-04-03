// Import Sequelize
const { Sequelize } = require("sequelize");

// Ensure isTestEnv is defined
const isTestEnv = process.env.NODE_ENV === "test"; // Add this line if missing

// Initialize Sequelize with PostgreSQL database configuration
const sequelize = new Sequelize(
  process.env.POSTGRESQL_DB,
  process.env.POSTGRESQL_USER,
  process.env.POSTGRESQL_PASSWORD,
  {
    host: process.env.POSTGRESQL_HOST,
    port: process.env.POSTGRESQL_PORT || 5432,
    dialect: "postgres",
    logging: isTestEnv ? false : console.log,
    dialectOptions: !isTestEnv
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        }
      : {},
  }
);


// Export the Sequelize instance
module.exports = sequelize;
