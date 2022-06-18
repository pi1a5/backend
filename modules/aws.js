// const { LexModelBuildingService } = require('aws-sdk');
// var AWS = require('aws-sdk');

// class aws{
//     getS3Bucket() {
//         const bucket = new S3(
//           {
//             accessKeyId: environment.ACCESS_KEY_ID,
//             secretAccessKey: environment.SECRET_ACCESS_KEY,
//             region: environment.REGION
//           }
//         );

//         return bucket;
//       }

//       async uploadFile(file) {
//         var KEY = `${this.FOLDER}/${new Date().getTime()}${file.name}`

//         const params = {
//           Bucket: this.BUCKET,
//           Key: KEY,
//           Body: file,
//           ACL: 'public-read'
//         };

//         try {
//           const stored = await this.getS3Bucket().upload(params).promise();
//           // console.log(stored);
//           return KEY;
//         } catch (error) {
//           console.log(error);
//           return false;
//         }

//       }

//     // `https://s3-sa-east-1.amazonaws.com/pi1a5/${KEY}`  retorno do upload file é o key
// }

// module.exports = aws
