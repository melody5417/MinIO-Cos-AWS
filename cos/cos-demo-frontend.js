import axios from 'axios';
const COS = require('cos-js-sdk-v5');
const crypto = require('crypto');

const cosConfig = {
    Bucket: 'Bucket' /* Required */,
    Region: 'Region' /* Required */,
};

/**
 * Init cos client.
 */
const cosClient = new COS({
    getAuthorization: function (options, callback) {
        cosAuthorization()
            .then((res) => {
                if (res.errCode === 0 && res.data) {
                    var data = res.data;
                    var params = {
                        TmpSecretId: data.TmpSecretId,
                        TmpSecretKey: data.TmpSecretKey,
                        XCosSecurityToken: data.XCosSecurityToken,
                        ExpiredTime: data.ExpiredTime, // SDK 在 ExpiredTime 时间前，不会再次调用 getAuthorization
                    };
                    callback(params);
                }
            })
            .catch((err) => {
                console.log(err);
            });
    },
});

/**
 * Get temp cos authorization from backend.
 * 
 * @returns Promise 
 */
const cosAuthorization = function () {
    return axios.get({
        url: '/api/getCosAuthorization',
    });
}

/**
 * 
 * @param {String} filename 
 * @returns File key
 */
const getCosKey = function (filename) {
    const md5 = crypto.createHash('md5').update(Date.now().toString()).digest('hex');
    return md5;
};

/**
 * 
 * @param {File} file 
 * @returns Promise
 */
export function putObject(file) {
    return new Promise((resolve, reject) => {
        if (!file) {
            reject(Error('file is invalid'));
        }

        const key = getCosKey(file.name);
        cos.putObject(
            {
                Bucket: cosConfig.Bucket,
                Region: cosConfig.Region,
                Key: key,
                StorageClass: 'STANDARD',
                Body: file,
            },
            function (err, data) {
                if (err) {
                    reject(err);
                } else {
                    data.key = key;
                    resolve(data);
                }
            },
        );
    });
}

/**
 * 
 * @param {String} key 
 * @returns 
 */
export function getObject(key) {
    return new Promise((resolve, reject) => {
        if (!key) {
            reject(Error('key is invalid'));
        }
        cos.getObject(
            {
                Bucket: cosConfig.Bucket,
                Region: cosConfig.Region,
                Key: key,
            },
            function (err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            },
        );
    });
}

/**
 * 
 * @param {String} key 
 * @returns 
 */
export function getObjectUrl(key) {
    return new Promise((resolve, reject) => {
        if (!key) {
            reject(Error('key is invalid'));
        }
        cos.getObjectUrl(
            {
                Bucket: cosConfig.Bucket,
                Region: cosConfig.Region,
                Key: key,
            },
            function (err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data.Url);
                }
            },
        );
    });
}
