const express = require('express');
const morgan = require('morgan');
const dotenv = require('dotenv');
const sequelize = require('./config/db');
const logger = require('./config/logger');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');
const healthRoutes = require('./routes/healthRoutes');
const fileRoutes = require('./routes/fileRoutes');
const userRoutes = require('./routes/userRoutes');

dotenv.config();
dotenv.config({ path: '/etc/webapp.env' });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim(), { type: 'http_request' })
  }
}));

app.use(requestLogger);

app.use('/', healthRoutes);
app.use('/', fileRoutes);
app.use('/', userRoutes);

app.use(errorHandler);


process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`, { stack: err.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection:', { reason });
  process.exit(1);
});

sequelize.sync({ alter: true })
  .then(() => {
    logger.info('Database synced successfully.');
    return sequelize.authenticate();
  })
  .then(() => {
    logger.info('Database connection established.');
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    logger.error('Unable to connect to the database:', { error: err.message, stack: err.stack });
    process.exit(1);
  });

module.exports = app;
