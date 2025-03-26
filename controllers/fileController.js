const File = require('../models/File');
const s3 = require('../config/s3Config');
const logger = require('../config/logger');
const statsd = require('../config/metrics');
const { v4: uuidv4 } = require('uuid');

exports.uploadFile = async (req, res) => {
  const start = Date.now();
  statsd.increment('file_upload.attempted');

  try {
    if (!req.file) {
      statsd.increment('file_upload.failed');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileId = uuidv4();
    const fileName = req.file.originalname;
    const bucketKey = `user-uploads/${fileId}-${fileName}`;

    const s3Start = Date.now();
    const s3Response = await s3.upload({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: bucketKey,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      Metadata: { originalName: fileName, fileId: fileId }
    }).promise();
    statsd.timing('s3.upload_time', Date.now() - s3Start);

    const dbStart = Date.now();
    const file = await File.create({
      id: fileId,
      file_name: fileName,
      url: s3Response.Location,
      s3_key: bucketKey,
      upload_date: new Date().toISOString().split('T')[0]
    });
    statsd.timing('db.query_time.upload_file', Date.now() - dbStart);

    statsd.increment('file_upload.success');
    statsd.timing('api_request_time.upload_file', Date.now() - start);
    logger.info(`File uploaded successfully: ${fileId}`);

    return res.status(201).json({
      file_name: file.file_name,
      id: file.id,
      url: file.url,
      upload_date: file.upload_date
    });

  } catch (error) {
    statsd.increment('file_upload.failed');
    logger.error(`File upload error: ${error.message}`);
    return res.status(400).json({ error: 'Bad Request' });
  }
};

exports.getFile = async (req, res) => {
  const start = Date.now();
  statsd.increment('file_get.attempted');

  try {
    const dbStart = Date.now();
    const file = await File.findByPk(req.params.id);
    statsd.timing('db.query_time.get_file', Date.now() - dbStart);

    if (!file) {
      statsd.increment('file_get.failed');
      return res.status(404).json({ error: 'File not found' });
    }

    statsd.increment('file_get.success');
    statsd.timing('api_request_time.get_file', Date.now() - start);
    logger.info(`File metadata retrieved: ${req.params.id}`);

    return res.status(200).json({
      file_name: file.file_name,
      id: file.id,
      url: file.url,
      upload_date: file.upload_date
    });

  } catch (error) {
    statsd.increment('file_get.failed');
    logger.error(`File retrieval error: ${error.message}`);
    return res.status(404).json({ error: 'File not found' });
  }
};

exports.deleteFile = async (req, res) => {
  const start = Date.now();
  statsd.increment('file_delete.attempted');

  try {
    const dbStart = Date.now();
    const file = await File.findByPk(req.params.id);
    statsd.timing('db.query_time.find_file_delete', Date.now() - dbStart);

    if (!file) {
      statsd.increment('file_delete.failed');
      return res.status(404).json({ error: 'File not found' });
    }

    const key = file.s3_key || `user-uploads/${file.id}-${file.file_name}`;
    logger.info(`Attempting to delete S3 object: ${key}`);

    const s3Start = Date.now();
    await s3.deleteObject({ Bucket: process.env.S3_BUCKET_NAME, Key: key }).promise();
    statsd.timing('s3.delete_time', Date.now() - s3Start);

    await file.destroy();

    statsd.increment('file_delete.success');
    statsd.timing('api_request_time.delete_file', Date.now() - start);
    logger.info(`File deleted: ${req.params.id}`);
    return res.status(204).send();

  } catch (error) {
    statsd.increment('file_delete.failed');

    if (error.code === 'NoSuchKey') {
      logger.error(`S3 object not found: ${error.message}`);
      return res.status(404).json({ error: 'File not found in S3' });
    }

    if (error.code === 'AccessDenied') {
      logger.error(`Access denied to S3: ${error.message}`);
      return res.status(403).json({ error: 'Access denied to file storage' });
    }

    logger.error(`File deletion error: ${error.message}`);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Method not allowed / fallback handlers
exports.methodNotAllowed = (req, res) => {
  res.status(405).json({ error: 'Method Not Allowed' });
};

exports.badRequest = (req, res) => {
  res.status(400).json({ error: 'Bad Request' });
};
