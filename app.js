const express = require('express');
const headRequestHandler = require('./middleware/headRequestHandler');
const fileRoutes = require('./routes/fileRoutes');
const healthRoutes = require('./routes/healthRoutes');
const errorHandler = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');
const healthController = require('./controllers/healthController');
const fileController = require('./controllers/fileController');

const app = express();

app.use(express.json());
app.use(requestLogger);

// HEAD middleware placed BEFORE route definitions
app.use(headRequestHandler);

app.use(healthRoutes);
app.use(fileRoutes);
app.use(errorHandler);

module.exports = app;
