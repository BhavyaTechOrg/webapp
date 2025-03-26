const express = require('express');
const morgan = require('morgan');

const fileRoutes = require('./routes/fileRoutes');
const healthRoutes = require('./routes/healthRoutes');
const userRoutes = require('./routes/userRoutes');

const logger = require('./config/logger');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Parse JSON bodies
app.use(express.json());

// HTTP request logging using Morgan + Winston
app.use(
  morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  })
);

// Custom metrics + structured request logging
app.use(requestLogger);

// API routes
app.use(healthRoutes);
app.use(fileRoutes);
app.use('/', userRoutes);

// Centralized error handling
app.use(errorHandler);

module.exports = app;
