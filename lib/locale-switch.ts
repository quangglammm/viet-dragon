import { parsePublicPath, type RouteLocale } from "./routes";

// Where the page you are on lives in another language. The page declares it itself — `generateMetadata` writes a
// `<link rel="alternate" hreflang>` per language, and Next replaces them on every client navigation — so the switcher can land on the other
// language's canonical address in one step, instead of carrying this language's slug across and being redirected (a second hop, and a
// 404 if the slug was never one of the other language's). Browser code; import-free apart from the routing table.

type HeadReader = Pick<Document, "querySelector">;

/**
 * The same page in `locale`, as an internal path (the form `useRouter().replace(path, { locale })` takes), or null when the document
 * declares none for that language — a 404, a page that has no other language.
 */
export function alternateInternalPath(locale: RouteLocale, head: HeadReader = document): string | null {
  const href = head.querySelector<HTMLLinkElement>(`link[rel="alternate"][hreflang="${locale}"]`)?.getAttribute("href");
  if (!href) return null;
  try {
    // Absolute (Next resolves it against `metadataBase`, i.e. SITE_URL), which need not be the origin this page is served from: only the path counts.
    const url = new URL(href, "http://placeholder.invalid");
    const parsed = parsePublicPath(`${url.pathname}${url.search}${url.hash}`);
    return parsed.locale === locale ? parsed.internalPath : null;
  } catch {
    return null;
  }
}
