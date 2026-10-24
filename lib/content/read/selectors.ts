import type { OptionView, ProductView, ShapeView, SizeView, SpecView } from "./types";

// Which rows of a product a page shows. The rule is the same everywhere: what is scoped to a shape REPLACES what the product offers
// as a whole, for that shape (docs/data-model.md §5). Pure and client-safe.

const TIER_ORDER = { large: 0, medium: 1, small: 2 } as const;

const byPosition = <T extends { position: number }>(a: T, b: T): number => a.position - b.position;

/** The options of a shape page: the shape's own, or — when it has none — the product's. */
export function optionsForShape(product: ProductView, shape: string | null): OptionView[] {
  const own = shape === null ? [] : product.options.filter((option) => option.shape === shape).sort(byPosition);
  return own.length > 0 ? own : product.options.filter((option) => option.shape === null).sort(byPosition);
}

/** The options of a product page, and of a material page: the product's own, or — when it has none — every option of every shape. */
export function optionsForProduct(product: ProductView): OptionView[] {
  const own = product.options.filter((option) => option.shape === null).sort(byPosition);
  return own.length > 0 ? own : [...product.options].sort(byPosition);
}

/** The standard sizes of a shape (or of the product when `shape` is null): the shape's rows replace the product's whole set. */
export function sizesFor(product: ProductView, shape: string | null): SizeView[] {
  const own = shape === null ? [] : product.sizes.filter((size) => size.shape === shape);
  const rows = own.length > 0 ? own : product.sizes.filter((size) => size.shape === null);
  return [...rows].sort((a, b) => TIER_ORDER[a.tier] - TIER_ORDER[b.tier]);
}

/** One list of a card (printing techniques, finishing, popular materials) for a shape: replaced per kind, like sizes. */
export function specsFor(product: ProductView, shape: string | null, kind: SpecView["kind"]): SpecView[] {
  const ofKind = product.specs.filter((spec) => spec.kind === kind);
  const own = shape === null ? [] : ofKind.filter((spec) => spec.shape === shape);
  return [...(own.length > 0 ? own : ofKind.filter((spec) => spec.shape === null))].sort(byPosition);
}

export const shapeOf = (product: ProductView, uid: string | null): ShapeView | undefined => (uid === null ? undefined : product.shapes.find((shape) => shape.uid === uid));
