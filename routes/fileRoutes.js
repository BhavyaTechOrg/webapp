const express = require('express');
const router = express.Router();
const multer = require('multer');
const fileController = require('../controllers/fileController');

const upload = multer({ storage: multer.memoryStorage() });

// Supported methods for /v1/file
router.post('/v1/file', upload.single('profilePic'), fileController.uploadFile);
router.get('/v1/file', fileController.badRequest);
router.delete('/v1/file', fileController.badRequest);

// Unsupported methods for /v1/file
router.head('/v1/file', fileController.methodNotAllowed);
router.options('/v1/file', fileController.methodNotAllowed);
router.patch('/v1/file', fileController.methodNotAllowed);
router.put('/v1/file', fileController.methodNotAllowed);

// Supported methods for /v1/file/:id
router.get('/v1/file/:id', fileController.getFile);
router.delete('/v1/file/:id', fileController.deleteFile);

// Unsupported methods for /v1/file/:id
router.head('/v1/file/:id', fileController.methodNotAllowed);
router.options('/v1/file/:id', fileController.methodNotAllowed);
router.patch('/v1/file/:id', fileController.methodNotAllowed);
router.put('/v1/file/:id', fileController.methodNotAllowed);
router.post('/v1/file/:id', fileController.methodNotAllowed);

module.exports = router;