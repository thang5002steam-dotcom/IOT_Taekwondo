import { formatNumberWithCommas, formatVnd, parseRawNumber } from "./currency";

describe("currency utilities", () => {
  describe("formatVnd", () => {
    it("formats amounts in VND", () => {
      expect(formatVnd(0)).toMatch(/0.*đ/);
      expect(formatVnd(1200000)).toMatch(/1.*200.*000.*đ/);
    });

    it("handles null or undefined gracefully", () => {
      expect(formatVnd(null)).toBe("0đ");
      expect(formatVnd(undefined)).toBe("0đ");
    });
  });

  describe("formatNumberWithCommas", () => {
    it("formats plain numeric strings with commas every 3 digits", () => {
      expect(formatNumberWithCommas("1000")).toBe("1,000");
      expect(formatNumberWithCommas("1200000")).toBe("1,200,000");
      expect(formatNumberWithCommas("50000")).toBe("50,000");
      expect(formatNumberWithCommas("123")).toBe("123");
    });

    it("handles numbers as input", () => {
      expect(formatNumberWithCommas(1500000)).toBe("1,500,000");
    });

    it("strips non-digits when formatting", () => {
      expect(formatNumberWithCommas("1,200,000")).toBe("1,200,000");
      expect(formatNumberWithCommas("abc1200xyz")).toBe("1,200");
    });

    it("handles leading zeros and empty inputs", () => {
      expect(formatNumberWithCommas("")).toBe("");
      expect(formatNumberWithCommas(null)).toBe("");
      expect(formatNumberWithCommas(undefined)).toBe("");
      expect(formatNumberWithCommas("0")).toBe("0");
      expect(formatNumberWithCommas("0500")).toBe("500");
    });
  });

  describe("parseRawNumber", () => {
    it("parses comma-formatted strings back to numbers", () => {
      expect(parseRawNumber("1,200,000")).toBe(1200000);
      expect(parseRawNumber("50,000")).toBe(50000);
      expect(parseRawNumber("0")).toBe(0);
      expect(parseRawNumber("")).toBe(0);
      expect(parseRawNumber(null)).toBe(0);
      expect(parseRawNumber(undefined)).toBe(0);
    });
  });
});
