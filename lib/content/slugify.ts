/** Lowercase ASCII kebab-case: strips diacritics, maps đ to d. Used for every URL slug and library key the CMS suggests or generates. */
export function slugify(text: string): string {
  const slug = text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "x";
}
