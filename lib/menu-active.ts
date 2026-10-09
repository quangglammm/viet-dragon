// Helper to detect if a submenu item is currently active/selected based on current pathname & hash
import { resolveShapeAlias } from "@/lib/shape-aliases";

function normalizePath(p: string): string {
  if (!p) return "";
  const cleaned = p.split("?")[0].replace(/^\/(vi|en|zh|ja|ko)(?=\/|$)/, "");
  return cleaned === "" ? "/" : cleaned.replace(/\/$/, "");
}

/**
 * Checks if a given submenu item href matches the current browser location (pathname + hash).
 * Supports both hash-based links (e.g. /products/tet/bao-li-xi#bao-li-xi-ep-kim)
 * and subpath-based links (e.g. /products/office/danh-thiep/danh-thiep-chuan).
 */
export function isSubmenuItemActive(
  itemHref: string,
  currentPathname: string,
  currentHash = ""
): boolean {
  if (!itemHref) return false;

  const [rawItemPath, itemHash] = itemHref.split("#");
  const normalizedItemPath = normalizePath(rawItemPath);
  const normalizedCurrentPath = normalizePath(currentPathname);
  const cleanHash = (currentHash || "").replace(/^#/, "").trim();

  // 1. Hash-based link (e.g. "/products/tet/bao-li-xi#bao-li-xi-ep-kim" or "/products/tet/nhan-dan#nhan-decal-giay")
  if (itemHash) {
    const resolvedItemHash = resolveShapeAlias(itemHash);
    const resolvedCurrentHash = resolveShapeAlias(cleanHash);

    // Exact match on same page when hash is present
    if (
      normalizedCurrentPath === normalizedItemPath &&
      cleanHash !== "" &&
      (cleanHash === itemHash || resolvedCurrentHash === resolvedItemHash)
    ) {
      return true;
    }

    // Match when user is on the deep shape page (e.g. "/products/tet/bao-li-xi/bao-li-xi-ep-kim")
    if (
      normalizedCurrentPath === `${normalizedItemPath}/${itemHash}` ||
      normalizedCurrentPath === `${normalizedItemPath}/${resolvedItemHash}`
    ) {
      return true;
    }

    return false;
  }

  // 2. Subpath-based link (e.g. "/products/office/danh-thiep/danh-thiep-chuan")
  // Must be a distinct detail/shape route (>= 4 segments: ["products", cat, subgroup, shapeId])
  const segments = normalizedItemPath.split("/").filter(Boolean);
  if (segments.length >= 4) {
    // Direct match on deep shape route (e.g. /products/office/danh-thiep/danh-thiep-chuan)
    if (normalizedCurrentPath === normalizedItemPath) {
      return true;
    }

    // If user is on the parent subgroup page and the hash matches the shape ID
    const shapeId = segments[segments.length - 1];
    const parentPath = "/" + segments.slice(0, -1).join("/");
    const resolvedShapeId = resolveShapeAlias(shapeId);
    const resolvedCurrentHash = resolveShapeAlias(cleanHash);

    if (
      cleanHash !== "" &&
      normalizedCurrentPath === parentPath &&
      (cleanHash === shapeId || resolvedCurrentHash === resolvedShapeId)
    ) {
      return true;
    }
  }

  // 3. Fallback: If itemHref is only a category/subgroup path without hash
  // (e.g. "/products/tet/nhan-dan"), it is a group link, NOT an individual item,
  // so do not highlight it as an active submenu item to avoid multi-item highlighting.
  return false;
}

/**
 * Checks if a subgroup header matches the current pathname.
 */
export function isSubmenuGroupActive(
  groupHref: string,
  currentPathname: string
): boolean {
  if (!groupHref || !currentPathname) return false;
  const normalizedGroup = normalizePath(groupHref);
  const normalizedCurrent = normalizePath(currentPathname);
  return (
    normalizedCurrent === normalizedGroup ||
    normalizedCurrent.startsWith(`${normalizedGroup}/`)
  );
}
