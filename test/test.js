const { createS3UploadParams, reverse } = require("../index");
const assert = require("assert");

describe("Reverse", function () {
  it(`reverses abc correctly`, function () {
    assert.equal(reverse("abc"), "cba");
  });
  it("reverses abc and removes trailing spaces", function () {
    assert.equal(reverse("abc "), "cba");
  });
  it("reverses abc and removes leading spaces", function () {
    assert.equal(reverse(" abc"), "cba");
  });
  it("reverses abc and keeps spaces between non-space characters", function () {
    assert.equal(reverse("ab c"), "c ba");
  });
});

describe("CreateS3UploadParams", function () {
  const ip_ranges_example = {
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
    {
      data: JSON.stringify(ip_ranges_example),
      expectedKey: "9876543210-ipranges.json",
    }
  ];

  tests.forEach(({ data, expectedKey }) => {
    it(`Creates correct object key for the data`, function () {
      const actual = createS3UploadParams("testbucket", data);
      assert.equal(actual.Key, expectedKey);
    });
  });
});
