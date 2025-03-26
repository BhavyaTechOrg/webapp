const { createLogger, format, transports } = require('winston');
const path = require('path');
const fs = require('fs');

// Step 1: Choose log directory based on environment
let logDir;

if (process.env.NODE_ENV === 'test') {
  logDir = path.join(__dirname, '../logs/test');
} else if (process.env.NODE_ENV === 'development') {
  logDir = path.join(__dirname, '../logs/dev');
} else {
  // Production → use system log path
  logDir = '/var/log/webapp';
  try {
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  } catch (err) {
    console.error('[logger.js] Cannot write to /var/log/webapp. Falling back to ./logs/prod');
    logDir = path.join(__dirname, '../logs/prod');
  }
}

// Step 2: Fallback directory creation if needed
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Step 3: Configure Winston logger
const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.printf(({ timestamp, level, message, stack }) => {
      return stack
        ? `${timestamp} ${level.toUpperCase()}: ${message}\n${stack}`
        : `${timestamp} ${level.toUpperCase()}: ${message}`;
    })
  ),
  transports: [
    new transports.Console(),
    new transports.File({
      filename: path.join(logDir, 'app.log'),
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 5
    }),
  ],
  exceptionHandlers: [
    new transports.File({ filename: path.join(logDir, 'exceptions.log') }),
  ],
  rejectionHandlers: [
    new transports.File({ filename: path.join(logDir, 'rejections.log') }),
  ]
});

module.exports = logger;
