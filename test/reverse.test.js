const { reverse } = require("../index");

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
