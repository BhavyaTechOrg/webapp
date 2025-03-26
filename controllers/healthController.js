const HealthCheck = require("../models/HealthCheck");
const logger = require("../config/logger");
const statsd = require("../config/metrics");

exports.healthCheck = async (req, res) => {
  const apiStart = Date.now();

  try {
    // Reject payload, query params, or route params for GET /healthz
    if (
      Object.keys(req.body).length !== 0 ||
      Object.keys(req.query).length !== 0 ||
      Object.keys(req.params).length !== 0
    ) {
      logger.warn("Bad Request: Payload, query parameters, or route parameters are not allowed");

      res.set("Cache-Control", "no-cache, no-store, must-revalidate");
      res.set("Pragma", "no-cache");
      res.set("X-Content-Type-Options", "nosniff");

      statsd.increment("api.healthz.bad_request");
      return res.status(400).send();
    }

    const dbStart = Date.now();
    await HealthCheck.create({ datetime: new Date() });
    const dbDuration = Date.now() - dbStart;
    statsd.timing("db.query_time.healthz", dbDuration);

    res.set("Cache-Control", "no-cache, no-store, must-revalidate");
    res.set("Pragma", "no-cache");
    res.set("X-Content-Type-Options", "nosniff");

    logger.info("Health check record inserted successfully");
    statsd.increment("api.healthz.success");

    const apiDuration = Date.now() - apiStart;
    statsd.timing("api_request_time.healthz", apiDuration);

    return res.status(200).send();
  } catch (err) {
    logger.error(`Database Error: ${err.message}`);

    statsd.increment("api.healthz.failure");

    res.set("Cache-Control", "no-cache, no-store, must-revalidate");
    res.set("Pragma", "no-cache");
    res.set("X-Content-Type-Options", "nosniff");

    const apiDuration = Date.now() - apiStart;
    statsd.timing("api_request_time.healthz", apiDuration);

    return res.status(503).send();
  }
};

exports.methodNotAllowed = (req, res) => {
  logger.warn("Method Not Allowed");
  statsd.increment("api.healthz.method_not_allowed");

  res.set("Cache-Control", "no-cache, no-store, must-revalidate");
  res.set("Pragma", "no-cache");
  res.set("X-Content-Type-Options", "nosniff");

  return res.status(405).send();
};
