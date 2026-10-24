// A post's text as a small list of blocks the page draws with its own classes. Two formats (the post's `contentFormat`): `plain`, the
// text the site always had — blank-line paragraphs, a paragraph that is one `**bold**` span is a heading, inline `**bold**` — and a safe
// `markdown` SUBSET. There is no raw HTML anywhere: the output is data, a link is kept only when its address is on the allow-list, and
// anything outside the subset stays as text. Pure and client-safe.

export type Inline =
  | { kind: "text"; text: string }
  | { kind: "strong"; children: Inline[] }
  | { kind: "em"; children: Inline[] }
  | { kind: "link"; href: string; children: Inline[] };

export type Block =
  | { kind: "heading"; level: 2 | 3 | 4; inlines: Inline[] }
  | { kind: "paragraph"; inlines: Inline[] }
  | { kind: "list"; ordered: boolean; items: Inline[][] }
  | { kind: "quote"; inlines: Inline[] };

export type ContentFormat = "plain" | "markdown";

/** An address a post may link to: the web, mail, phone, this site, or a place on the page. */
export function isSafeHref(href: string): boolean {
  return /^(https?:\/\/|mailto:|tel:|#)/i.test(href) || (href.startsWith("/") && !href.startsWith("//"));
}

const LINK = /\[([^\]]+)\]\(((?:[^()\s]|\([^()\s]*\))+)\)/; // the address may hold one level of brackets: https://a.vn/x_(y)
const STRONG_PLAIN = /\*\*([^*]+?)\*\*/;
const STRONG = /\*\*(?=\S)(.+?)(?<=\S)\*\*/; // markdown: italics may sit inside
const EM = /(?<!\*)\*([^*\s][^*]*?)\*(?!\*)/;

/** `**bold**`, `*italic*` and `[text](address)`; what is left is text. `plain` posts only know bold. */
function inlinesOf(text: string, subset: "bold" | "all"): Inline[] {
  const patterns: { kind: "link" | "strong" | "em"; regex: RegExp }[] = [{ kind: "strong", regex: subset === "all" ? STRONG : STRONG_PLAIN }];
  if (subset === "all") patterns.push({ kind: "link", regex: LINK }, { kind: "em", regex: EM });
  const first = patterns
    .map((pattern) => ({ pattern, match: pattern.regex.exec(text) }))
    .filter((found): found is { pattern: (typeof patterns)[number]; match: RegExpExecArray } => found.match !== null)
    .sort((a, b) => a.match.index - b.match.index)[0];
  if (!first) return text === "" ? [] : [{ kind: "text", text }];

  const { match, pattern } = first;
  const before: Inline[] = match.index > 0 ? [{ kind: "text", text: text.slice(0, match.index) }] : [];
  const after = inlinesOf(text.slice(match.index + match[0].length), subset);
  const inner = inlinesOf(match[1], subset);
  let node: Inline[];
  if (pattern.kind === "link") node = isSafeHref(match[2]) ? [{ kind: "link", href: match[2], children: inner }] : inner;
  else node = [{ kind: pattern.kind, children: inner }];
  return [...before, ...node, ...after];
}

/** The old rule: a paragraph that is a single `**…**` span is a heading (an h3), everything else a paragraph with bold spans. */
function plainBlocks(text: string): Block[] {
  return text
    .split("\n\n")
    .filter(Boolean)
    .map((paragraph): Block => {
      const heading = /^\*\*([^*]+)\*\*$/.exec(paragraph);
      return heading ? { kind: "heading", level: 3, inlines: [{ kind: "text", text: heading[1] }] } : { kind: "paragraph", inlines: inlinesOf(paragraph, "bold") };
    });
}

const HEADING = /^(#{1,3})\s+(.*)$/;
const BULLET = /^[-*]\s+(.*)$/;
const NUMBERED = /^\d+[.)]\s+(.*)$/;
const QUOTE = /^>\s?(.*)$/;

type LineKind = "blank" | "heading" | "bullet" | "numbered" | "quote" | "text";

function kindOf(line: string): LineKind {
  if (line.trim() === "") return "blank";
  if (HEADING.test(line)) return "heading";
  if (BULLET.test(line)) return "bullet";
  if (NUMBERED.test(line)) return "numbered";
  if (QUOTE.test(line)) return "quote";
  return "text";
}

/** The markdown subset: `#`/`##`/`###` headings (drawn as h2–h4: the page's title is the h1), paragraphs, `-`/`1.` lists, `>` quotes. */
function markdownBlocks(text: string): Block[] {
  const blocks: Block[] = [];
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  let at = 0;
  while (at < lines.length) {
    const kind = kindOf(lines[at]);
    if (kind === "blank") {
      at += 1;
    } else if (kind === "heading") {
      const [, hashes, title] = HEADING.exec(lines[at])!;
      blocks.push({ kind: "heading", level: (hashes.length + 1) as 2 | 3 | 4, inlines: inlinesOf(title.trim(), "all") });
      at += 1;
    } else {
      const start = at;
      while (at < lines.length && kindOf(lines[at]) === kind) at += 1;
      const run = lines.slice(start, at);
      if (kind === "bullet" || kind === "numbered") {
        const item = kind === "bullet" ? BULLET : NUMBERED;
        blocks.push({ kind: "list", ordered: kind === "numbered", items: run.map((line) => inlinesOf(item.exec(line)![1].trim(), "all")) });
      } else if (kind === "quote") {
        blocks.push({ kind: "quote", inlines: inlinesOf(run.map((line) => QUOTE.exec(line)![1]).join(" ").trim(), "all") });
      } else {
        blocks.push({ kind: "paragraph", inlines: inlinesOf(run.map((line) => line.trim()).join(" "), "all") });
      }
    }
  }
  return blocks;
}

export function parseContent(format: ContentFormat, text: string): Block[] {
  return format === "markdown" ? markdownBlocks(text) : plainBlocks(text);
}
