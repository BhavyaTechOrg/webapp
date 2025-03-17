const { Sequelize } = require("sequelize");
require("dotenv").config();

const isTestEnv = process.env.NODE_ENV === "test"; // Check if running in test mode

// Database connection options
const dbOptions = {
  dialect: "postgres",
  logging: isTestEnv ? false : console.log, // Disable logging in test mode
};

// Add SSL options only if running on AWS RDS or a remote DB
if (!isTestEnv) {
  dbOptions.dialectOptions = {
    ssl: {
      require: true, // Required for AWS RDS or secured remote DBs
      rejectUnauthorized: false, // Allows self-signed certs (RDS default)
    },
  };
}

// Initialize Sequelize without specifying `host`
const sequelize = new Sequelize(
  process.env.POSTGRESQL_DB,
  process.env.POSTGRESQL_USER,
  process.env.POSTGRESQL_PASSWORD,
  dbOptions
);

// Function to retry DB connection
async function connectWithRetries(retries = 5, delay = 5000) {
  while (retries > 0) {
    try {
      await sequelize.authenticate();
      console.log("Database connection established successfully.");
      await sequelize.sync();
      console.log("Database synced successfully.");
      return;
    } catch (error) {
      console.error(` Database connection failed. Retries left: ${retries}`, error);
      retries -= 1;
      if (retries === 0) {
        console.error("Could not connect to database. Exiting.");
        process.exit(1);
      }
      await new Promise((res) => setTimeout(res, delay));
    }
  }
}

// Connect only if not in test mode
if (!isTestEnv) {
  connectWithRetries();
}

module.exports = sequelize;
