import { z } from "zod";
import { DOCUMENT_SCHEMA, mediaKeySchema, nonblankText, perLocale, slugSchema, uidSchema } from "./common";

// The mega-menu of ONE category (docs/data-model.md §4 "Menus"): columns → groups (one per product) → items
// (a shape or an option of that product). Labels, descriptions and images are overrides; absent = use the target's.
// Positions are the array order (columns, groups within a column, items within a group), not stored fields.

const menuItem = z.strictObject({
  /** Exactly one of shape / option, by uid. Link style follows the target: shape → #hash, option → path segment. */
  target: z.union([z.strictObject({ shape: uidSchema }), z.strictObject({ option: uidSchema })]),
  isFast: z.boolean(),
  image: mediaKeySchema.nullable(),
  i18n: perLocale(nonblankText),
});

const menuGroup = z.strictObject({
  /** Product uid. */
  product: uidSchema,
  image: mediaKeySchema.nullable(),
  i18n: perLocale(
    z
      .strictObject({ label: nonblankText.optional(), description: nonblankText.optional() })
      .refine((row) => row.label !== undefined || row.description !== undefined, "Cần nhập tên hoặc mô tả."),
  ),
  items: z.array(menuItem),
});

const menuColumn = z.strictObject({
  column: z.int().positive(),
  groups: z.array(menuGroup),
});

export const menuDocumentSchema = z
  .strictObject({
    schema: z.literal(DOCUMENT_SCHEMA),
    /** The category id: the document's immutable key. */
    key: slugSchema,
    category: slugSchema,
    columns: z.array(menuColumn),
  })
  .superRefine((menu, ctx) => {
    if (menu.key !== menu.category) ctx.addIssue({ code: "custom", message: "Khóa của menu phải trùng với danh mục.", path: ["key"] });
    const seenColumns = new Set<number>();
    const seenProducts = new Set<string>();
    menu.columns.forEach((column, c) => {
      if (seenColumns.has(column.column)) ctx.addIssue({ code: "custom", message: `Cột ${column.column} bị trùng.`, path: ["columns", c, "column"] });
      seenColumns.add(column.column);
      column.groups.forEach((group, g) => {
        if (seenProducts.has(group.product)) {
          ctx.addIssue({ code: "custom", message: "Một sản phẩm chỉ xuất hiện một lần trong menu.", path: ["columns", c, "groups", g, "product"] });
        }
        seenProducts.add(group.product);
      });
    });
  });

export type MenuDocument = z.infer<typeof menuDocumentSchema>;
