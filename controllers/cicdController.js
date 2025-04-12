const HealthCheck = require("../models/HealthCheck");
const logger = require("../config/logger");
const statsd = require("../config/metrics");

// GET /cicd - Health-style check for CI/CD status
exports.check = async (req, res) => {
  const apiStart = Date.now();
  statsd.increment("api.cicd.attempted");

  try {
    if (
      Object.keys(req.body).length !== 0 ||
      Object.keys(req.query).length !== 0 ||
      Object.keys(req.params).length !== 0
    ) {
      logger.warn("CICD check failed: Unexpected request body/query/params");
      statsd.increment("api.cicd.bad_request");

      const apiDuration = Date.now() - apiStart;
      statsd.timing("api_request_time.cicd", apiDuration);
      return res.status(400).send();
    }

    await HealthCheck.create({ datetime: new Date() });
    statsd.increment("api.cicd.success");

    logger.info("CICD check passed, record added");

    const apiDuration = Date.now() - apiStart;
    statsd.timing("api_request_time.cicd", apiDuration);

    return res.status(200).send();
  } catch (err) {
    logger.error(`CICD check failed: ${err.message}`);
    statsd.increment("api.cicd.failure");

    const apiDuration = Date.now() - apiStart;
    statsd.timing("api_request_time.cicd", apiDuration);

    return res.status(503).send();
  }
};

exports.methodNotAllowed = (req, res) => {
  logger.warn(`Method ${req.method} not allowed on /cicd`);
  statsd.increment("api.cicd.method_not_allowed");
  return res.status(405).send();
};