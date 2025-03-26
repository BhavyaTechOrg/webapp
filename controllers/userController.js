const statsd = require('../config/metrics');
const logger = require('../config/logger');

// Simulated DB function
const getUsersFromDatabase = async () => {
  return [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' }
  ];
};

exports.getUsers = async (req, res) => {
  const queryStart = Date.now();
  try {
    logger.info('Accessing /users endpoint', {
      method: req.method,
      path: req.originalUrl
    });

    const users = await getUsersFromDatabase();
    const queryDuration = Date.now() - queryStart;

    statsd.timing('database_query_time.get_users', queryDuration);

    res.json(users);
  } catch (error) {
    logger.error('Error in /users endpoint', {
      method: req.method,
      path: req.originalUrl,
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({ error: 'Internal Server Error' });
  }
};
