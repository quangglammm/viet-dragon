import { optionRecordFor, type OptionRecord, type ProductRecord, type ShapeRecord } from "./context";
import type { Sources } from "./sources";

// The product pages resolve the third URL segment (`/products/<category>/<product>/<segment>`) with their own logic:
// a shape id (through SHAPE_ALIASES), else a material by its Vietnamese or English slug. This is that logic, verbatim,
// pointed at the rows the seed wrote — so every segment the old pages accepted keeps resolving to the same target.

export type Resolution = { kind: "shape"; shape: ShapeRecord } | { kind: "option"; option: OptionRecord };

export function resolveSegment(src: Sources, product: ProductRecord, segment: string): Resolution | null {
  const sub = product.source;
  const resolvedId = src.shapeAliases[segment] ?? segment;
  const shape = sub.shapes.find((candidate) => candidate.id === segment || candidate.id === resolvedId);
  if (shape) {
    const record = product.shapes.find((s) => s.source === shape);
    return record ? { kind: "shape", shape: record } : null;
  }
  const materials = [...(sub.materials ?? []), ...sub.shapes.flatMap((s) => s.materials ?? [])];
  const material = materials.find((m) => {
    const vi = src.toSlug(m.nameVi);
    const en = src.toSlug(m.name);
    return vi === segment || vi === resolvedId || en === segment || en === resolvedId || src.shapeAliases[vi] === segment || src.shapeAliases[vi] === resolvedId;
  });
  const record = material ? optionRecordFor(product, material) : undefined;
  return record ? { kind: "option", option: record } : null;
}

/** The segment of a menu link: `/products/tet/to-roi/giay-c` → `giay-c`, `/products/tet/nhan-dan#decal` → `decal`. */
export function menuSegment(href: string): string | null {
  const match = href.match(/^\/products\/[^/#]+\/[^/#]+(?:\/([^/#]+))?(?:#(.+))?$/);
  return match?.[1] ?? match?.[2] ?? null;
}

/** Every segment worth trying for a product: all known aliases, every menu link's segment, its shape ids and material slugs. */
export function segmentCandidates(src: Sources, product: ProductRecord): Set<string> {
  const universe = new Set([...Object.keys(src.shapeAliases), ...Object.values(src.shapeAliases)]);
  for (const columns of Object.values(src.menus)) {
    for (const column of columns) {
      for (const group of column.groups) {
        for (const item of group.items) {
          const segment = menuSegment(item.href);
          if (segment) universe.add(segment);
        }
      }
    }
  }
  const sub = product.source;
  const materials = [...(sub.materials ?? []), ...sub.shapes.flatMap((s) => s.materials ?? [])];
  return new Set([...universe, ...sub.shapes.map((s) => s.id), ...materials.flatMap((m) => [src.toSlug(m.nameVi), src.toSlug(m.name)])]);
}

/** `<category>/<product>` pairs that some `/products/...` link in the source points at. */
export function linkedProductPaths(src: Sources): Set<string> {
  const paths = [...src.productLinks.keys()].map((href) => href.split("#")[0].split("/").filter(Boolean)).filter((parts) => parts.length >= 3);
  return new Set(paths.map((parts) => `${parts[1]}/${parts[2]}`));
}
