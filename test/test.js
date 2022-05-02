const { createS3UploadParams, reverse } = require("../index");

describe("Reverse", () => {
  it(`reverses abc correctly`, () => {
    expect(reverse("abc")).toBe("cba");
  });
  it("reverses abc and removes trailing spaces", () => {
    expect(reverse("abc ")).toBe("cba");
  });
  it("reverses abc and removes leading spaces", () => {
    expect(reverse(" abc")).toBe("cba");
  });
  it("reverses abc and keeps spaces between non-space characters", () => {
    expect(reverse("ab c")).toBe("c ba");
  });
});

const ip_ranges_example = JSON.stringify({
  syncToken: "0123456789",
  createDate: "yyyy-mm-dd-hh-mm-ss",
  prefixes: [
    {
      ip_prefix: "cidr",
      region: "region",
      network_border_group: "network_border_group",
      service: "subset",
    },
  ],
  ipv6_prefixes: [
    {
      ipv6_prefix: "cidr",
      region: "region",
      network_border_group: "network_border_group",
      service: "subset",
    },
  ],
});

describe("CreateS3UploadParams", () => {
  const tests = [
    { data: '"syncToken": "0123"', expectedKey: "3210-ipranges.json" },
    { data: 'syncToken: "0607"', expectedKey: "7060-ipranges.json" },
    {
      data: ip_ranges_example,
      expectedKey: "9876543210-ipranges.json",
    },
  ];

  tests.forEach(({ data, expectedKey }) => {
    it(`Creates correct object key for the data`, () => {
      const actual = createS3UploadParams("testbucket", data);
      expect(actual.Key).toBe(expectedKey);
    });
  });
});
