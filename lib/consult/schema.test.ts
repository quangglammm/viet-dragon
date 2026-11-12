import { describe, expect, it } from "vitest";
import { CONSULT_FIELD_LIMITS, CONSULT_MESSAGES, parseConsult, sameSiteUrl, tidy } from "./schema";

const SITE = "https://vietdragon.vn";
const lead = (overrides: Record<string, unknown> = {}) => parseConsult({ phone: "0901448377", productName: "Tờ rơi", ...overrides }, SITE);

describe("tidy", () => {
  it("makes one line of plain text", () => {
    expect(tidy("  Tờ   rơi\tA5\r\nIn 2 mặt  ")).toBe("Tờ rơi A5 In 2 mặt");
    expect(tidy("a\u0000b\u0007c")).toBe("a b c");
    expect(tidy("x y z")).toBe("x y z");
  });
});

describe("sameSiteUrl", () => {
  it("keeps a link on this site, normalised", () => {
    expect(sameSiteUrl("https://vietdragon.vn/san-pham/tiep-thi/to-roi#a5", SITE)).toBe("https://vietdragon.vn/san-pham/tiep-thi/to-roi#a5");
    expect(sameSiteUrl("https://vietdragon.vn", SITE)).toBe("https://vietdragon.vn/");
  });

  it.each([
    ["another site", "https://evil.example/zalo-reply"],
    ["a look-alike host", "https://vietdragon.vn.evil.example/"],
    ["a userinfo trick", "https://vietdragon.vn@evil.example/"],
    ["another scheme", "javascript:alert(1)"],
    ["a data URL", "data:text/html,<script>alert(1)</script>"],
    ["another port", "https://vietdragon.vn:8443/"],
    ["a different scheme on the same host", "ftp://vietdragon.vn/"],
    ["not a URL", "not a url"],
    ["relative", "/san-pham/x"],
    ["empty", ""],
  ])("drops %s", (_name, raw) => {
    expect(sameSiteUrl(raw, SITE)).toBeNull();
  });
});

describe("parseConsult", () => {
  it("makes a lead of a good form", () => {
    const parsed = lead({ phone: " 090 144 8377 ", materialName: "Giấy C250", sizeLabel: "A5", sizeDims: "148 × 210 mm", productUrl: "https://vietdragon.vn/san-pham/tiep-thi/to-roi" });
    expect(parsed).toEqual({
      kind: "lead",
      lead: { phone: "0901448377", productName: "Tờ rơi", materialName: "Giấy C250", sizeLabel: "A5", sizeDims: "148 × 210 mm", productUrl: "https://vietdragon.vn/san-pham/tiep-thi/to-roi" },
    });
  });

  it("needs only a phone number; the rest has a default or is empty", () => {
    expect(parseConsult({ phone: "+84901448377" }, SITE)).toEqual({
      kind: "lead",
      lead: { phone: "+84901448377", productName: "Sản phẩm Viet Dragon", materialName: "", sizeLabel: "", sizeDims: "", productUrl: null },
    });
  });

  it.each(["", "123", "0|01448377", "<script>", "090144837777"])("refuses the phone «%s»", (phone) => {
    expect(lead({ phone })).toEqual({ kind: "invalid", message: CONSULT_MESSAGES.phone });
  });

  it("refuses anything that is not an object with the right kinds of fields", () => {
    for (const body of [null, "x", 12, [], {}, { phone: 90144 }, { phone: "0901448377", productName: { a: 1 } }, { phone: "0901448377", productUrl: 5 }]) {
      expect(parseConsult(body, SITE)).toMatchObject({ kind: "invalid" });
    }
  });

  it("refuses a field over its cap, one character over", () => {
    expect(lead({ productName: "x".repeat(CONSULT_FIELD_LIMITS.name) })).toMatchObject({ kind: "lead" });
    for (const [field, max] of [["productName", CONSULT_FIELD_LIMITS.name], ["materialName", CONSULT_FIELD_LIMITS.name], ["sizeLabel", CONSULT_FIELD_LIMITS.size], ["sizeDims", CONSULT_FIELD_LIMITS.size], ["productUrl", CONSULT_FIELD_LIMITS.url], ["website", CONSULT_FIELD_LIMITS.honeypot]] as const) {
      expect(lead({ [field]: "x".repeat(max + 1) }), field).toEqual({ kind: "invalid", message: CONSULT_MESSAGES.invalid });
    }
    expect(lead({ phone: "0".repeat(CONSULT_FIELD_LIMITS.phone + 1) })).toMatchObject({ kind: "invalid" });
  });

  it("takes a filled honeypot for a bot — even when everything else is perfect, and before the phone is judged", () => {
    expect(lead({ website: "http://spam.example" })).toEqual({ kind: "honeypot" });
    expect(parseConsult({ phone: "nope", website: "x" }, SITE)).toEqual({ kind: "honeypot" });
    expect(lead({ website: "   " })).toMatchObject({ kind: "lead" });
    expect(lead({ website: "" })).toMatchObject({ kind: "lead" });
  });

  it("cleans every text field, and drops a product link to another site instead of refusing the lead", () => {
    const parsed = lead({ productName: "Tờ rơi\r\nBcc: evil@example.com", materialName: "a\u0000b", productUrl: "https://evil.example/zalo-reply?phone=1" });
    expect(parsed).toMatchObject({ kind: "lead", lead: { productName: "Tờ rơi Bcc: evil@example.com", materialName: "a b", productUrl: null } });
  });

  it("ignores fields it does not know", () => {
    expect(lead({ role: "admin", __proto__: { x: 1 } })).toMatchObject({ kind: "lead" });
  });
});
