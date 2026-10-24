import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { compare, type Expectations, type Verdict } from "./classify";
import { anchorAliases, digest, type PageDigest } from "./text";

// Compares the NEW (database) site, running at a base URL, with the OLD (static) one kept by `pnpm parity:capture`: every URL of
// .parity/legacy.json is requested (redirects followed — the old catalog URLs answer 308 to their localized canonical), digested the
// same way and classified (scripts/parity/classify.ts). Writes .parity/report.json and prints the counts; exits 1 when a page is "other".
//
//   pnpm parity:compare [--base http://localhost:3105] [--only /en/products] [--concurrency 8]

const LEGACY = join(".parity", "legacy.json");
const REPORT = join(".parity", "report.json");
const NOT_PUBLIC = /^\/(admin|zalo-reply)(\/|$)/;

/**
 * Pages that are meant to differ from the old ones in more than the cards' forms, and why. Anything else that differs is a finding.
 * (The old URLs are the keys: `/ja/products/tet` is the old Japanese Tet category page.)
 */
const EXPLAINED: readonly { url: RegExp; why: string }[] = [
  { url: /^\/(en|ja|ko|zh)\/products\/tet$/, why: "Tet category cards say what the product says; the old page worded them after the mega-menu (Phase 4 M2, decision 1)" },
  { url: /^\/(ja|ko|zh)\/products\/marketing\/vong-tay-su-kien$/, why: "product title precedence: the old page preferred the shared per-id table over the product's own title (docs/data-model.md §8, «title-precedence-differs»)" },
  { url: /^\/(ja|ko|zh)\/products\/tet\/nhan-dan$/, why: "previous/next product labels: the Tet product's own title, where the old page used a title shared by id with another category" },
  { url: /^\/(ja|ko|zh)\/products\/tet\/to-roi\/bang-khen$/, why: "«best for» lines: the AI-suggested translations of the seed's revision 2 replace the old texts (needs a native reader)" },
  { url: /^(\/(en|ja|ko|zh))?\/?$|^(\/(en|ja|ko|zh))?\/blog$/, why: "posts are listed newest first: the old file put 28 May before 1 June, so the home preview and the blog grid swap those two (Phase 4 M3, decision 1)" },
  { url: /^(\/(en|ja|ko|zh))?\/blog\/(5-loi-thuong-gap-khi-chuan-bi-file-in|chon-chat-lieu-in-phu-hop|bao-bi-fnb-local-brand|viet-dragon-mo-rong-binh-duong)$/, why: "previous / next post: the same newest-first order" },
];

function option(name: string, fallback: string): string {
  const at = process.argv.indexOf(name);
  return at >= 0 && process.argv[at + 1] ? process.argv[at + 1] : fallback;
}

async function pool<T, R>(items: readonly T[], size: number, work: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: size }, async () => {
      for (let at = next++; at < items.length; at = next++) results[at] = await work(items[at]);
    }),
  );
  return results;
}

const pathOf = (url: string): string => {
  const parsed = new URL(url);
  return `${parsed.pathname}${parsed.hash}`;
};

async function main(): Promise<void> {
  const base = option("--base", "http://localhost:3105");
  const only = option("--only", "");
  const concurrency = Number(option("--concurrency", "8"));
  const legacy = JSON.parse(readFileSync(LEGACY, "utf8")) as { build: string; pages: Record<string, PageDigest> };
  const urls = Object.keys(legacy.pages).filter((url) => !NOT_PUBLIC.test(url) && url.startsWith(only)).sort();

  // Where each old link leads on the new site: the first redirect hop, or itself.
  const links = [...new Set(urls.flatMap((url) => legacy.pages[url].links.map((link) => link.split("#")[0])))];
  const hops = new Map<string, string>();
  await pool(links, concurrency, async (link) => {
    const response = await fetch(`${base}${link}`, { redirect: "manual" });
    const location = response.headers.get("location");
    hops.set(link, response.status >= 300 && response.status < 400 && location ? new URL(location, base).pathname : link);
  });

  // A link with a hash names a card by one of its old names: the page it leads to says which id answers to that name.
  const hashed = [...new Set(urls.flatMap((url) => legacy.pages[url].links.filter((link) => link.includes("#")).map((link) => hops.get(link.split("#")[0]) ?? link.split("#")[0])))];
  const aliases = new Map<string, Map<string, string>>();
  await pool(hashed, concurrency, async (path) => {
    const response = await fetch(`${base}${path}`, { redirect: "follow" });
    aliases.set(path, anchorAliases(await response.text()));
  });
  const expectations: Expectations = {
    canonical: (link) => {
      const [path, hash] = link.split("#");
      const target = hops.get(path) ?? path;
      return `${target}${hash === undefined ? "" : `#${aliases.get(target)?.get(hash) ?? hash}`}`;
    },
  };

  const byVerdict: Record<Verdict | "explained" | "failed", { url: string; to?: string; detail: string[] }[]> = { identical: [], links: [], "forms-only": [], explained: [], other: [], failed: [] };
  let redirected = 0;
  await pool(urls, concurrency, async (url) => {
    try {
      const response = await fetch(`${base}${url}`, { redirect: "follow" });
      if (response.status !== 200) return void byVerdict.failed.push({ url, detail: [`HTTP ${response.status}`] });
      const to = pathOf(response.url);
      if (to !== url) redirected += 1;
      const result = compare(legacy.pages[url], digest(await response.text()), expectations);
      const explained = result.verdict === "other" ? EXPLAINED.find((entry) => entry.url.test(url)) : undefined;
      byVerdict[explained ? "explained" : result.verdict].push({ url, ...(to === url ? {} : { to }), detail: explained ? [explained.why, ...result.detail] : result.detail });
    } catch (error) {
      byVerdict.failed.push({ url, detail: [String(error)] });
    }
  });

  mkdirSync(dirname(REPORT), { recursive: true });
  writeFileSync(REPORT, JSON.stringify({ base, legacyBuild: legacy.build, comparedAt: new Date().toISOString(), redirected, byVerdict }, null, 1));
  console.log(`Compared ${urls.length} pages with ${base} (${redirected} answered a redirect first) → ${REPORT}`);
  for (const [verdict, entries] of Object.entries(byVerdict)) console.log(`  ${verdict.padEnd(13)} ${entries.length}`);
  process.exit(byVerdict.other.length + byVerdict.failed.length > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(2);
});
