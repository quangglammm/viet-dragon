import type { ProductOption } from "@/data/categories";
import type { ShapeItem, SubgroupCategory } from "@/data/subgroups-catalog";
import type { Tx } from "@/lib/db/types";
import type { Locale } from "./localized";
import type { Notes } from "./notes";
import type { Sources } from "./sources";

// What the seed steps share: the transaction, the loaded sources, the notes, and the ids of the rows written so far.

export interface SeedContext {
  tx: Tx;
  src: Sources;
  notes: Notes;
  stats: SeedStats;
}

/** Numbers and lists for the report that are not simple notes. Filled by the steps. */
export interface SeedStats {
  /** Translation-table keys no current id consults (data/translations.ts), by table. */
  unusedTranslationKeys: Record<string, string[]>;
  translationKeyTotals: Record<string, number>;
  /** Products listed in more than one category (they share one zh/ja/ko translation): product id → categories. */
  sharedListings: Record<string, string[]>;
  productAliasRows: number;
  /** Cross-category URLs the old `getSubgroupById` fallback resolved that nothing links to; they will 404. */
  droppedCrossCategoryAliases: string[];
  segmentAliasRows: number;
  menu: MenuStats;
  /** Product / shape contexts whose sizes or spec lists change with the language of the name. */
  sizeLanguageDependent: string[];
  specLanguageDependent: string[];
  specAssignments: number;
  messageRows: number;
  legacyRows: number;
  bullets: number;
}

export interface MenuStats {
  groups: number;
  items: number;
  groupLabelOverrides: number;
  groupDescriptionOverrides: number;
  groupImageOverrides: number;
  itemLabelOverrides: number;
  itemImageOverrides: number;
  fastItems: number;
}

export function emptyStats(): SeedStats {
  return {
    unusedTranslationKeys: {},
    translationKeyTotals: {},
    sharedListings: {},
    productAliasRows: 0,
    droppedCrossCategoryAliases: [],
    segmentAliasRows: 0,
    menu: { groups: 0, items: 0, groupLabelOverrides: 0, groupDescriptionOverrides: 0, groupImageOverrides: 0, itemLabelOverrides: 0, itemImageOverrides: 0, fastItems: 0 },
    sizeLanguageDependent: [],
    specLanguageDependent: [],
    specAssignments: 0,
    messageRows: 0,
    legacyRows: 0,
    bullets: 0,
  };
}

/** Registered files under public/, by storage key (`images/hero/a.webp`). */
export interface MediaRegistry {
  /** Id of the file at a public path (`/images/a.webp`), marking it as referenced; null when blank or unknown. */
  idOf: (publicPath: string | null | undefined) => number | null;
  readonly registered: ReadonlyMap<string, number>;
  readonly referenced: ReadonlySet<string>;
}

export interface MaterialRecord {
  id: number;
  slug: string;
  icon: string | null;
  /** Canonical name per language: the most frequent displayed name among the options of this stock. */
  names: Partial<Record<Locale, string>>;
}

/** One option row of the source before it is written: where it lives and which stock it belongs to. */
export interface OptionModel {
  productKey: string;
  shape: ShapeItem | null;
  /** Index within its own list (product materials, or one shape's materials). */
  index: number;
  source: ProductOption;
  materialKey: string;
}

export interface ShapeRecord {
  source: ShapeItem;
  id: number;
  uid: string;
  slug: string;
}

export interface OptionRecord extends OptionModel {
  id: number;
  uid: string;
  slug: string;
  /** The offer's own name per language, exactly as authored (null when the source has none). */
  rawName: Record<Locale, string | null>;
  /** The card heading the site shows today (the raw name after the display-name rewrite). */
  shownName: Record<Locale, string | null>;
  shapeRecord: ShapeRecord | null;
}

export interface ProductRecord {
  key: string; // "<category>/<id>"
  id: number;
  uid: string;
  source: SubgroupCategory;
  shapes: ShapeRecord[];
  options: OptionRecord[];
  /** Every slug already used in this product's URL-segment namespace (shapes, options, aliases). */
  takenSegments: Set<string>;
}

export interface Catalog {
  products: Map<string, ProductRecord>;
  materials: Map<string, MaterialRecord>;
  media: MediaRegistry;
  traitKeys: ReadonlySet<string>;
}

/** The option record for a source option object within one product: the first scope that lists it. */
export function optionRecordFor(product: ProductRecord, source: ProductOption): OptionRecord | undefined {
  return product.options.find((option) => option.source === source);
}
