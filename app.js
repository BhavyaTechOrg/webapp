const express = require('express');
const morgan = require('morgan');

const fileRoutes = require('./routes/fileRoutes');
const healthRoutes = require('./routes/healthRoutes');
const userRoutes = require('./routes/userRoutes');

const logger = require('./config/logger');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Parse incoming JSON requests
app.use(express.json());

// HTTP request logs via morgan + winston
app.use(
  morgan('combined', {
    stream: {
      write: (message) => {
        logger.info(message.trim(), { type: 'http_request' }); // Tagged for CloudWatch filtering
      }
    }
  })
);

// Custom structured request/metrics logging
app.use(requestLogger);

// Routes
app.use(healthRoutes);
app.use(fileRoutes);
app.use('/', userRoutes);

// Catch all errors centrally
app.use(errorHandler);

module.exports = app;
