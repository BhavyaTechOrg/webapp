const StatsD = require('hot-shots');

const statsd = new StatsD({
  host: '127.0.0.1',   // StatsD agent in EC2 via CloudWatch Agent
  port: 8125,
  prefix: 'webapp.',
  errorHandler: (error) => {
    console.error('StatsD error:', error);
  }
});

module.exports = statsd;
