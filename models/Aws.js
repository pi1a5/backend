/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
const AWS = require('aws-sdk');

class Aws {
  async uploadFile(file, sub) {
    try {
      const FILE_KEY = `${sub}/${new Date().getTime()}${file.name}`;

      const params = {
        Bucket: process.env.AWS_BUCKET,
        Key: FILE_KEY,
        Body: file.data,
        ACL: 'public-read',
      };

      const bucket = await this.getS3Bucket();

      if (bucket) {
        await bucket.upload(params).promise();
        return `https://pi1a5.s3.sa-east-1.amazonaws.com/${FILE_KEY}`;
      }
      return false;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async deleteFile(file, sub) {
    try {
      console.log("arquiv", file)
      const params = {
        Bucket: process.env.AWS_BUCKET,
        Key: file,
      };

      const bucket = await this.getS3Bucket();

      if (bucket) {
        await bucket.deleteObject(params).promise();
        return { response: 'Arquivo deleteado com sucesso!', status: 200 };
      } else {
        return { response: 'Erro ao deletar arquivo', status: 400 };
      }
    } catch (error) {
      console.log(error);
      return { response: 'Erro ao deletar arquivo', status: 400 };
    }
  }

  async getS3Bucket() {
    try {
      const bucket = new AWS.S3(
        {
          accessKeyId: process.env.ACCESS_KEY_ID,
          secretAccessKey: process.env.SECRET_ACCESS_KEY,
          region: process.env.REGION,
        },
      );
      return bucket;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}

module.exports = new Aws();
