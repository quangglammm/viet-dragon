export interface VocabOption {
  value: string;
  label: string;
  /** What the option belongs to: a shape's or option's product uid, so a menu picks among one product's targets. */
  group?: string;
}

/** Lists the editors pick from: the other records a field may refer to. Loaded by the page, never fetched by a control. */
export type Vocabulary = Partial<Record<"category" | "material" | "trait" | "unit" | "spec_item" | "post_category" | "product" | "shape" | "option", VocabOption[]>>;
