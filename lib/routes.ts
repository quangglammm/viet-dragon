// The fixed words of the public URLs, per language, and the three things the site does with them: write a link (`localizePath`), read a
// path back (`toInternalPath`) and decide what the proxy does with a request (`decideRoute`). Import-free: the browser, the proxy and the
// tests share it.
//
// The app's routes are named in English (`app/[locale]/products/...`, `/blog/...`) and everything inside the code — models, builders,
// `Link` hrefs, active-menu checks — speaks those internal paths. A language's own words appear only in the address bar: Vietnamese pages
// are `/san-pham/...`, `/bai-viet/...` and `/san-pham/in-nhanh` (Latin letters only, like every slug); the other languages keep the English
// words. The slugs after the word stay in the content database, one per language.

export const ROUTE_LOCALES = ["vi", "en", "zh", "ja", "ko"] as const;
export type RouteLocale = (typeof ROUTE_LOCALES)[number];
export const DEFAULT_ROUTE_LOCALE: RouteLocale = "vi";

type Words = Record<RouteLocale, string>;

const english = (word: string, vietnamese: string): Words => ({ vi: vietnamese, en: word, zh: word, ja: word, ko: word });

/** Internal route name → its word in each language. `fast-print` is the second segment under `products`. */
const WORDS = {
  products: english("products", "san-pham"),
  blog: english("blog", "bai-viet"),
  "fast-print": english("fast-print", "in-nhanh"),
} as const satisfies Record<string, Words>;

type RouteName = keyof typeof WORDS;

/** The route a segment names in some language, or null. */
function routeNamed(segment: string | undefined, names: readonly RouteName[]): RouteName | null {
  if (segment === undefined) return null;
  return names.find((name) => Object.values(WORDS[name]).includes(segment)) ?? null;
}

const TOP_LEVEL: readonly RouteName[] = ["products", "blog"];
const UNDER_PRODUCTS: readonly RouteName[] = ["fast-print"];

const isLocale = (segment: string | undefined): segment is RouteLocale => ROUTE_LOCALES.some((locale) => locale === segment);

function splitSuffix(href: string): [string, string] {
  const at = href.search(/[?#]/);
  return at === -1 ? [href, ""] : [href.slice(0, at), href.slice(at)];
}

/** Rewrites the words of a path segment list: the route's `from` word → `to`, and the fast-print word under products. */
function mapWords(segments: string[], word: (name: RouteName) => string): string[] {
  const top = routeNamed(segments[1], TOP_LEVEL);
  if (top === null) return segments;
  const next = [...segments];
  next[1] = word(top);
  if (top === "products" && routeNamed(segments[2], UNDER_PRODUCTS) === "fast-print") next[2] = word("fast-print");
  return next;
}

/**
 * An internal path (products, then category, product and segment slugs; with a `?query` or `#hash` if it has one) as the given language writes it. Anything that is not an
 * internal catalog / blog path — `/`, `/#cta`, `https://…`, `mailto:…` — comes back unchanged.
 */
export function localizePath(locale: RouteLocale, href: string): string {
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  const [pathname, suffix] = splitSuffix(href);
  return `${mapWords(pathname.split("/"), (name) => WORDS[name][locale]).join("/")}${suffix}`;
}

/** A path as the browser shows it (no language prefix), with each word read back as the internal route name. Locale-independent: the words never collide. */
export function toInternalPath(path: string): string {
  if (!path.startsWith("/")) return path;
  const [pathname, suffix] = splitSuffix(path);
  return `${mapWords(pathname.split("/"), (name) => name).join("/")}${suffix}`;
}

/** The language prefix of a public URL: none for the default language. */
export const localePrefix = (locale: RouteLocale): string => (locale === DEFAULT_ROUTE_LOCALE ? "" : `/${locale}`);

/** The URL path of an internal path in a language — prefix and words — as it appears in a link, a canonical, a sitemap. */
export function publicPath(locale: RouteLocale, internalPath: string): string {
  const path = localizePath(locale, internalPath);
  return path === "/" ? localePrefix(locale) || "/" : `${localePrefix(locale)}${path}`;
}

/** A public path read back — the reverse of `publicPath`: the language its prefix names (none: Vietnamese) and the internal path. */
export function parsePublicPath(path: string): { locale: RouteLocale; internalPath: string } {
  const [pathname, suffix] = splitSuffix(path);
  const segments = pathname.split("/");
  const prefixed = isLocale(segments[1]);
  const rest = ["", ...segments.slice(prefixed ? 2 : 1)].join("/") || "/";
  return { locale: prefixed ? (segments[1] as RouteLocale) : DEFAULT_ROUTE_LOCALE, internalPath: `${toInternalPath(rest)}${suffix}` };
}

export type RouteDecision =
  /** Nothing to do for the words; next-intl takes the request as it is. */
  | { action: "pass" }
  /** The language's own word was used: serve the internal path (the browser keeps the address it asked for). */
  | { action: "rewrite"; pathname: string }
  /** An old or another language's word: a permanent redirect to the language's own. */
  | { action: "redirect"; pathname: string };

/**
 * What the proxy does with a request path, before next-intl sees it. Pure. A path that names one of the fixed words in the language it is
 * written in is served from the internal route; one that names another word for the same route — the English `/products/…` in Vietnamese
 * (every URL the old site had), `/en/san-pham/…`, an explicit `/vi/…` prefix — is redirected (308) to the canonical address.
 * The result never starts with `//`.
 */
export function decideRoute(pathname: string): RouteDecision {
  const segments = pathname.replace(/\/{2,}/g, "/").replace(/(.)\/$/, "$1").split("/");
  const prefixed = isLocale(segments[1]);
  const locale: RouteLocale = prefixed ? (segments[1] as RouteLocale) : DEFAULT_ROUTE_LOCALE;
  const rest = ["", ...segments.slice(prefixed ? 2 : 1)];
  const top = routeNamed(rest[1], TOP_LEVEL);
  if (top === null) return { action: "pass" };

  const own = mapWords(rest, (name) => WORDS[name][locale]);
  const internal = mapWords(rest, (name) => name);
  const canonical = `${localePrefix(locale)}${own.join("/")}`;
  const requested = `${prefixed ? `/${locale}` : ""}${rest.join("/")}`;

  if (requested !== canonical) return { action: "redirect", pathname: canonical };
  // The address is canonical. Only a language whose words differ from the internal names needs a rewrite — today only the default one, which has no
  // prefix. A prefixed language with words of its own would need the prefix kept in the rewritten path: add that together with its words.
  if (internal.join("/") !== own.join("/") && !prefixed) return { action: "rewrite", pathname: internal.join("/") };
  return { action: "pass" };
}
