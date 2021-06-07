[TOC]
# MinIO-Cos-AWS

# 背景

最近项目在做私有化交付，涉及到兼容 cos 和 minIO 两种存储方案，这里做下总结。

项目大致分为**私有化**和**公有云**两个版本，其中私有化版本存储方案采用 **minIO**，公有云版本存储方案为 **cos**。为了兼容这两套存储方案，同时避免引入多分支开发，调研兼容方案——**AWS（Amazon Web Services）**。无论是 minIO 还是 cos 都遵循 AWS 协议，这样就可以一套代码同时兼容 minIO 和 cos 。

# 大纲

* 分别介绍 minIO， cos 和 AWS。
* 实现 minIO 和 cos 的 demo
* 基于 AWS 接入 minIO 和 cos 的 demo。
* 基于安全和前后端分离考虑，实现多个文件上传的 demo。

# minIO
## 参考文档
* [Minio Cookbook 中文版](https://www.bookstack.cn/books/MinioCookbookZH)
* [minio Github](https://github.com/minio/minio)

## windows部署
* 下载[minio客户端](https://dl.min.io/server/minio/release/windows-amd64/minio.exe)
* 运行命令在当前目录部署minio环境--store
```
$ ./minio.exe server store
IAM initialization complete
Endpoint: http://10.76.159.70:9000  http://169.254.199.21:9000  http://192.168.255.10:9000  http://192.168.116.1:9000  http://192.168.152.1:9000  http://127.0.0.1:9000
RootUser: minioadmin 
RootPass: minioadmin 

Browser Access:
   http://10.76.159.70:9000  http://169.254.199.21:9000  http://192.168.255.10:9000  http://192.168.116.1:9000  http://192.168.152.1:9000  http://127.0.0.1:9000

...
```
* 在浏览器打开验证

在上一步运行部署命令时，控制台输出了浏览器访问的地址和默认用户名密码，在浏览器登录验证即可。


## Demo开发


* 安装npm依赖
```
$ npm i minio --save
```
* minio初始化
```
const Minio = require('minio')

const minioClient = new Minio.Client({
    endPoint: '10.76.159.70',
    port: 9000,
    useSSL: false,  // false: use http; true:use https
    accessKey: 'minioadmin',
    secretKey: 'minioadmin'
});
```

* 文件上传和下载
```
const myBucket = 'bucket';
const file = 'file-to-upload.jpg';

// upload file
(function() {
    var metaData = {
        'Content-Type': 'application/octet-stream',
    }
    minioClient.fPutObject(myBucket, file, file, metaData, function (err, etag) {
        if (err) return console.log(err);
        console.log(`Upload file ${file} successfully`);
    });
})();

// download file
(function () {
    minioClient.fGetObject(myBucket, file, `downloaded-${file}`, function (err) {
        if (err) return console.log(err);
        console.log(`Download file ${file} successfully`);
    })
})();

```
全部的demo可以查看minio-demo.js文件，也可以查看[官方的API和demo](https://docs.min.io/docs/javascript-client-quickstart-guide.html)。

    注意：运行demo时确保minio服务运行。

# COS
cos用的是腾讯云的服务，Demo也是使用的腾讯云的js sdk。
## 参考文档
[腾讯云cos](https://cloud.tencent.com/document/product/436/6240)
关于注册购买和使用直接看官网文档比较全面，这里不赘诉。

## Demo开发

* 安装npm依赖
```
npm install cos-js-sdk-v5 --save
```

* cos初始化

之前 minio 的 demo 是本地部署，没有考虑安全问题，比如用户名和密码不应该放到前端，需要提供鉴权机制等。腾讯云cos是收费服务，鉴权是必不可少的步骤。查看官方 demo: node_modules/cos-js-sdk-v5/test/test.js 推荐的初始化方法是**后端通过获取临时密钥给到前端**，demo 就按照这个思路实现。

```
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
```

全部的demo可以查看cos-demo.js文件，也可以查看官方的demo：node_modules/cos-js-sdk-v5/test/test.js。



