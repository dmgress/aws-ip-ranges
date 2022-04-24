let createS3UploadParams = require("../index").createS3UploadParams;
let reverse = require("../index").reverse;
let assert = require("assert");

describe("Reverse", function () {
  const tests = [
    { word: "abc", expected: "cba" }
  ];

  tests.forEach(({ word, expected }) => {
    it(`reverses ${word} correctly`, function () {
      assert.equal(reverse(word), expected);
    });
  });
});

describe("CreateS3UploadParams", function () {
  let ip_ranges_example = {
    syncToken: "0123456789",
    createDate: "yyyy-mm-dd-hh-mm-ss",
    prefixes: [
      {
        ip_prefix: "cidr",
        region: "region",
        network_border_group: "network_border_group",
        service: "subset",
      }
    ],
    ipv6_prefixes: [
      {
        ipv6_prefix: "cidr",
        region: "region",
        network_border_group: "network_border_group",
        service: "subset",
      }
    ],
  };
  const tests = [
    { data: "syncToken: A123", expectedKey: "321-ipranges.json" },
    { data: 'syncToken: "0607"', expectedKey: "7060-ipranges.json" },
    { data: JSON.stringify(ip_ranges_example), expectedKey: "9876543210-ipranges.json" }
  ]
  tests.forEach(({ data, expectedKey }) => {
    it(`Creates correct object key for the data`, function () {
      let actual = createS3UploadParams("testbucket", data);
      assert.equal(actual.Key, expectedKey);
    });
  });
});
