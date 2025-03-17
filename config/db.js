// const { Sequelize } = require("sequelize");
// require("dotenv").config();

// const isTestEnv = process.env.NODE_ENV === "test"; // Check if running in test mode

// const sequelize = new Sequelize(
//   process.env.POSTGRESQL_DB,
//   process.env.POSTGRESQL_USER,
//   process.env.POSTGRESQL_PASSWORD,
//   {
//     host: process.env.POSTGRESQL_HOST,
//     dialect: "postgres",
//     logging: isTestEnv ? false : console.log, // Disable logging in test mode
//   }
// );

// // Initialize DB only if not running in test mode
// if (!isTestEnv) {
//   (async () => {
//     try {
//       await sequelize.authenticate();
//       console.log("Connection has been established successfully.");
//       await sequelize.sync();
//       console.log("Database synced successfully.");
//     } catch (error) {
//       console.error("Unable to connect to the database:", error);
//     }
//   })();
// }

// module.exports = sequelize;


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
    dialectOptions: {
      ssl: {
        require: true, // Required for AWS RDS
        rejectUnauthorized: false, // Allows self-signed certs (RDS default)
      },
    },
  }
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
        console.error(" Could not connect to database. Exiting.");
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
