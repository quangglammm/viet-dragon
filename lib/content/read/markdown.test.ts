import { describe, expect, it } from "vitest";
import { isSafeHref, parseContent, type Block } from "./markdown";

const text = (value: string) => ({ kind: "text", text: value }) as const;

describe("isSafeHref", () => {
  it("allows the web, mail, phone, this site and a place on the page", () => {
    for (const href of ["https://a.vn/x", "http://a.vn", "mailto:a@b.vn", "tel:0901448377", "/products/tiep-thi", "#top", "HTTPS://A.VN"]) expect(isSafeHref(href), href).toBe(true);
  });

  it("refuses everything else: scripts, data, other schemes, protocol-relative and bare words", () => {
    for (const href of ["javascript:alert(1)", "JaVaScRiPt:alert(1)", "data:text/html,x", "vbscript:x", "//evil.example", "ftp://x", "page.html", ""]) expect(isSafeHref(href), href).toBe(false);
  });
});

describe("parseContent: plain (the text the site always had)", () => {
  it("splits on blank lines; a paragraph that is one bold span is a heading", () => {
    expect(parseContent("plain", "**Tiêu đề**\n\nĐoạn một.\n\nĐoạn hai.")).toEqual<Block[]>([
      { kind: "heading", level: 3, inlines: [text("Tiêu đề")] },
      { kind: "paragraph", inlines: [text("Đoạn một.")] },
      { kind: "paragraph", inlines: [text("Đoạn hai.")] },
    ]);
  });

  it("makes inline bold spans and leaves everything else — including links and single stars — as text", () => {
    expect(parseContent("plain", "Dùng **giấy C** và *thử* [xem](https://a.vn).")).toEqual<Block[]>([
      { kind: "paragraph", inlines: [text("Dùng "), { kind: "strong", children: [text("giấy C")] }, text(" và *thử* [xem](https://a.vn).")] },
    ]);
  });

  it("is not fooled by a paragraph that merely starts and ends with bold spans", () => {
    const [block] = parseContent("plain", "**a** và **b**");
    expect(block.kind).toBe("paragraph");
  });

  it("keeps a heading's words as written (no markup inside it)", () => {
    expect(parseContent("plain", "**1. Chọn giấy**")).toEqual<Block[]>([{ kind: "heading", level: 3, inlines: [text("1. Chọn giấy")] }]);
  });

  it("gives nothing for an empty text", () => {
    expect(parseContent("plain", "")).toEqual([]);
    expect(parseContent("plain", "\n\n")).toEqual([]);
  });
});

describe("parseContent: markdown subset", () => {
  it("draws # ## ### as h2 h3 h4 (the page's title is the h1)", () => {
    expect(parseContent("markdown", "# A\n## B\n### C")).toEqual<Block[]>([
      { kind: "heading", level: 2, inlines: [text("A")] },
      { kind: "heading", level: 3, inlines: [text("B")] },
      { kind: "heading", level: 4, inlines: [text("C")] },
    ]);
  });

  it("joins the lines of a paragraph and starts a new one after a blank line", () => {
    expect(parseContent("markdown", "một\nhai\n\nba")).toEqual<Block[]>([
      { kind: "paragraph", inlines: [text("một hai")] },
      { kind: "paragraph", inlines: [text("ba")] },
    ]);
  });

  it("reads bullet and numbered lists, and quotes", () => {
    expect(parseContent("markdown", "- a\n- **b**\n\n1. x\n2) y\n\n> q1\n> q2")).toEqual<Block[]>([
      { kind: "list", ordered: false, items: [[text("a")], [{ kind: "strong", children: [text("b")] }]] },
      { kind: "list", ordered: true, items: [[text("x")], [text("y")]] },
      { kind: "quote", inlines: [text("q1 q2")] },
    ]);
  });

  it("reads bold, italic and links, nested where it makes sense", () => {
    expect(parseContent("markdown", "A **b *c* d** e [lien](https://a.vn) f")).toEqual<Block[]>([
      {
        kind: "paragraph",
        inlines: [
          text("A "),
          { kind: "strong", children: [text("b "), { kind: "em", children: [text("c")] }, text(" d")] },
          text(" e "),
          { kind: "link", href: "https://a.vn", children: [text("lien")] },
          text(" f"),
        ],
      },
    ]);
  });

  it("keeps only the words of a link whose address is not allowed — never the script", () => {
    const blocks = parseContent("markdown", "Bấm [vào đây](javascript:alert(1)) và [đây](//evil.example) nhé");
    expect(JSON.stringify(blocks)).not.toMatch(/javascript|evil/);
    expect(blocks).toEqual<Block[]>([{ kind: "paragraph", inlines: [text("Bấm "), text("vào đây"), text(" và "), text("đây"), text(" nhé")] }]);
  });

  it("never produces raw HTML: markup in the text stays text", () => {
    expect(parseContent("markdown", "<script>alert(1)</script> <b>x</b>")).toEqual<Block[]>([{ kind: "paragraph", inlines: [text("<script>alert(1)</script> <b>x</b>")] }]);
  });

  it("copes with Windows line endings and a trailing blank", () => {
    expect(parseContent("markdown", "# T\r\n\r\nbody\r\n")).toEqual<Block[]>([
      { kind: "heading", level: 2, inlines: [text("T")] },
      { kind: "paragraph", inlines: [text("body")] },
    ]);
  });
});
