const express = require('express');
const fileRoutes = require('./routes/fileRoutes');
const healthRoutes = require('./routes/healthRoutes');
const errorHandler = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');
const healthController = require('./controllers/healthController');
const fileController = require('./controllers/fileController');

const app = express();

app.use(express.json());
app.use(requestLogger);

// Middleware to handle HEAD requests before they reach route handlers
app.use((req, res, next) => {
  if (req.method === 'HEAD') {
    // Route HEAD requests to your methodNotAllowed handler
    if (req.path === '/healthz') {
      return healthController.methodNotAllowed(req, res);
    } else if (req.path === '/v1/file' || req.path.startsWith('/v1/file/')) {
      return fileController.methodNotAllowed(req, res);
    }
  }
  next();
});

app.use(healthRoutes);
app.use(fileRoutes);
app.use(errorHandler);

module.exports = app;