const AWS = require('aws-sdk');
const sharp = require('sharp');

const s3 = new AWS.S3();

// 왜 인텍스는 깃에 푸수ㅣ 안하지???
exports.postImageLambdaHandler = async (event, context, callback) => {
  const Bucket = event.Records[0].s3.bucket.name;
  const Key = decodeURIComponent(event.Records[0].s3.object.key);
  const prefix = Key.split('/')[0]; // postImages || userImages
  const filename = Key.split('/')[Key.split('/').length - 1];
  const ext = Key.split('.')[Key.split('.').length - 1].toLowerCase();
  const requiredFormat = (ext === 'jpg') ? 'jpeg' : ext;

  try{
    const s3Object = await s3.getObject({ Bucket, Key}).toPromise();
    console.log('fileSize', s3Object.Body.length);
    const resizedImage = await sharp(s3Object.Body)
      .resize(400, 400, {fit: 'inside'})
      .toFormat(requiredFormat)
      .toBuffer();
    await s3.putObject({
      Bucket,
      Key: (prefix === 'postImages') ? `resizedPostImages/${filename}`:`resizedUserProfileImages/${filename}`,
      Body: resizedImage,
    }).toPromise();
    console.log('put',resizedImage.length);
    return callback(
      null,
      (prefix === "postImages")
        ? `resizedPostImages/${filename}`
        : `resizedUserProfileImages/${filename}`
    );

  }catch(err){
    console.error(err);
    return callback(err);
  }
};