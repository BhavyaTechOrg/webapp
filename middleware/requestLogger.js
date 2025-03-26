const logger = require('../config/logger');
const statsd = require('../config/metrics');

const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Capture method and route path
  const method = req.method.toLowerCase();
  const routePath = req.originalUrl.replace(/\//g, '_').replace(/:/g, '');

  logger.info(`${req.method} ${req.originalUrl}`);

  res.on('finish', () => {
    const duration = Date.now() - startTime;

    // Metrics: Count and timing per method and route
    statsd.increment(`api_calls.${method}.${routePath}`);
    statsd.timing(`api_request_time.${method}.${routePath}`, duration);

    logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });

  next();
};

module.exports = requestLogger;
