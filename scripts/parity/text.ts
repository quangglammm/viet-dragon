// What a page "says", for comparing the old (static) site with the new (database) one: the title, the description, the visible text
// and the internal links. Pure string work — the build's prerendered HTML and a live response go through the same function.

export interface PageDigest {
  title: string;
  description: string;
  /** Visible text, whitespace collapsed. */
  text: string;
  /** Internal links (`href` starting with `/`), in document order, without duplicates. */
  links: string[];
}

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

export function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity: string) => {
    if (entity[0] === "#") {
      const code = entity[1].toLowerCase() === "x" ? Number.parseInt(entity.slice(2), 16) : Number.parseInt(entity.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : match;
    }
    return ENTITIES[entity.toLowerCase()] ?? match;
  });
}

const collapse = (text: string): string => text.replace(/\s+/g, " ").trim();

/** The visible text of an HTML document: scripts, styles, comments and tags removed, entities decoded. */
export function visibleText(html: string): string {
  const body = /<body[^>]*>([\s\S]*)<\/body>/i.exec(html)?.[1] ?? html;
  const stripped = body
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<\/(p|div|li|h[1-6]|section|article|tr|br)>|<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, " ");
  return collapse(decodeEntities(stripped));
}

const attribute = (tag: string, name: string): string | undefined => new RegExp(`\\s${name}=(?:"([^"]*)"|'([^']*)')`, "i").exec(tag)?.slice(1).find((value) => value !== undefined);

export function digest(html: string): PageDigest {
  const title = collapse(decodeEntities(/<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1] ?? ""));
  const description = [...html.matchAll(/<meta\s[^>]*>/gi)].map((m) => m[0]).find((tag) => attribute(tag, "name")?.toLowerCase() === "description");
  const links = new Set<string>();
  for (const [, tag] of html.matchAll(/(<a\s[^>]*>)/gi)) {
    const href = attribute(tag, "href");
    if (href?.startsWith("/") && !href.startsWith("//")) links.add(decodeEntities(href));
  }
  return { title, description: description ? decodeEntities(attribute(description, "content") ?? "") : "", text: visibleText(html), links: [...links] };
}

/** Every other name a card on the page answers to (`data-aliases`), keyed to the card's canonical `id`: alias → id. */
export function anchorAliases(html: string): Map<string, string> {
  const owners = new Map<string, string>();
  for (const [tag] of html.matchAll(/<[a-z]+\s[^>]*data-aliases=[^>]*>/gi)) {
    const id = attribute(tag, "id");
    if (!id) continue;
    for (const alias of (attribute(tag, "data-aliases") ?? "").split(/\s+/).filter(Boolean)) if (!owners.has(alias)) owners.set(alias, id);
  }
  return owners;
}
