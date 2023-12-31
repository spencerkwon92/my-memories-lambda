const AWS = require('aws-sdk');
const sharp = require('sharp');

const s3 = new AWS.S3();

// 왜 인텍스는 깃에 푸수ㅣ 안하지???
exports.postLambdaHandler = async (event, context, callback) => {
  const Bucket = event.Records[0].s3.bucket.name;
  const Key = decodeURIComponent(event.Records[0].s3.object.key);
  const filename = Key.split('/')[Key.split('/').length - 1];
  const ext = Key.split('.')[Key.split('.').length - 1].toLowerCase();
  const requiredFormat = (ext === 'jpg') ? 'jpeg' : ext;

  try{
    const s3Object = await s3.getObject({ Bucket, Key}).promise();
    console.log('fileSize', s3Object.Body.length);
    const resizedImage = await sharp(s3Object.Body)
      .resize(500, 500, {fit: 'inside'})
      .toFormat(requiredFormat)
      .toBuffer();
    await s3.putObject({
      Bucket,
      Key: `resizedPostImages/${filename}`,
      Body: resizedImage,
    }).promise();
    console.log('put',resizedImage.length);
    return callback( null, `resizedPostImages/${filename}`);
  }catch(err){
    console.error(err);
    return callback(err);
  }
};

exports.userLambdaHandler = async (event, context, callback) => {
  const Bucket = event.Records[0].s3.bucket.name;
  const Key = decodeURIComponent(event.Records[0].s3.object.key);
  const filename = Key.split("/")[Key.split("/").length - 1];
  const ext = Key.split(".")[Key.split(".").length - 1].toLowerCase();
  const requiredFormat = ext === "jpg" ? "jpeg" : ext;

  try {
    const s3Object = await s3.getObject({ Bucket, Key }).promise();
    console.log("fileSize", s3Object.Body.length);
    const resizedImage = await sharp(s3Object.Body)
      .resize(500, 500, { fit: "inside" })
      .toFormat(requiredFormat)
      .toBuffer();
    await s3.putObject({
        Bucket,
        Key:`resizedUserImages/${filename}`,
        Body: resizedImage,
      })
      .promise();
    console.log("put", resizedImage.length);
    return callback(null, `resizedUserImages/${filename}`);
  } catch (err) {
    console.error(err);
    return callback(err);
  }
};