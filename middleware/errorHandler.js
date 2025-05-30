const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
  // Log the full error details
  logger.error('Unhandled error', {
    method: req.method,
    path: req.originalUrl,
    error: err.message,
    stack: err.stack
  });

  // Handle body parsing errors from express.json()
  if (err.type === 'entity.parse.failed') {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('X-Content-Type-Options', 'nosniff');
    return res.status(400).send(); // No body in the response
  }

  // Handle database-related errors explicitly
  if (
    err.name === 'SequelizeConnectionError' ||
    err.name === 'SequelizeDatabaseError'
  ) {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('X-Content-Type-Options', 'nosniff');
    return res.status(503).send(); // No body in the response
  }

  // Default fallback: Bad Request for unexpected errors
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('X-Content-Type-Options', 'nosniff');
  return res.status(500).json({ error: 'Unexpected error occurred' });
};

module.exports = errorHandler;
