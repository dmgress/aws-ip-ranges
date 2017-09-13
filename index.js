'use strict';

let AWSXRay = require('aws-xray-sdk');
let https = AWSXRay.captureHTTPs(require('https'));
let AWS = AWSXRay.captureAWS(require('aws-sdk'));
let s3 = new AWS.S3();

exports.handler = (event, context, callback) => {
  let message = event.Records[0].Sns.Message;
  if (typeof message === 'string') {
    message = JSON.parse(message);
  }
  let url = message.url || "https://ip-ranges.amazonaws.com/ip-ranges.json";
  console.log('Going to fetch ' + url);
  https.get(url, function (res) {
    res.setEncoding('utf8');
    var rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
      let parsedData = JSON.parse(rawData);
      console.log(parsedData);
      var params = {
        "Bucket": process.env.S3Bucket,
        "Key": `ipranges-${parsedData.syncToken}.json`,
        "Body": rawData
      };
      s3.putObject(params, function(err, data) {
        if (err) {
          callback(err, err.stack); // an error occurred
        } else {
          callback(null,"success"); // successful response
        }
      });
    });
  });
}