import type { DraftEntityType } from "@/lib/db/content/drafts";

// Every column of every content table is either carried by its document (so an editor can change it and a publish
// keeps it) or owned by the system. Two tests hold this table honest:
//   * lib/db/column-registry.int.test.ts compares it with information_schema, so a column added without being
//     registered fails the build — it cannot ship un-editable or be silently reset by a publish;
//   * lib/content/column-registry.test.ts checks that every document path exists in the zod document schema.
// Phase 3d builds the editor field registry on top (one control per document path).
//
// Path syntax (relative to the document root): `a.b` = property, `a[]` = element of an array, `*` = any language /
// record key, `i18n` (a bare map) = the language of an `*_i18n` row. A column may be carried by several paths.

export const SYSTEM = "system" as const;
type ColumnSource = typeof SYSTEM | string | readonly string[];
type TableRegistration = { document: DraftEntityType; columns: Record<string, ColumnSource> };

/** Authorship and the optimistic-lock token are maintained by publish, never edited. */
const VERSIONING = { version: SYSTEM, updated_at: SYSTEM, updated_by: SYSTEM } as const;
const OG_KIND = { og_media_kind: SYSTEM } as const;
const SEO_TEXT = { seo_title: "i18n.*.seoTitle", seo_description: "i18n.*.seoDescription" } as const;
const SHAPE_SEO = { seo_title: "shapes[].i18n.*.seoTitle", seo_description: "shapes[].i18n.*.seoDescription" } as const;
const OPTION_SEO = { seo_title: "options[].i18n.*.seoTitle", seo_description: "options[].i18n.*.seoDescription" } as const;

const SHAPE_SLUGS = ["shapes[].slug", "shapes[].aliases[]"] as const;
const OPTION_SLUGS = ["options[].slug", "options[].aliases[]"] as const;
const GROUP = "columns[].groups[]";
const ITEM = `${GROUP}.items[]`;

export const COLUMN_REGISTRY: Record<string, TableRegistration> = {
  // ── product aggregate ──
  product: {
    document: "product",
    columns: {
      id: SYSTEM, uid: "uid", category_id: "category", cover_media_id: "cover", position: "position", status: "status",
      created_at: SYSTEM, ...VERSIONING, og_media_id: "ogImage", ...OG_KIND,
    },
  },
  product_i18n: { document: "product", columns: { product_id: SYSTEM, locale: "i18n", title: "i18n.*.title", description: "i18n.*.description", ...SEO_TEXT } },
  product_slug: {
    document: "product",
    columns: { category_id: ["category", "aliases[].category"], slug: ["slug", "aliases[].slug"], product_id: SYSTEM, is_canonical: SYSTEM },
  },
  shape: {
    document: "product",
    columns: { id: SYSTEM, uid: "shapes[].uid", product_id: SYSTEM, image_media_id: "shapes[].image", position: "shapes[].position", og_media_id: "shapes[].ogImage", ...OG_KIND },
  },
  shape_i18n: {
    document: "product",
    columns: { shape_id: SYSTEM, locale: "shapes[].i18n", name: "shapes[].i18n.*.name", description: "shapes[].i18n.*.description", badge: "shapes[].i18n.*.badge", ...SHAPE_SEO },
  },
  option: {
    document: "product",
    columns: {
      id: SYSTEM, uid: "options[].uid", product_id: SYSTEM, shape_id: "options[].shape", material_id: "options[].material", position: "options[].position",
      icon: "options[].icon", hide_foil: "options[].hideFoil", hide_double_sided: "options[].hideDoubleSided", base_price: "options[].prices.base",
      double_sided_price: "options[].prices.doubleSided", foil_price: "options[].prices.foil", foil2_price: "options[].prices.foil2", unit_key: "options[].unit",
      og_media_id: "options[].ogImage", ...OG_KIND,
    },
  },
  option_i18n: {
    document: "product",
    columns: { option_id: SYSTEM, locale: "options[].i18n", name: "options[].i18n.*.name", card_title: "options[].i18n.*.cardTitle", tagline: "options[].i18n.*.tagline", ...OPTION_SEO },
  },
  option_bullet: {
    document: "product",
    columns: { id: SYSTEM, option_id: SYSTEM, kind: "options[].bullets[].kind", position: "options[].bullets[].position", trait_key: "options[].bullets[].trait" },
  },
  option_bullet_i18n: { document: "product", columns: { bullet_id: SYSTEM, locale: "options[].bullets[].i18n", text: "options[].bullets[].i18n.*" } },
  option_image: {
    document: "product",
    columns: {
      option_id: SYSTEM,
      variant: ["options[].images.default", "options[].images.pure"],
      position: ["options[].images.default[]", "options[].images.pure[]"],
      media_id: ["options[].images.default[]", "options[].images.pure[]"],
      media_kind: SYSTEM,
    },
  },
  product_segment: {
    document: "product",
    columns: { product_id: SYSTEM, slug: [...SHAPE_SLUGS, ...OPTION_SLUGS], shape_id: SHAPE_SLUGS, option_id: OPTION_SLUGS, is_canonical: SYSTEM },
  },
  size_option: {
    document: "product",
    columns: { id: SYSTEM, product_id: SYSTEM, shape_id: "sizes[].shape", tier: "sizes[].tier", width_mm: "sizes[].w", height_mm: "sizes[].h", depth_mm: "sizes[].d", dims_text: "sizes[].text" },
  },
  size_option_i18n: { document: "product", columns: { size_option_id: SYSTEM, locale: "sizes[].i18n", note: "sizes[].i18n.*" } },
  product_spec: {
    document: "product",
    columns: { id: SYSTEM, product_id: SYSTEM, shape_id: "specs[].shape", spec_item_id: ["specs[].kind", "specs[].item"], position: "specs[].position" },
  },

  // ── menu aggregate (one per category; positions are array order) ──
  menu_group: {
    document: "menu",
    columns: { product_id: `${GROUP}.product`, menu_column: "columns[].column", position: GROUP, image_media_id: `${GROUP}.image` },
  },
  menu_group_i18n: { document: "menu", columns: { product_id: SYSTEM, locale: `${GROUP}.i18n`, label: `${GROUP}.i18n.*.label`, description: `${GROUP}.i18n.*.description` } },
  menu_item: {
    document: "menu",
    columns: { id: SYSTEM, product_id: SYSTEM, position: ITEM, shape_id: `${ITEM}.target.shape`, option_id: `${ITEM}.target.option`, is_fast: `${ITEM}.isFast`, image_media_id: `${ITEM}.image` },
  },
  menu_item_i18n: { document: "menu", columns: { menu_item_id: SYSTEM, locale: `${ITEM}.i18n`, label: `${ITEM}.i18n.*` } },

  // ── blog ──
  post: {
    document: "post",
    columns: {
      id: SYSTEM, uid: "uid", category_key: "category", published_on: "publishedOn", read_time_min: "readTimeMin", cover_media_id: "cover",
      content_format: "contentFormat", status: "status", ...VERSIONING, og_media_id: "ogImage", ...OG_KIND,
    },
  },
  post_slug: { document: "post", columns: { slug: ["slug", "aliases[]"], post_id: SYSTEM, is_canonical: SYSTEM } },
  post_i18n: { document: "post", columns: { post_id: SYSTEM, locale: "i18n", title: "i18n.*.title", excerpt: "i18n.*.excerpt", content: "i18n.*.content", ...SEO_TEXT } },
  post_category: { document: "post_category", columns: { key: "key", ...VERSIONING } },
  post_category_i18n: { document: "post_category", columns: { category_key: SYSTEM, locale: "i18n", label: "i18n.*.label" } },

  // ── categories and the library ──
  category: {
    document: "category",
    columns: { id: "key", icon: "icon", cover_media_id: "cover", position: "position", version: SYSTEM, updated_at: SYSTEM, menu_version: SYSTEM, updated_by: SYSTEM, og_media_id: "ogImage", ...OG_KIND },
  },
  category_i18n: { document: "category", columns: { category_id: SYSTEM, locale: "i18n", name: "i18n.*.name", description: "i18n.*.description", ...SEO_TEXT } },
  material: { document: "material", columns: { id: SYSTEM, slug: "key", icon: "icon", ...VERSIONING } },
  material_i18n: { document: "material", columns: { material_id: SYSTEM, locale: "i18n", name: "i18n.*.name" } },
  trait: { document: "trait", columns: { key: "key", icon: "icon", ...VERSIONING } },
  trait_i18n: { document: "trait", columns: { trait_key: SYSTEM, locale: "i18n", label: "i18n.*.label", description: "i18n.*.description" } },
  unit: { document: "unit", columns: { key: "key", ...VERSIONING } },
  unit_i18n: { document: "unit", columns: { unit_key: SYSTEM, locale: "i18n", label: "i18n.*.label" } },
  spec_item: { document: "spec_item", columns: { id: SYSTEM, kind: "key", key: "key", is_default: "isDefault", ...VERSIONING } },
  spec_item_i18n: { document: "spec_item", columns: { spec_item_id: SYSTEM, locale: "i18n", label: "i18n.*.label" } },

  // ── merchandising and UI copy ──
  fast_print_item: {
    document: "fast_print_item",
    columns: {
      id: SYSTEM, uid: "uid", key: "key", image_media_id: "image", icon: "icon", turnaround_hours: "turnaroundHours", from_price: "fromPrice",
      unit_key: "unit", position: "position", status: "status", ...VERSIONING,
    },
  },
  fast_print_item_i18n: { document: "fast_print_item", columns: { item_id: SYSTEM, locale: "i18n", name: "i18n.*.name", tag: "i18n.*.tag", description: "i18n.*.description" } },
  showcase_item: { document: "showcase_item", columns: { id: SYSTEM, uid: "uid", key: "key", media_id: "media", aspect: "aspect", position: "position", ...VERSIONING } },
  showcase_item_i18n: { document: "showcase_item", columns: { item_id: SYSTEM, locale: "i18n", label: "i18n.*.label" } },
  site_message: { document: "site_message", columns: { locale: "data", namespace: "key", data: "data.*", ...VERSIONING } },
};

/** Content tables that no document carries, with the reason (the registry test requires one for each). */
export const UNREGISTERED_TABLES: Record<string, string> = {
  locale: "reference data: the language list, changed by a migration together with messages/<code>.json and the route",
  media: "Phase 5 media pipeline: documents refer to a file by storage_key; uploads create the rows",
  media_i18n: "Phase 5 media pipeline (alt text)",
  content_draft: "draft machinery",
  draft_reference: "draft machinery",
  content_revision: "revision history",
  legacy_import: "verbatim archive of the original source records",
};

/** Document paths of a column, as a list. Empty for system-owned columns. */
export function documentPaths(source: ColumnSource): readonly string[] {
  if (source === SYSTEM) return [];
  return typeof source === "string" ? [source] : source;
}
