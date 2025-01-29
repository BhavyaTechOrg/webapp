// routes/healthRoutes.js
const express = require("express");
const healthController = require("../controllers/healthController");

const router = express.Router();

router.route("/healthz")
  .get(healthController.healthCheck)
  .all(healthController.methodNotAllowed);

module.exports = router;