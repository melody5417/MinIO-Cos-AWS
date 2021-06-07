const Minio = require('minio')

// Instantiate the minio client with the endpoint
// and access keys as shown below.
const minioClient = new Minio.Client({
    endPoint: '10.76.159.70',
    port: 9000,
    useSSL: false,  // false: use http; true:use https
    accessKey: 'minioadmin',
    secretKey: 'minioadmin'
});

const myBucket = 'bucket';
const file = 'file-to-upload.jpg';

// create bucket
(function() {
    minioClient.makeBucket(myBucket, function (err) {
        if (err) return console.log(err);
        console.log(`Make bucket ${myBucket} successfully`);
    });
})();

// check bucket exists
(function() {
    minioClient.bucketExists(myBucket, function (err, exists) {
        if (err) return console.log(err);
        console.log(`check bucket exists ${exists}`);
    });
})();

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





