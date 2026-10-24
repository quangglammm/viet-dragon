// The product editor's tabs, and which one a path in the document belongs to (so that "go to this problem" opens the right tab).

export const PRODUCT_SECTIONS = [
  { id: "general", label: "Thông tin chung" },
  { id: "urls", label: "Đường dẫn & SEO" },
  { id: "shapes", label: "Hình thức" },
  { id: "options", label: "Chất liệu" },
  { id: "sizes", label: "Kích thước" },
  { id: "specs", label: "Thông số" },
] as const;

export type ProductSection = (typeof PRODUCT_SECTIONS)[number]["id"];

export function sectionOfPath(path: string): ProductSection {
  if (path.startsWith("shapes[")) return "shapes";
  if (path.startsWith("options[")) return "options";
  if (path.startsWith("sizes[")) return "sizes";
  if (path.startsWith("specs[")) return "specs";
  if (path.startsWith("slugs") || /^i18n\.[a-z]{2}\.seo/.test(path) || path === "ogImage") return "urls";
  return "general";
}
