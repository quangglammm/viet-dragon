import type { ComponentType } from "react";
import type { DraftEntityType } from "@/lib/content/entity-types";
import { CategoryForm } from "./category-form";
import { MaterialForm, PostCategoryForm, SpecItemForm, TraitForm, UnitForm } from "./library-forms";
import { FastPrintForm, ShowcaseForm } from "./merchandising-forms";
import { MenuForm } from "./menu/menu-form";
import { PostForm } from "./post-form";
import { ProductForm } from "./product/product-form";
import { SiteMessageForm } from "./site-message-form";

/** The form of each entity type, drawn inside an <EditorProvider>. A type without one has no editor yet (its pages answer 404). */
export const FORMS: Partial<Record<DraftEntityType, ComponentType>> = {
  product: ProductForm,
  post: PostForm,
  category: CategoryForm,
  menu: MenuForm,
  material: MaterialForm,
  trait: TraitForm,
  unit: UnitForm,
  spec_item: SpecItemForm,
  post_category: PostCategoryForm,
  fast_print_item: FastPrintForm,
  showcase_item: ShowcaseForm,
  site_message: SiteMessageForm,
};
