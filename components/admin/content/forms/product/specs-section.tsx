"use client";

import { Plus } from "lucide-react";
import { BUTTON_SECONDARY } from "@/components/admin/page-parts";
import { addSpec, moveSpec, removeSpec, setSpecKind } from "@/lib/content/editor/product-ops";
import type { VocabOption } from "@/lib/content/editor/vocabulary";
import { ListCard } from "../../list-card";
import { NumberField, SelectField } from "../../fields";
import { scopeOptions, scopes, shapeName, useProduct, WHOLE_PRODUCT } from "./use-product";

const KINDS = [
  { value: "technique", label: "Kỹ thuật in" },
  { value: "finishing", label: "Hoàn thiện" },
  { value: "material_hint", label: "Chất liệu phổ biến" },
] as const;

/** The three lists on a product card (printing techniques, finishing, popular materials), per scope, drawn from the shared spec items. */
export function SpecsSection() {
  const { editor, product, apply } = useProduct();
  const itemsOfKind = (kind: string): VocabOption[] =>
    (editor.vocab.spec_item ?? []).filter((item) => item.value.startsWith(`${kind}/`)).map((item) => ({ value: item.value.slice(kind.length + 1), label: item.label }));
  const labelOf = (kind: string, item: string) => itemsOfKind(kind).find((entry) => entry.value === item)?.label ?? (item || "Chưa chọn");

  return (
    <div className="space-y-6">
      <p className="text-xs text-slate-500">Chọn từ danh sách thông số dùng chung (thêm mới ở mục «Thông số in»). Một thông số của hình thức thay cho danh sách chung.</p>
      {scopes(product, editor.language).map((scope) => (
        <section key={scope.shape ?? "whole"} className="space-y-4">
          <h3 className="text-sm font-black text-slate-900">{scope.title}</h3>
          {KINDS.map((kind) => {
            const rows = product.specs.map((spec, index) => ({ spec, index })).filter(({ spec }) => spec.shape === scope.shape && spec.kind === kind.value);
            return (
              <div key={kind.value} className="space-y-2">
                <p className="text-xs font-bold text-slate-600">{kind.label}</p>
                {rows.map(({ spec, index }, place) => (
                  <ListCard
                    key={`${spec.kind}:${spec.item}:${index}`}
                    title={labelOf(spec.kind, spec.item)}
                    path={`specs[${index}]`}
                    canMoveUp={place > 0}
                    canMoveDown={place < rows.length - 1}
                    onMove={(step) => apply((current) => moveSpec(current, index, step))}
                    onRemove={() => apply((current) => removeSpec(current, index))}
                    removeLabel="Xóa thông số"
                  >
                    <div className="grid gap-4 md:grid-cols-4">
                      <SelectField path={`specs[${index}].kind`} options={KINDS} onValue={(next) => next && apply((current) => setSpecKind(current, index, next as (typeof KINDS)[number]["value"]))} />
                      <div className="md:col-span-2"><SelectField path={`specs[${index}].item`} options={itemsOfKind(spec.kind)} required /></div>
                      <SelectField path={`specs[${index}].shape`} options={scopeOptions(product, editor.language)} nullable nullLabel={WHOLE_PRODUCT} hint={spec.shape ? `Của ${shapeName(product.shapes.find((s) => s.uid === spec.shape) ?? product.shapes[0], editor.language)}` : undefined} />
                      <NumberField path={`specs[${index}].position`} />
                    </div>
                  </ListCard>
                ))}
                {!editor.readOnly && (
                  <button type="button" onClick={() => apply((current) => addSpec(current, scope.shape, kind.value))} className={BUTTON_SECONDARY}>
                    <Plus size={14} aria-hidden /> Thêm {kind.label.toLowerCase()}
                  </button>
                )}
              </div>
            );
          })}
        </section>
      ))}
    </div>
  );
}
