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
        res.status(500).json({ error: 'File upload failed' });
    }
};

exports.getFile = async (req, res) => {
    try {
        const file = await File.findByPk(req.params.id);
        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }

        logger.info(`File metadata retrieved: ${req.params.id}`);
        res.json({
            file_name: file.file_name,
            id: file.id,
            url: file.url,
            upload_date: file.upload_date
        });
    } catch (error) {
        logger.error(`File retrieval error: ${error.message}`);
        res.status(500).json({ error: 'File retrieval failed' });
    }
};

exports.deleteFile = async (req, res) => {
    try {
        const file = await File.findByPk(req.params.id);
        if (!file) {
            return res.status(404).json({ error: 'File not found' });
        }

        const params = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: file.url.split('/').pop()
        };

        await s3.deleteObject(params).promise();
        await file.destroy();

        logger.info(`File deleted successfully: ${req.params.id}`);
        res.status(204).send();
    } catch (error) {
        logger.error(`File deletion error: ${error.message}`);
        res.status(500).json({ error: 'File deletion failed' });
    }
};
