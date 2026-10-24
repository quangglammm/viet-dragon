import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { z } from "zod";
import { showcaseImages } from "@/data/showcase";
import { materialTraits } from "@/data/material-traits";
import { MARKETING_SUBMENU_COLUMNS } from "@/data/marketing-menu";
import { OFFICE_SUBMENU_COLUMNS } from "@/data/office-menu";
import { PACKAGING_SUBMENU_COLUMNS } from "@/data/packaging-menu";
import { blogPosts, type BlogPost } from "@/data/posts";
import { MAIN_CATEGORIES, SUBGROUPS_CATALOG, getSubgroupById, type ProductCategoryDef, type SubgroupCategory } from "@/data/subgroups-catalog";
import { TET_SUBMENU_COLUMNS } from "@/data/tet-menu";
import * as translations from "@/data/translations";
import { getProductSizes } from "@/lib/product-sizes";
import { PRINT_TECHNIQUES, getPostPressFinishing, getProductMaterials } from "@/lib/product-specs";
import { SHAPE_ALIASES, toSlug } from "@/lib/shape-aliases";
import { LOCALES, type Locale } from "./localized";

// Everything the seed reads, loaded once. The seed only READS the site's source modules and files — it never
// edits them. Three literals are not exported by their modules and are lifted out of the source text instead
// (validated, so a change in their shape fails loudly rather than seeding wrong data).

export interface MenuItem {
  id: string;
  nameVi: string;
  nameEn: string;
  nameZh?: string;
  nameJa?: string;
  nameKo?: string;
  href: string;
  image: string;
  isFast?: boolean;
  kind?: "shape" | "material";
}
export interface MenuGroup {
  id: string;
  titleVi: string;
  titleEn: string;
  titleZh?: string;
  titleJa?: string;
  titleKo?: string;
  href: string;
  image: string;
  items: MenuItem[];
}
export interface MenuColumn {
  id: string;
  groups: MenuGroup[];
}

const printProductSchema = z.object({
  id: z.string(),
  image: z.string(),
  icon: z.string(),
  nameVi: z.string(), nameEn: z.string(), nameZh: z.string(), nameJa: z.string(), nameKo: z.string(),
  tagVi: z.string(), tagEn: z.string(), tagZh: z.string(), tagJa: z.string(), tagKo: z.string(),
  priceVi: z.string(), priceEn: z.string(), priceZh: z.string(), priceJa: z.string(), priceKo: z.string(),
  descVi: z.string(), descEn: z.string(), descZh: z.string(), descJa: z.string(), descKo: z.string(),
});
export type PrintProduct = z.infer<typeof printProductSchema>;

export interface Sources {
  root: string;
  categories: readonly ProductCategoryDef[];
  subgroups: readonly SubgroupCategory[];
  getSubgroupById: typeof getSubgroupById;
  /** `SUBGROUP_ALIASES` of data/subgroups-catalog.ts (not exported there). */
  subgroupAliases: Readonly<Record<string, string>>;
  shapeAliases: Readonly<Record<string, string>>;
  toSlug: typeof toSlug;
  translations: typeof translations;
  traits: typeof materialTraits;
  sizes: typeof getProductSizes;
  specs: { materials: typeof getProductMaterials; finishing: typeof getPostPressFinishing; techniques: Record<Locale, string[]> };
  menus: Record<ProductCategoryDef["id"], readonly MenuColumn[]>;
  /** `PRINT_PRODUCTS` of FastPrintClient.tsx (not exported there). */
  fastPrint: readonly PrintProduct[];
  showcase: typeof showcaseImages;
  posts: readonly BlogPost[];
  messages: Record<Locale, Record<string, unknown>>;
  /** Every `/products/...` string literal in the public source → the file it was found in. */
  productLinks: ReadonlyMap<string, string>;
  /** Storage keys (`images/hero/a.webp`) that some source file mentions: used by components, styles or data, not only by seeded rows. */
  mediaReferences: ReadonlySet<string>;
  /** The lucide icons the old product card could draw (the report counts the option icons outside this set). */
  cardIcons: ReadonlySet<string>;
}

/** Evaluates an object/array literal copied out of source text, in an empty context (no globals, no `require`). */
function evaluateLiteral(literal: string): unknown {
  return JSON.parse(JSON.stringify(vm.runInNewContext(`(${literal})`, Object.create(null))));
}

function liftLiteral(file: string, pattern: RegExp, description: string): string {
  const match = pattern.exec(fs.readFileSync(file, "utf8"));
  if (!match) throw new Error(`Cannot find ${description} in ${file} — the source changed shape; update scripts/seed/sources.ts`);
  return match[1];
}

function loadSubgroupAliases(root: string): Record<string, string> {
  const literal = liftLiteral(
    path.join(root, "data/subgroups-catalog.ts"),
    /const SUBGROUP_ALIASES: Record<string, string> = (\{[\s\S]*?\n\});/,
    "SUBGROUP_ALIASES",
  );
  return z.record(z.string(), z.string()).parse(evaluateLiteral(literal));
}

function loadFastPrint(root: string): PrintProduct[] {
  const file = path.join(root, "app/[locale]/products/fast-print/FastPrintClient.tsx");
  const literal = liftLiteral(file, /const PRINT_PRODUCTS = (\[[\s\S]*?\n\]) as const;/, "PRINT_PRODUCTS");
  // `icon: CreditCard,` is a lucide component in the source; the database stores its name.
  return z.array(printProductSchema).parse(evaluateLiteral(literal.replace(/icon: (\w+),/g, 'icon: "$1",')));
}

const SCANNED_DIRECTORIES = ["app", "components", "data", "lib", "messages", "i18n", "hooks"];
const SCANNED_FILE = /\.(ts|tsx|json|css)$/;
const ADMIN_PATH = /(^|\/)(admin|api\/admin)\//;
const TEST_FILE = /\.(test|int\.test)\.ts$/;
const PRODUCT_LINK = /["'`](\/products(?:\/[A-Za-z0-9._-]+){0,3}(?:#[A-Za-z0-9._-]+)?)(?=["'`?])/g;
const MEDIA_PATH = /\/((?:images|videos|uploads)\/[A-Za-z0-9._@%+/-]+\.(?:webp|jpe?g|png|gif|avif|svg|ico|mp4|webm|mov))/gi;

/** One pass over the public source: the `/products/...` links and the media paths it mentions. */
function scanSource(root: string): { productLinks: Map<string, string>; mediaReferences: Set<string> } {
  const productLinks = new Map<string, string>();
  const mediaReferences = new Set<string>();
  const scanFile = (file: string): void => {
    const relative = path.relative(root, file);
    if (TEST_FILE.test(relative)) return;
    const text = fs.readFileSync(file, "utf8");
    for (const match of text.matchAll(MEDIA_PATH)) mediaReferences.add(match[1]);
    if (ADMIN_PATH.test(relative)) return; // the legacy admin links are not the public site
    for (const match of text.matchAll(PRODUCT_LINK)) if (!productLinks.has(match[1])) productLinks.set(match[1], relative);
  };
  const walk = (directory: string): void => {
    if (!fs.existsSync(directory)) return;
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
      const full = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (SCANNED_FILE.test(entry.name)) scanFile(full);
    }
  };
  for (const directory of SCANNED_DIRECTORIES) walk(path.join(root, directory));
  return { productLinks, mediaReferences };
}

/**
 * The lucide icons the OLD product card imported (components/ui/material-flashcard.tsx before Phase 4 made it draw any icon of lib/icons.ts):
 * the seed's report counts the options whose icon that card could not draw. The card no longer says, so the list is kept here.
 */
const OLD_CARD_ICONS: readonly string[] = [
  "Layers", "Sparkles", "Palette", "Award", "Gem", "Feather", "PenLine", "Minimize2", "StickyNote",
  "Stamp", "ShieldCheck", "Briefcase", "Gift", "ArrowLeftRight", "ImagePlus", "ChevronLeft", "ChevronRight",
  "ChevronDown",
];

function loadMessages(root: string): Record<Locale, Record<string, unknown>> {
  const entries = LOCALES.map((locale) => [locale, JSON.parse(fs.readFileSync(path.join(root, `messages/${locale}.json`), "utf8")) as Record<string, unknown>]);
  return Object.fromEntries(entries) as Record<Locale, Record<string, unknown>>;
}

export function loadSources(root: string = process.cwd()): Sources {
  const scanned = scanSource(root);
  return {
    root,
    categories: MAIN_CATEGORIES,
    subgroups: SUBGROUPS_CATALOG,
    getSubgroupById,
    subgroupAliases: loadSubgroupAliases(root),
    shapeAliases: SHAPE_ALIASES,
    toSlug,
    translations,
    traits: materialTraits,
    sizes: getProductSizes,
    specs: { materials: getProductMaterials, finishing: getPostPressFinishing, techniques: PRINT_TECHNIQUES },
    menus: { marketing: MARKETING_SUBMENU_COLUMNS, office: OFFICE_SUBMENU_COLUMNS, packaging: PACKAGING_SUBMENU_COLUMNS, tet: TET_SUBMENU_COLUMNS },
    fastPrint: loadFastPrint(root),
    showcase: showcaseImages,
    posts: blogPosts,
    messages: loadMessages(root),
    productLinks: scanned.productLinks,
    mediaReferences: scanned.mediaReferences,
    cardIcons: new Set(OLD_CARD_ICONS),
  };
}
