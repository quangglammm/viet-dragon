import { describe, expect, it } from "vitest";
import { buildLeadEmail, escapeHtml } from "./email";
import type { Lead } from "./schema";

const SITE = "https://vietdragon.vn";
const build = (overrides: Partial<Lead> = {}) =>
  buildLeadEmail({ phone: "0901448377", productName: "Tờ rơi", materialName: "", sizeLabel: "", sizeDims: "", productUrl: null, ...overrides }, { siteOrigin: SITE, receiver: "contact@vietdragon.vn" });

describe("escapeHtml", () => {
  it("escapes the five characters that matter in text and in attributes", () => {
    expect(escapeHtml(`<a href="x" title='y'>&</a>`)).toBe("&lt;a href=&quot;x&quot; title=&#39;y&#39;&gt;&amp;&lt;/a&gt;");
  });

  it("leaves Vietnamese text and digits alone", () => {
    expect(escapeHtml("Giấy Ford 250gsm — A5 (148×210)")).toBe("Giấy Ford 250gsm — A5 (148×210)");
  });
});

describe("buildLeadEmail", () => {
  it("says what the visitor asked for, and links Zalo for the right number", () => {
    const mail = build({ materialName: "Giấy C250", sizeLabel: "A5", sizeDims: "148 × 210 mm", productUrl: "https://vietdragon.vn/san-pham/tiep-thi/to-roi" });
    expect(mail.subject).toBe("[Gấp] 0901448377 quan tâm sản phẩm Tờ rơi");
    expect(mail.zaloChatLink).toBe("https://zalo.me/84901448377");
    expect(mail.html).toContain("0901448377");
    expect(mail.html).toContain("Giấy C250");
    expect(mail.html).toContain("A5 (148 × 210 mm)");
    expect(mail.html).toContain("https://vietdragon.vn/san-pham/tiep-thi/to-roi");
    expect(mail.text).toContain("https://zalo.me/84901448377");
  });

  it("points the Zalo bridge button at THIS site, whatever else arrived", () => {
    const mail = build({ productName: "A & B", materialName: "x y" });
    expect(mail.bridgeLink).toBe("https://vietdragon.vn/zalo-reply?phone=84901448377&product=A%20%26%20B&material=x%20y");
    expect(mail.html).toContain('href="https://vietdragon.vn/zalo-reply?phone=84901448377&amp;product=A%20%26%20B&amp;material=x%20y"');
  });

  it("leaves out the rows it has nothing for", () => {
    const mail = build();
    expect(mail.html).not.toContain("Chất liệu:");
    expect(mail.html).not.toContain("Quy cách");
    expect(mail.html).not.toContain("Link sản phẩm");
  });
});

describe("buildLeadEmail with hostile input", () => {
  const PAYLOADS = ['<script>alert(1)</script>', '"><img src=x onerror=alert(1)>', "' onmouseover='alert(1)", "<a href=\"https://evil.example\">click</a>", "</td></tr></table><h1>hi</h1>", "&lt;b&gt;", "<style>*{display:none}</style>"];

  const count = (haystack: string, needle: string) => haystack.split(needle).length - 1;
  // The same mail with harmless text in the same fields: its tags are the template's own.
  const baseline = build({ productName: "x", materialName: "x", sizeLabel: "x", sizeDims: "148 mm" });

  it.each(PAYLOADS)("shows %s as text, never as markup, in every field that carries visitor text", (payload) => {
    const mail = build({ productName: payload, materialName: payload, sizeLabel: payload, sizeDims: "148 mm", productUrl: null });
    // Not one tag, and not one attribute-closing quote, more than the template has: what the visitor typed is all escaped.
    expect(count(mail.html, "<")).toBe(count(baseline.html, "<"));
    expect(count(mail.html, ">")).toBe(count(baseline.html, ">"));
    expect(count(mail.html, '"')).toBe(count(baseline.html, '"'));
    expect(mail.html).not.toMatch(/<script/i);
    expect(mail.html).not.toContain("<img");
    expect(mail.html).not.toContain('href="https://evil.example');
    // …and it is still there to be read.
    expect(mail.html).toContain(escapeHtml(payload));
  });

  it("escapes the product link in its href and in its text", () => {
    const mail = build({ productUrl: 'https://vietdragon.vn/x?a="><script>alert(1)</script>' });
    expect(mail.html).not.toMatch(/<script/i);
    expect(mail.html).toContain("&quot;");
  });

  it("cannot put a second header in the subject (the form is tidied before it gets here, and the subject is built from one line)", () => {
    const mail = build({ productName: "Tờ rơi" });
    expect(mail.subject).not.toMatch(/[\r\n]/);
  });

  it("percent-encodes the product and material in the bridge link, so they cannot add parameters or a path", () => {
    const mail = build({ productName: "x&phone=1&evil=2", materialName: "../../a?b#c" });
    const url = new URL(mail.bridgeLink);
    expect(url.origin).toBe(SITE);
    expect(url.pathname).toBe("/zalo-reply");
    expect([...url.searchParams.keys()]).toEqual(["phone", "product", "material"]);
    expect(url.searchParams.get("product")).toBe("x&phone=1&evil=2");
    expect(url.searchParams.get("material")).toBe("../../a?b#c");
  });

  it("never lets the visitor change who the mail says it was sent to", () => {
    const mail = build({ productName: "contact@vietdragon.vn <b>" });
    expect(mail.html).toContain("contact@vietdragon.vn</strong>");
  });
});
