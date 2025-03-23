const healthController = require('../controllers/healthController');
const fileController = require('../controllers/fileController');

const headRequestHandler = (req, res, next) => {
  // Only intercept HEAD requests
  if (req.method !== 'HEAD') {
    return next();
  }
  
  // Handle specific paths
  if (req.path === '/healthz') {
    return healthController.methodNotAllowed(req, res);
  } 
  
  if (req.path === '/v1/file' || req.path.startsWith('/v1/file/')) {
    return fileController.methodNotAllowed(req, res);
  }
  
  // Let other HEAD requests pass through
  next();
};

module.exports = headRequestHandler;