import type { DraftEntityType } from "@/lib/db/content/drafts";
import type { DocumentFor } from "../schemas";
import { categoryApplier } from "./category";
import { materialApplier, postCategoryApplier, specItemApplier, traitApplier, unitApplier } from "./library";
import { fastPrintItemApplier, showcaseItemApplier } from "./merchandising";
import { menuApplier } from "./menu";
import { postApplier } from "./post";
import { productApplier } from "./product";
import { siteMessageApplier } from "./site-message";
import type { Applier, Appliers } from "./types";

export type { Applier, ApplyContext } from "./types";

/** One applier per entity type that can be published. */
const APPLIERS: Appliers = {
  product: productApplier,
  menu: menuApplier,
  post: postApplier,
  category: categoryApplier,
  material: materialApplier,
  trait: traitApplier,
  unit: unitApplier,
  spec_item: specItemApplier,
  fast_print_item: fastPrintItemApplier,
  showcase_item: showcaseItemApplier,
  post_category: postCategoryApplier,
  site_message: siteMessageApplier,
};

export function applierFor<T extends DraftEntityType>(type: T): Applier<DocumentFor<T>> {
  // Indexing by a generic key leaves TypeScript with the union of all appliers; the return type restores the pairing.
  return APPLIERS[type] as Applier<DocumentFor<T>>;
}
