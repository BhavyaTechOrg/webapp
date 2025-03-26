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
  const apiStart = Date.now();
  try {
    logger.info('Accessing /users endpoint', {
      method: req.method,
      path: req.originalUrl
    });

    const dbStart = Date.now();
    const users = await getUsersFromDatabase();
    const dbDuration = Date.now() - dbStart;
    statsd.timing('db.query_time.get_users', dbDuration);

    res.json(users);

    const apiDuration = Date.now() - apiStart;
    statsd.increment('api.users.success');
    statsd.timing('api_request_time.users', apiDuration);
  } catch (error) {
    const apiDuration = Date.now() - apiStart;
    statsd.increment('api.users.failure');
    statsd.timing('api_request_time.users', apiDuration);

    logger.error('Error in /users endpoint', {
      method: req.method,
      path: req.originalUrl,
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({ error: 'Internal Server Error' });
  }
};
