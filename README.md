# AWS IP ranges processing

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/899580259c7b47eba6085f174a6a7c39)](https://www.codacy.com/gh/dmgress/aws-ip-ranges/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=dmgress/aws-ip-ranges&amp;utm_campaign=Badge_Grade) [![Codacy Badge](https://app.codacy.com/project/badge/Coverage/899580259c7b47eba6085f174a6a7c39)](https://www.codacy.com/gh/dmgress/aws-ip-ranges/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=dmgress/aws-ip-ranges&amp;utm_campaign=Badge_Coverage)

The template provisions a working stack to store the AWS IP ranges JSON file in a S3 bucket using AWS Lambda.

## How to deploy

## How to test

To verify or check errors in cross-account SNS notifications you will need two AWS accounts. The basics for how to set up cross-account notifications are described in the AWS Lambda developer guide example "[Using AWS Lambda with Amazon SNS from Different Accounts](http://docs.aws.amazon.com/lambda/latest/dg/with-sns-create-x-account-permissions.html)".

In addition to those steps you need to enable delivery status on the topic. Delivery status is sent to AWS Logs in log groups with the name `sns/[REGION]/[AWS ACCOUNT ID]/[TOPIC NAME]` for success and `sns/[REGION]/[AWS ACCOUNT ID]/[TOPIC NAME]` for failure.

