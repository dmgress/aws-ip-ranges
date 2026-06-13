"use strict";

const AWSXRay = require("aws-xray-sdk");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

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
  
  let s3Client = new S3Client({});
  if (runningInAWSLambda) {
    s3Client = AWSXRay.captureAWSClient(s3Client);
  }

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
    res.on("end", async () => {
      const params = exports.createS3UploadParams(S3Bucket, rawData);
      try {
        const command = new PutObjectCommand(params);
        await s3Client.send(command);
        callback(null, "success");
      } catch (err) {
        callback(err, err.stack);
      }
    });
  });
};
