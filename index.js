'use strict';

let AWSXRay = require('aws-xray-sdk');
let url_lib = require('url');
let https = AWSXRay.captureHTTPs(require('https'));
let AWS = AWSXRay.captureAWS(require('aws-sdk'));
let s3 = new AWS.S3();

exports.reverse = (s) => {
  var o = '';

  for (var i = s.length - 1; i >= 0; i--)
    o += s[i];

  return o;
};

exports.createS3UploadParams = (bucketname, data) => {
  // The synctoken is unix epoch time, using a regex is faster than parsing JSON :)
  let regexToken = data.match(/syncToken[^0-9]+([0-9]+)/)[1];
  return {
    "Bucket": bucketname,
    "Key": `${exports.reverse(regexToken)}-ipranges.json`,
    "Body": data
  };
}

exports.handler = (event, context, callback) => {
  let message = event.Records[0].Sns.Message;
  if (typeof message === 'string') {
    message = JSON.parse(message);
  }
  let url = message.url || "https://ip-ranges.amazonaws.com/ip-ranges.json";
  console.log('Going to fetch ' + url);
  let options = url_lib.parse(url);
  https.get(options, function (res) {
    res.setEncoding('utf8');
    var rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
      console.log(rawData);
      var params = createS3UploadParams(process.env.S3Bucket, rawData);
      s3.upload(params, function (err, data) {
        if (err) {
          callback(err, err.stack); // an error occurred
        } else {
          callback(null, "success"); // successful response
        }
      });
    });
  });
};