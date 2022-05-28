
var AWS = require('aws-sdk');

class Aws {
    async uploadFile(file, sub) {
        try {
            var FILE_KEY = `${sub}/${new Date().getTime()}${file.name}`
        
            const params = {
                Bucket: process.env.AWS_BUCKET,
                Key: FILE_KEY,
                Body: file,
                ACL: 'public-read'
            };

            const bucket = await this.getS3Bucket()

            if (bucket){
                const upload = bucket.upload(params)
                res.status(200).json(upload)
                return "https://pi1a5.s3.sa-east-1.amazonaws.com/" + KEY;
            } else{
                res.status(404).json("Erro ao encontrar Bucket");
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