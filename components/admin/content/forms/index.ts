import type { ComponentType } from "react";
import type { DraftEntityType } from "@/lib/content/entity-types";
import { MaterialForm, PostCategoryForm, SpecItemForm, TraitForm, UnitForm } from "./library-forms";
import { FastPrintForm, ShowcaseForm } from "./merchandising-forms";

/** The form of each entity type, drawn inside an <EditorProvider>. A type without one has no editor yet (its pages answer 404). */
export const FORMS: Partial<Record<DraftEntityType, ComponentType>> = {
  material: MaterialForm,
  trait: TraitForm,
  unit: UnitForm,
  spec_item: SpecItemForm,
  post_category: PostCategoryForm,
  fast_print_item: FastPrintForm,
  showcase_item: ShowcaseForm,
};
