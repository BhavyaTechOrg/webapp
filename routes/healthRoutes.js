const express = require("express");
const router = express.Router();
const healthController = require("../controllers/healthController");

router.get("/healthz", healthController.healthCheck);

router.post("/healthz", healthController.methodNotAllowed);
router.put("/healthz", healthController.methodNotAllowed);
router.delete("/healthz", healthController.methodNotAllowed);
router.head("/healthz", healthController.methodNotAllowed);
router.options("/healthz", healthController.methodNotAllowed);
router.patch("/healthz", healthController.methodNotAllowed);

router.get("/healthz", healthController.healthCheck);

router.post("/healthz", healthController.methodNotAllowed);
router.put("/healthz", healthController.methodNotAllowed);
router.delete("/healthz", healthController.methodNotAllowed);
router.head("/healthz", healthController.methodNotAllowed);
router.options("/healthz", healthController.methodNotAllowed);
router.patch("/healthz", healthController.methodNotAllowed);

module.exports = router;
