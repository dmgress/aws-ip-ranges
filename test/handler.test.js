const { createS3UploadParams, handler } = require("../index");
const {
  createValidEvent,
  ip_ranges_example,
  mockedHttpsGet,
  mockS3Instance,
} = require("./lib/helpers");
const https = require("https");

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

const originalHttpsGet = https.get;

describe("Handler", () => {
  const {env} = process;
  let mockS3;

  beforeEach(() => {
    jest.resetModules();
    mockS3 = new mockS3Instance();
    jest.mock("aws-sdk", () => {
      return { S3: jest.fn(() => mockS3) };
    });
    process.env = { ...env };
    process.env.S3Bucket = "s3://mymock.bucket";
    https.get = mockedHttpsGet();
  });
  afterEach(() => {
    https.get = originalHttpsGet;
    process.env = env;
  });
  it("Gracefully fails when S3Bucket environment variable is not set", () => {
    delete process.env.S3Bucket;
    handler(createValidEvent(), null, (err) => {
      expect(err).toBeInstanceOf(Error);
    });

    expect(https.get.mock.calls).toHaveLength(0);
    expect(mockS3.upload.mock.calls).toHaveLength(0);
  });

  it("Picks up the url from the message", () => {
    const expectedUrl = new URL("http://ip-ranges.mock");
    handler(createValidEvent(expectedUrl), null, () => {});
    expect(https.get.mock.calls[0]).toStrictEqual(
      expect.arrayContaining([expectedUrl])
    );
  });

  it("Calls back with error when S3 upload fails", () => {
    mockS3.expectedError = {
      stack: "Calls back with error when S3 upload fails",
    };
    let gotError, gotMessage;
    handler(createValidEvent(), null, (err, message) => {
      gotError = err;
      gotMessage = message;
    });

    expect(gotError).toBe(mockS3.expectedError);
    expect(gotMessage).toBe(mockS3.expectedError.stack);
  });

  it("Calls back with success if S3 upload succeeds", () => {
    let gotError, gotMessage;

    handler(createValidEvent(), null, (err, message) => {
      gotError = err;
      gotMessage = message;
    });
    expect(gotError).toBeNull();
    expect(gotMessage).toBe("success");
  });
});
