const HealthCheck = require("../models/HealthCheck");
const logger = require("../config/logger");

exports.healthCheck = async (req, res) => {
  try {
    // Check for any payload, query parameters, or route parameters in GET request
    if (
      Object.keys(req.body).length !== 0 || 
      Object.keys(req.query).length !== 0 || 
      Object.keys(req.params).length !== 0
    ) {
      logger.warn("Bad Request: Payload, query parameters, or route parameters are not allowed");
      res.set("Cache-Control", "no-cache, no-store, must-revalidate");
      res.set("Pragma", "no-cache");
      res.set("X-Content-Type-Options", "nosniff");
      return res.status(400).send(); // No body
    }

    // Attempt to insert a health check record into the database
    await HealthCheck.create({ datetime: new Date() });

    res.set("Cache-Control", "no-cache, no-store, must-revalidate");
    res.set("Pragma", "no-cache");
    res.set("X-Content-Type-Options", "nosniff");
    logger.info("Health check record inserted successfully");
    return res.status(200).send(); // No body
  } catch (err) {
    logger.error(`Database Error: ${err.message}`);

    // Handle database-related errors explicitly
    res.set("Cache-Control", "no-cache, no-store, must-revalidate");
    res.set("Pragma", "no-cache");
    res.set("X-Content-Type-Options", "nosniff");
    return res.status(503).send(); // No body
  }
};

exports.methodNotAllowed = (req, res) => {
  logger.warn("Method Not Allowed");
  res.set("Cache-Control", "no-cache, no-store, must-revalidate");
  res.set("Pragma", "no-cache");
  res.set("X-Content-Type-Options", "nosniff");
  return res.status(405).send(); // No body
};
