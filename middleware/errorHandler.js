// middleware/errorHandler.js
const logger = require("../config/logger");

const errorHandler = (err, req, res, next) => {
  logger.error(`Unexpected Error: ${err.message}`);
  res.status(500).send("Internal Server Error");
};

module.exports = errorHandler;
