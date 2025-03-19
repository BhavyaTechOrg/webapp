const File = require('../models/File');
const s3 = require('../config/s3Config');
const logger = require('../config/logger');
const { v4: uuidv4 } = require('uuid');

exports.uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const fileId = uuidv4();
        const fileName = req.file.originalname;
        const bucketKey = `user-uploads/${fileId}-${fileName}`;

        const params = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: bucketKey,
            Body: req.file.buffer,
            ContentType: req.file.mimetype,
            Metadata: {
                originalName: fileName,
                fileId: fileId
            }
        };

        const s3Response = await s3.upload(params).promise();

        const file = await File.create({
            id: fileId,
            file_name: fileName,
            url: s3Response.Location,
            upload_date: new Date().toISOString().split('T')[0]
        });

        logger.info(`File uploaded successfully: ${fileId}`);
        res.status(201).json({
            file_name: file.file_name,
            id: file.id,
            url: file.url,
            upload_date: file.upload_date
        });

    } catch (error) {
        logger.error(`File upload error: ${error.message}`);
        res.status(400).json({ error: 'Bad Request' });
    }
};

exports.getFile = async (req, res) => {
    try {
        const file = await File.findByPk(req.params.id);
        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }

        logger.info(`File metadata retrieved: ${req.params.id}`);
        res.status(200).json({
            file_name: file.file_name,
            id: file.id,
            url: file.url,
            upload_date: file.upload_date
        });
    } catch (error) {
        logger.error(`File retrieval error: ${error.message}`);
        res.status(404).json({ error: 'Not Found' });
    }
};

exports.deleteFile = async (req, res) => {
    try {
        const file = await File.findByPk(req.params.id);
        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }

        // Extract proper key from URL
        const urlParts = file.url.split('/');
        const key = urlParts.slice(3).join('/');

        const params = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: key
        };

        await s3.deleteObject(params).promise();
        await file.destroy();

        logger.info(`File deleted successfully: ${req.params.id}`);
        res.status(204).send();
    } catch (error) {
        logger.error(`File deletion error: ${error.message}`);
        res.status(404).json({ error: 'Not Found' });
    }
};

// Handlers for unsupported methods
exports.methodNotAllowed = (req, res) => {
    res.status(405).json({ error: 'Method Not Allowed' });
};

exports.badRequest = (req, res) => {
    res.status(400).json({ error: 'Bad Request' });
};