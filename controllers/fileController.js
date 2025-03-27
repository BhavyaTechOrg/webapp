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
      logger.warn('Upload attempt failed: No file was provided in the request.');
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
    logger.info(`File uploaded successfully to S3 and recorded in DB. File ID: ${fileId}, Key: ${bucketKey}`);

    return res.status(201).json({
      file_name: file.file_name,
      id: file.id,
      url: file.url,
      upload_date: file.upload_date
    });

  } catch (error) {
    statsd.increment('file_upload.failed');
    logger.error(`File upload failed due to server error: ${error.message}`);
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
      logger.warn(`File retrieval failed: No file found with ID ${req.params.id}`);
      return res.status(404).json({ error: 'File not found' });
    }

    statsd.increment('file_get.success');
    statsd.timing('api_request_time.get_file', Date.now() - start);
    logger.info(`File metadata successfully retrieved for ID: ${req.params.id}`);

    return res.status(200).json({
      file_name: file.file_name,
      id: file.id,
      url: file.url,
      upload_date: file.upload_date
    });

  } catch (error) {
    statsd.increment('file_get.failed');
    logger.error(`Error retrieving file metadata: ${error.message}`);
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
      logger.warn(`Deletion failed: File not found in DB for ID ${req.params.id}`);
      return res.status(404).json({ error: 'File not found' });
    }

    const key = file.s3_key || `user-uploads/${file.id}-${file.file_name}`;
    logger.info(`Initiating deletion of file from S3 with key: ${key}`);

    const s3Start = Date.now();
    await s3.deleteObject({ Bucket: process.env.S3_BUCKET_NAME, Key: key }).promise();
    statsd.timing('s3.delete_time', Date.now() - s3Start);

    await file.destroy();

    statsd.increment('file_delete.success');
    statsd.timing('api_request_time.delete_file', Date.now() - start);
    logger.info(`File deleted from S3 and removed from DB. File ID: ${req.params.id}`);
    return res.status(204).send();

  } catch (error) {
    statsd.increment('file_delete.failed');

    if (error.code === 'NoSuchKey') {
      logger.error(`S3 deletion failed: Object not found - ${error.message}`);
      return res.status(404).json({ error: 'File not found in S3' });
    }

    if (error.code === 'AccessDenied') {
      logger.error(`S3 deletion failed: Access denied - ${error.message}`);
      return res.status(403).json({ error: 'Access denied to file storage' });
    }

    logger.error(`File deletion encountered an unexpected error: ${error.message}`);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Method not allowed / fallback handlers
exports.methodNotAllowed = (req, res) => {
  statsd.increment("api.method_not_allowed");  // Metrics for unsupported methods
  logger.warn(`Method not allowed for route: ${req.originalUrl}`);
  res.status(405).json({ error: 'Method Not Allowed' });
};

exports.badRequest = (req, res) => {
  statsd.increment("api.bad_request");  // Metrics for bad requests
  logger.warn(`Bad request received on route: ${req.originalUrl}`);
  res.status(400).json({ error: 'Bad Request' });
};
