const express = require('express');
const fileRoutes = require('./routes/fileRoutes');
const healthRoutes = require('./routes/healthRoutes');
const errorHandler = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');
const healthController = require('./controllers/healthController');
const fileController = require('./controllers/fileController');
const headRequestHandler = require('./middleware/headRequestHandler');

const app = express();

app.use(express.json());
app.use(requestLogger);

// Middleware to handle HEAD requests before they reach route handlers
app.use(headRequestHandler);

app.use(healthRoutes);
app.use(fileRoutes);
app.use(errorHandler);

module.exports = app;