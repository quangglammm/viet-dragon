import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { compare, type Expectations, type Verdict } from "./classify";
import { anchorAliases, digest, type PageDigest } from "./text";

// Compares the NEW (database) site, running at a base URL, with the OLD (static) one kept by `pnpm parity:capture`: every URL of
// .parity/legacy.json is requested, its redirects followed ONE HOP AT A TIME (the old catalog URLs answer 308 to their localized
// canonical: `/products/marketing/flyers` → `/san-pham/marketing/flyers` → `/san-pham/tiep-thi/to-roi`), digested the same way and classified
// (scripts/parity/classify.ts). A legacy URL must end in a 200 within MAX_HOPS redirects, each answered with a single `Location`.
// Writes .parity/report.json and prints the counts and the hop histogram; exits 1 when a page is "other" or "failed".
//
//   pnpm parity:compare [--base http://localhost:3105] [--only /en/products] [--concurrency 8]

const LEGACY = join(".parity", "legacy.json");
const REPORT = join(".parity", "report.json");
const NOT_PUBLIC = /^\/(admin|zalo-reply)(\/|$)/;
/** A legacy URL may take this many redirects (the fixed word, then a slug that also changed); more is a crawl-budget and ranking cost. */
const MAX_HOPS = 2;
/** Stop following after this many, whatever the limit: a loop must end the run, not hang it. */
const RUNAWAY_HOPS = 10;

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

/** What requesting a path leads to when its redirects are followed by hand. */
interface Chain {
  /** Path (with query) of the last response. */
  final: string;
  hops: number;
  status: number;
  /** Only for a 200 asked with `body`. */
  text?: string;
  /** Why the chain is broken, when it is: a redirect without or with a doubled `Location`, or a loop. */
  problem?: string;
}

async function chain(base: string, path: string, body: boolean): Promise<Chain> {
  let current = path;
  for (let hops = 0; hops <= RUNAWAY_HOPS; hops += 1) {
    const response = await fetch(`${base}${current}`, { redirect: "manual" });
    const location = response.headers.get("location");
    if (response.status < 300 || response.status >= 400) {
      if (response.status === 200 && body) return { final: current, hops, status: 200, text: await response.text() };
      await response.body?.cancel();
      return { final: current, hops, status: response.status };
    }
    await response.body?.cancel();
    // fetch joins repeated headers with ", ": a Location sent twice reads «/a, /a» and leads nowhere.
    if (!location) return { final: current, hops, status: response.status, problem: "a redirect without Location" };
    if (location.includes(", ")) return { final: current, hops, status: response.status, problem: `Location sent twice: ${location}` };
    const next = new URL(location, base);
    current = `${next.pathname}${next.search}`;
  }
  return { final: current, hops: RUNAWAY_HOPS + 1, status: 0, problem: "redirects without end" };
}

async function main(): Promise<void> {
  const base = option("--base", "http://localhost:3105");
  const only = option("--only", "");
  const concurrency = Number(option("--concurrency", "8"));
  const legacy = JSON.parse(readFileSync(LEGACY, "utf8")) as { build: string; pages: Record<string, PageDigest> };
  const urls = Object.keys(legacy.pages).filter((url) => !NOT_PUBLIC.test(url) && url.startsWith(only)).sort();

  // Where each old link leads on the new site: the end of its redirects, or itself.
  const links = [...new Set(urls.flatMap((url) => legacy.pages[url].links.map((link) => link.split("#")[0])))];
  const ends = new Map<string, string>();
  await pool(links, concurrency, async (link) => {
    const { final, problem } = await chain(base, link, false);
    ends.set(link, problem ? link : final.split("?")[0]);
  });

  // A link with a hash names a card by one of its old names: the page it leads to says which id answers to that name.
  const hashed = [...new Set(urls.flatMap((url) => legacy.pages[url].links.filter((link) => link.includes("#")).map((link) => ends.get(link.split("#")[0]) ?? link.split("#")[0])))];
  const aliases = new Map<string, Map<string, string>>();
  await pool(hashed, concurrency, async (path) => {
    const { text } = await chain(base, path, true);
    aliases.set(path, anchorAliases(text ?? ""));
  });
  const expectations: Expectations = {
    canonical: (link) => {
      const [path, hash] = link.split("#");
      const target = ends.get(path) ?? path;
      return `${target}${hash === undefined ? "" : `#${aliases.get(target)?.get(hash) ?? hash}`}`;
    },
  };

  const byVerdict: Record<Verdict | "explained" | "failed", { url: string; to?: string; detail: string[] }[]> = { identical: [], links: [], "forms-only": [], explained: [], other: [], failed: [] };
  const hopCounts = new Map<number, number>();
  await pool(urls, concurrency, async (url) => {
    try {
      const page = await chain(base, url, true);
      hopCounts.set(page.hops, (hopCounts.get(page.hops) ?? 0) + 1);
      if (page.problem) return void byVerdict.failed.push({ url, detail: [page.problem] });
      if (page.status !== 200 || page.text === undefined) return void byVerdict.failed.push({ url, ...(page.hops > 0 ? { to: page.final } : {}), detail: [`HTTP ${page.status} after ${page.hops} redirect(s)`] });
      if (page.hops > MAX_HOPS) return void byVerdict.failed.push({ url, to: page.final, detail: [`${page.hops} redirects (at most ${MAX_HOPS})`] });
      const to = page.hops > 0 ? page.final : undefined;
      const result = compare(legacy.pages[url], digest(page.text), expectations);
      const explained = result.verdict === "other" ? EXPLAINED.find((entry) => entry.url.test(url)) : undefined;
      byVerdict[explained ? "explained" : result.verdict].push({ url, ...(to === undefined ? {} : { to }), detail: explained ? [explained.why, ...result.detail] : result.detail });
    } catch (error) {
      byVerdict.failed.push({ url, detail: [String(error)] });
    }
  });
  const redirected = urls.length - (hopCounts.get(0) ?? 0);
  const histogram = [...hopCounts].sort(([a], [b]) => a - b).map(([hops, count]) => `${hops}×${count}`).join("  ");

  mkdirSync(dirname(REPORT), { recursive: true });
  writeFileSync(REPORT, JSON.stringify({ base, legacyBuild: legacy.build, comparedAt: new Date().toISOString(), redirected, hops: Object.fromEntries(hopCounts), byVerdict }, null, 1));
  console.log(`Compared ${urls.length} pages with ${base} (${redirected} reached by redirect; redirects per URL: ${histogram}) → ${REPORT}`);
  for (const [verdict, entries] of Object.entries(byVerdict)) console.log(`  ${verdict.padEnd(13)} ${entries.length}`);
  process.exit(byVerdict.other.length + byVerdict.failed.length > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(2);
});
