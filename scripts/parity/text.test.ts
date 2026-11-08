import { describe, expect, it } from "vitest";
import { anchorAliases, decodeEntities, digest, visibleText } from "./text";

const PAGE = `<!DOCTYPE html><html><head><title>Tờ rơi &amp; Flyers | Viet Dragon</title>
<meta name="description" content="Mô tả &quot;ngắn&quot;"/><script>var hidden = "no";</script><style>.x{color:red}</style></head>
<body><header><a href="/products/tet">Tết</a><a href="https://example.com/x">out</a><a href="//cdn.example.com">cdn</a></header>
<main><h1>Tờ&nbsp;rơi</h1><p>Giá&#x20;từ&#32;850đ</p><!-- a comment --><ul><li>một</li><li>hai</li></ul><a href="/products/tet">again</a></main>
<script>self.__next_f.push([1,"payload"])</script></body></html>`;

describe("decodeEntities", () => {
  it("decodes named, decimal and hexadecimal entities, and leaves an unknown one alone", () => {
    expect(decodeEntities("a &amp; b &lt;c&gt; &#233; &#x1F600; &unknown;")).toBe("a & b <c> é 😀 &unknown;");
  });
});

describe("visibleText", () => {
  it("keeps what a visitor reads and drops scripts, styles, comments and tags", () => {
    expect(visibleText(PAGE)).toBe("Tết out cdn Tờ rơi Giá từ 850đ một hai again");
  });

  it("separates block elements so words from different blocks do not run together", () => {
    expect(visibleText("<body><p>a</p><p>b</p><div>c</div></body>")).toBe("a b c");
  });
});

describe("digest", () => {
  it("reads the title and description (decoded), the text, and the internal links once each", () => {
    const page = digest(PAGE);
    expect(page.title).toBe("Tờ rơi & Flyers | Viet Dragon");
    expect(page.description).toBe('Mô tả "ngắn"');
    expect(page.links).toEqual(["/products/tet"]);
    expect(page.text).toContain("Giá từ 850đ");
  });

  it("copes with a page that has no title, description or links", () => {
    expect(digest("<body>x</body>")).toEqual({ title: "", description: "", text: "x", links: [] });
  });
});

describe("anchorAliases", () => {
  it("maps every other name of a card to its id, in either attribute order", () => {
    const html = '<div id="a5" class="x" data-aliases="a5-flyer kho-a5"></div><div data-aliases="old" id="b"></div><p id="plain"></p>';
    expect([...anchorAliases(html)]).toEqual([["a5-flyer", "a5"], ["kho-a5", "a5"], ["old", "b"]]);
  });

  it("ignores an empty list and an element with no id", () => {
    expect(anchorAliases('<div id="a" data-aliases=""></div><div data-aliases="x"></div>').size).toBe(0);
  });
});
