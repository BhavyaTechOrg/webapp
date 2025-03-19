// index.js
const express = require("express");
const sequelize = require("./config/db");
const healthRoutes = require("./routes/healthRoutes");
const fileRoutes = require("./routes/fileRoutes"); 
const logger = require("./config/logger");
const requestLogger = require("./middleware/logger"); 
const errorHandler = require("./middleware/errorHandler");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(requestLogger);
app.use("/", healthRoutes);
app.use("/", fileRoutes); // Add file routes

// Error handling middleware
app.use(errorHandler);

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
    logger.error(`Uncaught Exception: ${err.message}`);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
    logger.error(`Unhandled Rejection: ${reason}`);
    process.exit(1);
});

sequelize.sync({ alter: true })
    .then(() => {
        logger.info("Database synced successfully.");  // Added info log
        return sequelize.authenticate();              // Test the connection
    })
    .then(() => {
        logger.info("Database connection established."); // Added info log
        app.listen(PORT, () => {
            logger.info(`Server is running on port ${PORT}`);
        });
    })
    .catch(err => {
        logger.error(`Unable to connect to the database: ${err}`);
        process.exit(1); // Exit process on database connection failure
    });

module.exports = app;
