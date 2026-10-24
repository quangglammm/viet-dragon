import { z } from "zod";
import {
  DOCUMENT_SCHEMA,
  iconSchema,
  mediaKeySchema,
  nonblankText,
  nonNegativeInt,
  perLocale,
  positionSchema,
  requireDefaultLocale,
  seoFields,
  slugSchema,
  uidSchema,
} from "./common";

// The product document: the aggregate root of the catalog (docs/data-model.md §9). Shapes, options, bullets,
// images, sizes and specs are saved, drafted and published together. Own children refer to each other by uid,
// library records and media by immutable key.

export const PRODUCT_STATUSES = ["published", "archived"] as const;
export const BULLET_KIND_VALUES = ["feature", "best_for"] as const;
export const SIZE_TIER_VALUES = ["large", "medium", "small"] as const;
export const SPEC_KIND_VALUES = ["technique", "finishing", "material_hint"] as const;

const aliasSlugs = z.array(slugSchema);

export const shapeDocumentSchema = z.strictObject({
  uid: uidSchema,
  slug: slugSchema,
  /** Old URL segments / `#hash` anchors that still resolve (never dropped by a publish). */
  aliases: aliasSlugs,
  position: positionSchema,
  image: mediaKeySchema.nullable(),
  ogImage: mediaKeySchema.nullable(),
  i18n: perLocale(
    z.strictObject({ name: nonblankText, description: nonblankText.optional(), badge: nonblankText.optional(), ...seoFields }),
  ),
});

const optionTextRow = z
  .strictObject({
    /** The offer's own full name: page title, breadcrumb, alt text, lead message. */
    name: nonblankText.optional(),
    /** Card heading override. Card heading = cardTitle ?? material name ?? name. */
    cardTitle: nonblankText.optional(),
    tagline: nonblankText.optional(),
    ...seoFields,
  })
  .refine((row) => Object.values(row).some((value) => value !== undefined), "Cần ít nhất một nội dung cho ngôn ngữ này.");

export const bulletDocumentSchema = z
  .strictObject({
    kind: z.enum(BULLET_KIND_VALUES),
    position: positionSchema,
    /** Icon of a feature bullet: a trait key. Best-for bullets have none. */
    trait: slugSchema.nullable(),
    i18n: perLocale(nonblankText),
  })
  .refine((bullet) => bullet.kind === "feature" || bullet.trait === null, {
    message: "Chỉ gạch đầu dòng đặc điểm mới có biểu tượng.",
    path: ["trait"],
  });

const prices = z.strictObject({
  base: nonNegativeInt.nullable(),
  doubleSided: nonNegativeInt.nullable(),
  foil: nonNegativeInt.nullable(),
  foil2: nonNegativeInt.nullable(),
});

export const optionDocumentSchema = z.strictObject({
  uid: uidSchema,
  slug: slugSchema,
  aliases: aliasSlugs,
  /** Shape uid when the offer is only for that shape; null = offered by the whole product. */
  shape: uidSchema.nullable(),
  /** Material (stock) key. */
  material: slugSchema,
  position: positionSchema,
  icon: iconSchema.nullable(),
  hideFoil: z.boolean(),
  hideDoubleSided: z.boolean(),
  prices,
  /** Unit key. */
  unit: slugSchema.nullable(),
  ogImage: mediaKeySchema.nullable(),
  i18n: perLocale(optionTextRow),
  bullets: z.array(bulletDocumentSchema),
  images: z.strictObject({ default: z.array(mediaKeySchema), pure: z.array(mediaKeySchema) }),
});

const dimension = z.int().positive().nullable();

export const sizeDocumentSchema = z
  .strictObject({
    /** Shape uid; null = the whole product. Shape rows win over product rows. */
    shape: uidSchema.nullable(),
    tier: z.enum(SIZE_TIER_VALUES),
    w: dimension,
    h: dimension,
    d: dimension,
    /** Non-metric size such as "Size L - XL"; exclusive with w/h. */
    text: nonblankText.nullable(),
    i18n: perLocale(nonblankText),
  })
  .superRefine((size, ctx) => {
    const numeric = size.w !== null && size.h !== null;
    if (numeric === (size.text !== null)) {
      ctx.addIssue({ code: "custom", message: "Nhập kích thước (rộng × cao) hoặc mô tả bằng chữ, không nhập cả hai.", path: ["text"] });
    }
    if (size.d !== null && !numeric) ctx.addIssue({ code: "custom", message: "Chiều sâu cần có cả rộng và cao.", path: ["d"] });
  });

export const specDocumentSchema = z.strictObject({
  shape: uidSchema.nullable(),
  kind: z.enum(SPEC_KIND_VALUES),
  /** Spec item key (unique within its kind). */
  item: slugSchema,
  position: positionSchema,
});

const productAlias = z.strictObject({ category: slugSchema, slug: slugSchema });

const productBase = z.strictObject({
  schema: z.literal(DOCUMENT_SCHEMA),
  uid: uidSchema,
  category: slugSchema,
  slug: slugSchema,
  /** Old (category, slug) URLs that still resolve — in any category. */
  aliases: z.array(productAlias),
  status: z.enum(PRODUCT_STATUSES),
  position: positionSchema,
  cover: mediaKeySchema.nullable(),
  ogImage: mediaKeySchema.nullable(),
  i18n: perLocale(z.strictObject({ title: nonblankText, description: nonblankText.optional(), ...seoFields })),
  shapes: z.array(shapeDocumentSchema),
  options: z.array(optionDocumentSchema),
  sizes: z.array(sizeDocumentSchema),
  specs: z.array(specDocumentSchema),
});

type ProductBase = z.infer<typeof productBase>;
type Path = (string | number)[];

function duplicates<T>(values: readonly T[], keyOf: (value: T) => string): Set<string> {
  const seen = new Set<string>();
  const repeated = new Set<string>();
  for (const value of values) {
    const key = keyOf(value);
    if (seen.has(key)) repeated.add(key);
    seen.add(key);
  }
  return repeated;
}

/** Shapes, options and their aliases share ONE URL-segment namespace per product. */
function checkSegmentNamespace(product: ProductBase, ctx: z.RefinementCtx): void {
  const owner = new Map<string, string>();
  const claim = (slug: string, what: string, path: Path) => {
    const taken = owner.get(slug);
    if (taken) ctx.addIssue({ code: "custom", message: `Đường dẫn «${slug}» đang bị dùng hai lần (${taken} và ${what}).`, path });
    else owner.set(slug, what);
  };
  product.shapes.forEach((shape, i) => {
    claim(shape.slug, `hình dạng ${i + 1}`, ["shapes", i, "slug"]);
    shape.aliases.forEach((alias, a) => claim(alias, `bí danh của hình dạng ${i + 1}`, ["shapes", i, "aliases", a]));
  });
  product.options.forEach((option, i) => {
    claim(option.slug, `tùy chọn ${i + 1}`, ["options", i, "slug"]);
    option.aliases.forEach((alias, a) => claim(alias, `bí danh của tùy chọn ${i + 1}`, ["options", i, "aliases", a]));
  });
}

function checkIdentity(product: ProductBase, ctx: z.RefinementCtx): void {
  const uids = [product.uid, ...product.shapes.map((s) => s.uid), ...product.options.map((o) => o.uid)];
  for (const uid of duplicates(uids, (value) => value)) {
    ctx.addIssue({ code: "custom", message: `Mã định danh ${uid} bị trùng trong sản phẩm.`, path: ["uid"] });
  }
  const own = `${product.category}/${product.slug}`;
  const aliasKeys = product.aliases.map((a) => `${a.category}/${a.slug}`);
  if (aliasKeys.includes(own)) ctx.addIssue({ code: "custom", message: "Đường dẫn chính không thể đồng thời là bí danh.", path: ["aliases"] });
  for (const key of duplicates(aliasKeys, (value) => value)) {
    ctx.addIssue({ code: "custom", message: `Bí danh «${key}» bị trùng.`, path: ["aliases"] });
  }
}

function checkChildren(product: ProductBase, ctx: z.RefinementCtx): void {
  const shapeUids = new Set(product.shapes.map((s) => s.uid));
  product.shapes.forEach((shape, i) => requireDefaultLocale(shape.i18n, ctx, ["shapes", i]));
  for (const position of duplicates(product.shapes, (s) => String(s.position))) {
    ctx.addIssue({ code: "custom", message: `Vị trí hình dạng ${position} bị trùng.`, path: ["shapes"] });
  }
  product.options.forEach((option, i) => {
    if (option.i18n.vi?.name === undefined) {
      ctx.addIssue({ code: "custom", message: "Tùy chọn cần có tên tiếng Việt.", path: ["options", i, "i18n", "vi", "name"] });
    }
    if (option.shape !== null && !shapeUids.has(option.shape)) {
      ctx.addIssue({ code: "custom", message: "Tùy chọn trỏ tới hình dạng không có trong sản phẩm.", path: ["options", i, "shape"] });
    }
    for (const kind of BULLET_KIND_VALUES) {
      const repeated = duplicates(option.bullets.filter((b) => b.kind === kind), (b) => String(b.position));
      if (repeated.size > 0) ctx.addIssue({ code: "custom", message: `Vị trí gạch đầu dòng (${kind}) bị trùng.`, path: ["options", i, "bullets"] });
    }
  });
  product.sizes.forEach((size, i) => {
    if (size.shape !== null && !shapeUids.has(size.shape)) {
      ctx.addIssue({ code: "custom", message: "Kích thước trỏ tới hình dạng không có trong sản phẩm.", path: ["sizes", i, "shape"] });
    }
  });
  product.specs.forEach((spec, i) => {
    if (spec.shape !== null && !shapeUids.has(spec.shape)) {
      ctx.addIssue({ code: "custom", message: "Thông số trỏ tới hình dạng không có trong sản phẩm.", path: ["specs", i, "shape"] });
    }
  });
  if (duplicates(product.sizes, (s) => `${s.shape}|${s.tier}`).size > 0) {
    ctx.addIssue({ code: "custom", message: "Mỗi hạng kích thước chỉ được xuất hiện một lần cho mỗi phạm vi.", path: ["sizes"] });
  }
  if (duplicates(product.specs, (s) => `${s.shape}|${s.kind}|${s.item}`).size > 0) {
    ctx.addIssue({ code: "custom", message: "Một thông số bị thêm hai lần trong cùng phạm vi.", path: ["specs"] });
  }
}

/** Rules that span fields. The database repeats the hard ones as constraints; these give field-level messages first. */
export const productDocumentSchema = productBase.superRefine((product, ctx) => {
  requireDefaultLocale(product.i18n, ctx, []);
  checkIdentity(product, ctx);
  checkSegmentNamespace(product, ctx);
  checkChildren(product, ctx);
});

export type ProductDocument = z.infer<typeof productDocumentSchema>;
