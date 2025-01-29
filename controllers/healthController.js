// controllers/healthController.js
const HealthCheck = require("../models/HealthCheck");
const logger = require("../config/logger");
const Joi = require("joi");

const validateRequest = (req) => {
  const schema = Joi.object().keys({});
  return schema.validate(req.body);
};

exports.healthCheck = async (req, res) => {
  const { error } = validateRequest(req);
  if (error) {
    logger.warn("Bad Request: Validation failed");
    res.set("Cache-Control", "no-cache, no-store, must-revalidate");
    res.set("Pragma", "no-cache");
    res.set("X-Content-Type-Options", "nosniff")
    return res.status(400).send(error.details[0].message);
  }

  try {
    await HealthCheck.create({ datetime: new Date() });
    res.set("Cache-Control", "no-cache, no-store, must-revalidate");
    res.set("Pragma", "no-cache");
    res.set("X-Content-Type-Options", "nosniff");
    logger.info("Health check record inserted successfully");
    res.status(200).send();
  } catch (err) {
    logger.error(`Service Unavailable: ${err.message}`);
    res.set("Cache-Control", "no-cache, no-store, must-revalidate");
    res.set("Pragma", "no-cache");
    res.set("X-Content-Type-Options", "nosniff");
    res.status(503).send();
  }
};

exports.methodNotAllowed = (req, res) => {
  logger.warn("Method Not Allowed");
  res.set("Cache-Control", "no-cache, no-store, must-revalidate");
  res.set("Pragma", "no-cache");
  res.set("X-Content-Type-Options", "nosniff");
  res.status(405).send();
};