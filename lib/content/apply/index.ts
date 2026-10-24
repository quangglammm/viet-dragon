import type { DraftEntityType } from "@/lib/db/content/drafts";
import type { DocumentFor } from "../schemas";
import { menuApplier } from "./menu";
import { productApplier } from "./product";
import type { Applier, Appliers } from "./types";

export type { Applier, ApplyContext } from "./types";

/** One applier per entity type that can be published. */
const APPLIERS: Appliers = {
  product: productApplier,
  menu: menuApplier,
};

export function applierFor<T extends DraftEntityType>(type: T): Applier<DocumentFor<T>> | undefined {
  // Indexing by a generic key leaves TypeScript with the union of all appliers; the return type restores the pairing.
  return APPLIERS[type] as Applier<DocumentFor<T>> | undefined;
}
