import type { PageDigest } from "./text";

// How the new (database) site's page differs from the old (static) one, in the few ways that are understood and expected. Anything else is
// "other" and is read by a person. Pure: the compare script fetches, this decides.

export type Verdict =
  /** Title, description, text and links all equal (links after the old ones are followed through the new site's redirects). */
  | "identical"
  /** Same words, but a link points elsewhere (or at another anchor) than the old page's did. */
  | "links"
  /** Only the sizes / techniques / materials / finishing form under the cards differs: owner decision 1 (one answer per product in the database). */
  | "forms-only"
  | "other";

const FORM_START: readonly string[] = ["Kích thước phổ biến:", "Popular sizes:", "常用尺寸:", "一般的なサイズ:", "자주 쓰이는 규격:"];
const FORM_END: readonly string[] = ["Tư vấn Zalo", "Zalo Consultation", "Zalo 咨询", "Zalo 相談", "Zalo 상담"];

const escape = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const FORM = new RegExp(`(?:${FORM_START.map(escape).join("|")}).*?(?:${FORM_END.map(escape).join("|")})`, "g");

/** The form under every card (sizes … finishing, up to the Zalo button) replaced by a marker, so two pages can be compared without it. */
export function withoutForms(text: string): string {
  return text.replace(FORM, " ⟨form⟩ ").replace(/\s+/g, " ").trim();
}

export interface Comparison {
  verdict: Verdict;
  /** For `other` and `links`: what to look at. */
  detail: string[];
}

const same = (a: readonly string[], b: readonly string[]): boolean => a.length === b.length && a.every((item) => b.includes(item));

/** The first place two texts differ, with a little context either side. */
export function firstDifference(a: string, b: string, context = 40): string {
  let at = 0;
  while (at < a.length && at < b.length && a[at] === b[at]) at += 1;
  return `…${a.slice(Math.max(0, at - context), at + context)}…  ≠  …${b.slice(Math.max(0, at - context), at + context)}…`;
}

export interface Expectations {
  /** An old link → the link the new page should have for it (the redirect the new site answers). */
  canonical: (link: string) => string;
}

export function compare(old: PageDigest, now: PageDigest, expect: Expectations): Comparison {
  const wantedLinks = old.links.map(expect.canonical);
  const linksEqual = same(wantedLinks, now.links);
  const detail: string[] = [];
  if (!linksEqual) {
    detail.push(...wantedLinks.filter((link) => !now.links.includes(link)).map((link) => `only on the old page: ${link}`));
    detail.push(...now.links.filter((link) => !wantedLinks.includes(link)).map((link) => `only on the new page: ${link}`));
  }

  const head = old.title === now.title && old.description === now.description;
  if (head && old.text === now.text) return linksEqual ? { verdict: "identical", detail } : { verdict: "links", detail };

  if (!head) detail.push(`head: ${firstDifference(`${old.title} | ${old.description}`, `${now.title} | ${now.description}`)}`);
  const oldText = withoutForms(old.text);
  const newText = withoutForms(now.text);
  if (head && linksEqual && oldText === newText) return { verdict: "forms-only", detail };
  detail.push(`text: ${firstDifference(oldText, newText)}`);
  return { verdict: "other", detail };
}
