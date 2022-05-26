"use strict";

const AWSXRay = require("aws-xray-sdk");

exports.reverse = (s) => {
  return s.trim().split("").reverse().join("");
};

exports.createS3UploadParams = (bucketname, data) => {
  // The synctoken is unix epoch time, using a regex is faster than parsing JSON :)
  const [, regexToken] = data.match(/"?syncToken"?:\s?"(\d+)"/);
  return {
    Bucket: bucketname,
    Key: `${exports.reverse(regexToken)}-ipranges.json`,
    Body: data,
  };
};

exports.handler = (event, context, callback) => {
  const runningInAWSLambda = context && context.functionName;
  const https = runningInAWSLambda
    ? AWSXRay.captureHTTPs(require("https"))
    : require("https");
  const AWS = runningInAWSLambda
    ? AWSXRay.captureAWS(require("aws-sdk"))
    : require("aws-sdk");
  const s3 = new AWS.S3();

  let message = event.Records[0].Sns.Message;
  const { S3Bucket } = process.env;
  if (!S3Bucket) {
    callback(new Error("S3Bucket is not set"));
    return;
  }
  if (typeof message === "string") {
    message = JSON.parse(message);
  }
  const url = message.url || "https://ip-ranges.amazonaws.com/ip-ranges.json";
  console.log("Going to fetch " + url);
  const options = new URL(url);
  https.get(options, function (res) {
    res.setEncoding("utf8");
    let rawData = "";
    res.on("data", (chunk) => {
      rawData += chunk;
    });
    res.on("end", () => {
      const params = exports.createS3UploadParams(S3Bucket, rawData);
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
