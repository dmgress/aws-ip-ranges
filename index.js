'use strict';

const AWSXRay = require('aws-xray-sdk');
const urllib = require('url');
const https = AWSXRay.captureHTTPs(require('https'));
const AWS = AWSXRay.captureAWS(require('aws-sdk'));
const s3 = new AWS.S3();

exports.reverse = (s) => {
  return s.trim().split("").reverse().join("");
};

exports.createS3UploadParams = (bucketname, data) => {
  // The synctoken is unix epoch time, using a regex is faster than parsing JSON :)
  const [, regexToken] = data.match(/syncToken\D+(\d+)/);
  return {
    Bucket: bucketname,
    Key: `${exports.reverse(regexToken)}-ipranges.json`,
    Body: data,
  };
};

exports.handler = (event, context, callback) => {
  let message = event.Records[0].Sns.Message;
  if (typeof message === 'string') {
    message = JSON.parse(message);
  }
  const url = message.url || "https://ip-ranges.amazonaws.com/ip-ranges.json";
  console.log('Going to fetch ' + url);
  const options = urllib.parse(url);
  https.get(options, function (res) {
    res.setEncoding('utf8');
    let rawData = "";
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
      console.log(rawData);
      const params = exports.createS3UploadParams(process.env.S3Bucket, rawData);
      s3.upload(params, function (err) {
        if (err) {
          callback(err, err.stack); // an error occurred
        } else {
          callback(null, "success"); // successful response
        }
      });
    });
  });
};
