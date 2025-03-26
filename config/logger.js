const { createLogger, format, transports } = require('winston');
const path = require('path');
const fs = require('fs');

// Step 1: Determine base log directory based on environment
let logDir;

if (process.env.NODE_ENV === 'test') {
  logDir = path.join(__dirname, '../logs/test');
} else if (process.env.NODE_ENV === 'development') {
  logDir = path.join(__dirname, '../logs/dev');
} else {
  // Default for production
  logDir = '/var/log/webapp';
  try {
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  } catch (err) {
    console.error('[logger.js] Cannot write to /var/log/webapp:', err.message);
    // Fallback to local log folder in production
    logDir = path.join(__dirname, '../logs/prod');
  }
}

// Step 2: Make sure the fallback logDir exists
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Step 3: Configure Winston logger
const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => {
      return `${timestamp} ${level.toUpperCase()}: ${message}`;
    })
  ),
  transports: [
    new transports.Console(),
    new transports.File({
      filename: path.join(logDir, 'app.log'),
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 5,
    }),
  ],
  exceptionHandlers: [
    new transports.File({ filename: path.join(logDir, 'exceptions.log') }),
  ],
  rejectionHandlers: [
    new transports.File({ filename: path.join(logDir, 'rejections.log') }),
  ],
});

module.exports = logger;
