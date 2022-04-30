# AWS IP ranges processing

The template provisions a working stack to store the AWS IP ranges JSON file in a S3 bucket using AWS Lambda.

## How to deploy

## How to test

To verify or check errors in cross-account SNS notifications you will need two AWS accounts. The basics for how to set up cross-account notifications are described in the AWS Lambda developer guide example "[Using AWS Lambda with Amazon SNS from Different Accounts](http://docs.aws.amazon.com/lambda/latest/dg/with-sns-create-x-account-permissions.html)".

In addition to those steps you need to enable delivery status on the topic. Delivery status is sent to AWS Logs in log groups with the name `sns/[REGION]/[AWS ACCOUNT ID]/[TOPIC NAME]` for success and `sns/[REGION]/[AWS ACCOUNT ID]/[TOPIC NAME]` for failure.

## TODO

- Create AWS CloudFormation template to deploy stack with SNS topic to work on cross-account notification issues
