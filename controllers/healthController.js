const HealthCheck = require("../models/HealthCheck");
const logger = require("../config/logger");
const statsd = require("../config/metrics");

exports.healthCheck = async (req, res) => {
  const apiStart = Date.now();
  statsd.increment("api.healthz.attempted");  // Count for health check attempts

  try {
    // Reject if payload/query/params are present
    if (
      Object.keys(req.body).length !== 0 ||
      Object.keys(req.query).length !== 0 ||
      Object.keys(req.params).length !== 0
    ) {
      logger.warn("Health check failed: Request should not contain body, query, or path parameters");
      statsd.increment("api.healthz.bad_request");  // Count for bad request (400)

      res.set("Cache-Control", "no-cache, no-store, must-revalidate");
      res.set("Pragma", "no-cache");
      res.set("X-Content-Type-Options", "nosniff");

      const apiDuration = Date.now() - apiStart;
      statsd.timing("api_request_time.healthz", apiDuration);  // Timer for bad requests

      return res.status(400).send();
    }

    // DB operation: Create a health check record in the DB
    const dbStart = Date.now();
    await HealthCheck.create({ datetime: new Date() });
    const dbDuration = Date.now() - dbStart;
    statsd.timing("db.query_time.healthz.create_record", dbDuration);  // Timer for DB query time

    statsd.increment("api.healthz.success");  // Count for successful health checks

    logger.info("Health check record created successfully and DB write completed");

    const apiDuration = Date.now() - apiStart;
    statsd.timing("api_request_time.healthz", apiDuration);  // Timer for health check API request time

    res.set("Cache-Control", "no-cache, no-store, must-revalidate");
    res.set("Pragma", "no-cache");
    res.set("X-Content-Type-Options", "nosniff");

    return res.status(200).send();  // Return 200 OK if everything is fine
  } catch (err) {
    logger.error(`Health check failed due to database error: ${err.message}`);
    statsd.increment("api.healthz.failure");  // Count for health check failure (503)

    const apiDuration = Date.now() - apiStart;
    statsd.timing("api_request_time.healthz", apiDuration);  // Timer for API request failure

    res.set("Cache-Control", "no-cache, no-store, must-revalidate");
    res.set("Pragma", "no-cache");
    res.set("X-Content-Type-Options", "nosniff");

    return res.status(503).send();  // Return 503 Service Unavailable if DB operation fails
  }
};

exports.methodNotAllowed = (req, res) => {
  logger.warn(`HTTP Method ${req.method} is not allowed on ${req.originalUrl}`);
  statsd.increment("api.healthz.method_not_allowed");  // Count for unsupported methods

  res.set("Cache-Control", "no-cache, no-store, must-revalidate");
  res.set("Pragma", "no-cache");
  res.set("X-Content-Type-Options", "nosniff");

  return res.status(405).send();  // Method not allowed
};

exports.badRequest = (req, res) => {
  logger.warn(`Bad request received on route: ${req.originalUrl}`);
  statsd.increment("api.healthz.bad_request");  // Count for bad requests

  res.set("Cache-Control", "no-cache, no-store, must-revalidate");
  res.set("Pragma", "no-cache");
  res.set("X-Content-Type-Options", "nosniff");

  return res.status(400).json({ error: "Bad Request" });  // Return 400 Bad Request
};
