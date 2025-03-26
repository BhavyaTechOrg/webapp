const logger = require('../config/logger');
const statsd = require('../config/metrics');

const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Log the incoming request
  logger.info(`${req.method} ${req.originalUrl}`);

  res.on('finish', () => {
    const duration = Date.now() - startTime;

    // Custom Metrics
    statsd.increment(`api_calls.${req.method.toLowerCase()}`);
    statsd.timing(`api_request_time.${req.method.toLowerCase()}`, duration);

    // Optionally log response status & duration
    logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });

  next();
};

module.exports = requestLogger;
