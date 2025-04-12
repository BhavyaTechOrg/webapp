const express = require("express");
const router = express.Router();
const cicdController = require("../controllers/cicdController");

router.get("/cicd", cicdController.check);

router.post("/cicd", cicdController.methodNotAllowed);
router.put("/cicd", cicdController.methodNotAllowed);
router.delete("/cicd", cicdController.methodNotAllowed);
router.patch("/cicd", cicdController.methodNotAllowed);
router.options("/cicd", cicdController.methodNotAllowed);
router.head("/cicd", cicdController.methodNotAllowed);

module.exports = router;
