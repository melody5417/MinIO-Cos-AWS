const crypto = require('crypto');
import axios from 'axios';
const uuidV4 = require('uuid/v4');

/**
 *
 * @param {String} operation
 * @param {String} key
 * @returns
 */
const getPresignedUrl = function(operation, key) {
  const data = {
    requestId: uuidV4(),
    operation: operation,
    fileKey: key,
  };
  return axios.post({
    url: '/api/getPresignedUrl',
    data,
  }).then((rsp) => {
    if (rsp.errCode === 0) {
      return Promise.resolve(rsp.data);
    } else {
      return Promise.reject(`${rsp.errCode}: ${rsp.errMsg}`);
    }
  });
};

const checkUrl = function(url) {
  if (!url || typeof url !== 'string' || url.length < 1) {
    return false;
  }
  return true;
};

/**
 * 图片类型 配置：公有读 私有写
 * 其余类型 配置：私有读 私有写
 *
 * @param {File} file required
 * @returns
 */
export const getKey = function(file) {
  if (!file) {
    throw new Error('getKey params are invalid');
  }

  let prefix = 'XX';
  if (file.type.includes('image')) {
    prefix += '/public-read';
  } else {
    prefix += '/private-read';
  }
  const ext = file.name.split('.').pop();
  const md5 = crypto.createHash('md5').update(`${file.name} ${Date.now().toString()}`).digest('hex');
  return `${prefix}/${md5}.${ext}`;
};

/**
 *
 * @param {String} key required
 */
export function getObjecURL(key) {
  return new Promise(async(resolve, reject) => {
    try {
      if (!key || typeof key !== 'string' || key.length < 1) {
        throw new Error('getObjecURL params: key is invalid');
      }

      const { presignedURL, resourceURL } = await getPresignedUrl('getObject', key);
      if (!checkUrl(presignedURL) || !checkUrl(resourceURL)) {
        throw new Error('getPresignedUrl error');
      }
      resolve({ presignedURL });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 *
 * @param {File} file required
 * @param {Function} progressCallback optional
 * @param {Function} cancelTokenCallback optional
 * @returns
 */
export function uploadFile(file, progressCallback, cancelTokenCallback) {
  return new Promise(async(resolve, reject) => {
    try {
      if (!file) {
        throw new Error('uploadFile params: filename is invalid');
      }

      const key = getKey(file);
      const result = await uploadFileWithKey(key, file, progressCallback, cancelTokenCallback);
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 *
 * @param {String} key required
 * @param {File} file required
 * @param {Function} progressCallback optional
 * @param {Function} cancelTokenCallback optional
 * @returns
 */
export function uploadFileWithKey(key, file, progressCallback, cancelTokenCallback) {
  return new Promise(async(resolve, reject) => {
    try {
      if (!key || !file) {
        throw new Error('uploadFileWithKey params: key or file is invalid');
      }

      if (progressCallback && typeof progressCallback !== 'function') {
        throw new TypeError('progressCallback must be a function.');
      }

      if (cancelTokenCallback && typeof cancelTokenCallback !== 'function') {
        throw new TypeError('cancelTokenCallback must be a function');
      }

      const { presignedURL, resourceURL } = await getPresignedUrl('putObject', key);
      if (!checkUrl(presignedURL) || !checkUrl(resourceURL)) {
        throw new Error('getPresignedUrl error');
      }

      const CancelToken = axios.CancelToken;
      const source = CancelToken.source();
      if (cancelTokenCallback) {
        cancelTokenCallback(source);
      }

      const config = {
        headers: { 'Content-Type': file.type },
        onUploadProgress: (event) => {
          const progress = event.loaded / event.total;
          if (progressCallback) {
            progressCallback(progress);
          }
        },
        cancelToken: source.token,
      };
      await axios.put(presignedURL, file, config);
      resolve({ resourceURL, resourceKey: key });
    } catch (error) {
      if (axios.isCancel(error)) {
      } else {
        reject(error);
      }
    }
  });
}
