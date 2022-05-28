
var AWS = require('aws-sdk');
const fs = require('fs')

class Aws {
    async uploadFile(file, sub) {
        try {
            var FILE_KEY = `${sub}/${new Date().getTime()}${file.name}`
        
            console.log(file)

            const params = {
                Bucket: process.env.AWS_BUCKET,
                Key: FILE_KEY,
                Body: file.data,
                ACL: 'public-read'
            };

            const bucket = await this.getS3Bucket()

            if (bucket){
                var result = await bucket.upload(params).promise()
                console.log("result form bucket " + JSON.stringify(result))
                return "https://pi1a5.s3.sa-east-1.amazonaws.com/" + FILE_KEY;
            } else{
               return false
            }
            // console.log(stored);
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    async getS3Bucket() {
        try {
            const bucket = new AWS.S3(
                {
                  accessKeyId: process.env.ACCESS_KEY_ID,
                  secretAccessKey: process.env.SECRET_ACCESS_KEY,
                  region: process.env.REGION
                }
              );
              return bucket;
        } catch (error) {
            console.log(error);
            return false;
        }

      }

}

module.exports = new Aws();