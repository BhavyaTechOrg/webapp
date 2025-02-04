const express = require("express");
const healthController = require("../controllers/healthController");

const router = express.Router();

// Define the /healthz route
router
  .route("/healthz")
  .get(healthController.healthCheck) // Handle GET requests
  .all(healthController.methodNotAllowed); // Handle all other HTTP methods

module.exports = router;
