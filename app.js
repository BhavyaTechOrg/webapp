const express = require('express');
const fileRoutes = require('./routes/fileRoutes');
const healthRoutes = require('./routes/healthRoutes');
const errorHandler = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');

const app = express();

app.use(express.json());
app.use(requestLogger);

app.use(healthRoutes);
app.use(fileRoutes);

app.use(errorHandler);

module.exports = app;
