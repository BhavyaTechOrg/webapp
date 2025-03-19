const express = require('express');
const router = express.Router();
const multer = require('multer');
const fileController = require('../controllers/fileController');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/v1/file', upload.single('profilePic'), fileController.uploadFile);
router.get('/v1/file/:id', fileController.getFile);
router.delete('/v1/file/:id', fileController.deleteFile);

module.exports = router;
