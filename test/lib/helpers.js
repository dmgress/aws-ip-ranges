exports.createValidEvent = (url) => {
  return {
    Records: [
      {
        Sns: {
          Message: JSON.stringify({
            url: url || "https://ip-ranges.amazonaws/ip-ranges.json",
          }),
        },
      },
    ],
  };
};

exports.ip_ranges_example = JSON.stringify({
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

exports.httpIncomingMessage = {
  on: (keyword, callback) => {
    switch (keyword) {
      case "data":
        this.onData = callback;
        break;
      case "end":
        this.onData(exports.ip_ranges_example);
        callback();
        break;

      default:
        break;
    }
  },
  setEncoding: jest.fn(),
  statusCode: "mocked",
};

exports.mockedHttpsGet = () => {
  return jest.fn().mockImplementation((uri, callback) => {
    if (callback) {
      callback(exports.httpIncomingMessage);
    }
  });
};

exports.mockS3Client = class {
  constructor() {
    this.expectedError = null;
    this.send = jest.fn().mockImplementation(async (command) => {
      if (this.expectedError) {
        throw this.expectedError;
      }
    });
  }
};
