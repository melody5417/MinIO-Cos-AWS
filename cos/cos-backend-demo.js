const STS = require('qcloud-cos-sts');

const config = {
    secretId: 'SecretId',
    secretKey: 'SecretKey',
    region: 'Region',
    expireTime: 60 * 60 * 2,
}

const policy = {
  version: '2.0',
  statement: [{
    action: [
      // Refs https://cloud.tencent.com/document/product/436/31923
      'name/cos:PutObject',
      'name/cos:GetObject',
      'name/cos:GetObjectUrl',
    ],
    effect: 'allow',
    resource: [
      '*',
    ],
  }],
};

async function getCosAuthorization() {
  return new Promise((resolve) => {
    STS.getCredential({
      secretId: config.secretId,
      secretKey: config.secretKey,
      policy,
      durationSeconds: config.expireTime,
      proxy: '',
      region: config.region,
    }, (err, data) => {
      if (err) {
        return resolve({
          code: -1000,
          errMsg: `Get cos authorization fail ${err}`,
        });
      }
      const { credentials, expiredTime } = data;
      const result = {
        code: 0,
        errMsg: '',
        data: {
          TmpSecretId: credentials.tmpSecretId,
          TmpSecretKey: credentials.tmpSecretKey,
          XCosSecurityToken: credentials.sessionToken,
          ExpiredTime: expiredTime,
        },
      };
      return resolve(result);
    });
  });
}

module.exports = {
  getCosAuthorization,
};
