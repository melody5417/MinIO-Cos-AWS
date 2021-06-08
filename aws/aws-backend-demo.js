const AWS = require('aws-sdk');

const config = {
  storage: 'minio', // minio or cos
  minio: {
    accessKeyId: 'minioadmin',
    secretAccessKey: 'minioadmin',
    endpoint: 'http://127.0.0.1:9000',
    bucket: 'miniobucket',
    expireTime: 60 * 60 * 2,
  },
  cos: {
    secretId: 'SecretId',
    secretKey: 'SecretKey',
    endpoint: 'endpoint',
    region: 'Region',
    bucket: 'cosbucket',
    expireTime: 60 * 60 * 2,
  }
}

let s3Client;
let bucket;
let expireTime;

if (config.storage === 'minio') {
  s3Client = new AWS.S3({
    accessKeyId: config.minio.accessKeyId,
    secretAccessKey: config.minio.secretAccessKey,
    endpoint: config.minio.endpoint,
    s3ForcePathStyle: true, // needed with minio?
    signatureVersion: 'v4',
  });
  bucket = config.minio.bucket;
  expireTime = config.minio.expireTime;
} else {
  s3Client = new AWS.S3({
    accessKeyId: config.cos.secretId,
    secretAccessKey: config.cos.secretKey,
    endpoint: config.cos.endpoint,
    s3ForcePathStyle: true, // needed with minio?
    signatureVersion: 'v4',
    sslEnabled: true
  });
  bucket = config.cos.bucket;
  expireTime = config.cos.expireTime;
}

/**
 * 
 * @param {Object} req
 * @param {String} operation 
 * @param {String} fileKey 
 * @returns 
 */
async function getPresignedUrl(req) {
  try {
    const { fileKey, operation } = req;
    let params = {
      Bucket: bucket,
      Key: fileKey,
      Expires: expired
    };
    if (operation.indexOf('put') >= 0) {
      params["ContentType"] = "application/octet-stream";
    }
    const presignedURL = await s3Client.getSignedUrlPromise(operation, params);
    let resourceURL;
    if (config.storage === 'minio') {
      resourceURL = `${minio.minio.endpoint}${config.minio.bucket}/${req.fileKey}`
    } else {
      resourceURL = `https://${config.cos.endpoint}/${config.cos.bucket}/${req.fileKey}`;
    }
    return {
      errCode: 0,
      errMsg: '',
      data: { presignedURL, resourceURL }
    };
  } catch (error) {
    return {
      errCode: 1000,
      errMsg: `getPresignedUrl fail ${error}`,
      data: {}
    }
  }
}

module.exports = {
  getPresignedUrl
}