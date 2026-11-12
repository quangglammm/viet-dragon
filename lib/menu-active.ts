// Helper to detect if a submenu item is currently active/selected based on current pathname & hash.
// Every link of the menus is canonical, and the hash the hook reports is canonical too (hooks/use-current-hash.ts),
// so these are plain comparisons.

const LOCALE_PREFIX = /^\/(vi|en|zh|ja|ko)(?=\/|$)/;

/** A product's page has this many segments counting the fixed word: products / category / product. */
const PRODUCT_PATH_SEGMENTS = 3;

function normalizePath(p: string): string {
  if (!p) return "";
  const cleaned = p.split("?")[0].replace(LOCALE_PREFIX, "");
  return cleaned === "" ? "/" : cleaned.replace(/\/$/, "");
}

/**
 * Checks if a given submenu item href matches the current browser location (pathname + hash).
 * Supports both hash-based links (a shape: /products/tet/bao-li-xi#bao-li-xi-ep-kim) and
 * subpath-based links (a material: /products/office/danh-thiep/danh-thiep-chuan).
 */
export function isSubmenuItemActive(itemHref: string, currentPathname: string, currentHash = ""): boolean {
  if (!itemHref) return false;

  const [rawItemPath, itemHash] = itemHref.split("#");
  const itemPath = normalizePath(rawItemPath);
  const currentPath = normalizePath(currentPathname);
  const hash = (currentHash || "").replace(/^#/, "").trim();

  // A shape link: its anchor on the product page, or the shape's own page.
  if (itemHash) {
    if (currentPath === itemPath) return hash === itemHash;
    return currentPath === `${itemPath}/${itemHash}` && (hash === "" || hash === itemHash);
  }

  // A material link must be a route of its own; a group link (the product page) is not an item, so it never highlights one.
  const segments = itemPath.split("/").filter(Boolean);
  if (segments.length <= PRODUCT_PATH_SEGMENTS) return false;
  if (currentPath === itemPath) return true;

  // The product page scrolled to the material.
  const parentPath = `/${segments.slice(0, -1).join("/")}`;
  return hash !== "" && currentPath === parentPath && hash === segments.at(-1);
}

/**
 * Checks if a subgroup header matches the current pathname.
 */
export function isSubmenuGroupActive(groupHref: string, currentPathname: string): boolean {
  if (!groupHref || !currentPathname) return false;
  const normalizedGroup = normalizePath(groupHref);
  const normalizedCurrent = normalizePath(currentPathname);
  return normalizedCurrent === normalizedGroup || normalizedCurrent.startsWith(`${normalizedGroup}/`);
}
