// 


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

router.get("/v1/file", (req, res) => res.status(400).send());
router.delete("/v1/file", (req, res) => res.status(400).send());

router.head("/v1/file", healthController.methodNotAllowed);
router.options("/v1/file", healthController.methodNotAllowed);
router.patch("/v1/file", healthController.methodNotAllowed);
router.put("/v1/file", healthController.methodNotAllowed);

router.head("/v1/file/:id", healthController.methodNotAllowed);
router.options("/v1/file/:id", healthController.methodNotAllowed);
router.patch("/v1/file/:id", healthController.methodNotAllowed);
router.put("/v1/file/:id", healthController.methodNotAllowed);
router.post("/v1/file/:id", healthController.methodNotAllowed);

module.exports = router;
