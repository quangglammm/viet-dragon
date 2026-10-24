// What the seed noticed while importing: places where the data and the code disagree, or where something could not be
// carried over. The report (report.ts) turns these into the owner's decisions; nothing here fails the run.

export const NOTE_KINDS = [
  "media-stray",
  "media-unknown-extension",
  "media-unresolved",
  "category-description-differs",
  "icon-unknown",
  "fastprint-price-unparsed",
  "fastprint-price-differs-by-locale",
  "fastprint-tag-hours-inconsistent",
  "fastprint-price-wording",
  "material-name-conflict",
  "product-no-title",
  "product-no-description",
  "title-precedence-differs",
  "shared-translation-key",
  "slug-invalid",
  "shape-slug-duplicate",
  "option-slug-collision",
  "option-unit-ignored",
  "bullet-count-differs-by-locale",
  "traits-length-mismatch",
  "unknown-trait",
  "alias-invalid",
  "size-sub-mm",
  "size-label-unparseable",
  "spec-length-differs-by-locale",
  "spec-same-vi-different-translation",
  "menu-unresolved",
  "message-namespace-not-object",
] as const;
export type NoteKind = (typeof NOTE_KINDS)[number];

export class Notes {
  private readonly byKind = new Map<NoteKind, string[]>();

  add(kind: NoteKind, message: string): void {
    const list = this.byKind.get(kind);
    if (list) list.push(message);
    else this.byKind.set(kind, [message]);
  }

  get(kind: NoteKind): readonly string[] {
    return this.byKind.get(kind) ?? [];
  }

  count(kind: NoteKind): number {
    return this.get(kind).length;
  }
}
