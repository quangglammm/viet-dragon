"use client";

import { Plus } from "lucide-react";
import { BUTTON_SECONDARY } from "@/components/admin/page-parts";
import { addSize, hasFreeTier, removeSize } from "@/lib/content/editor/product-ops";
import { ListCard } from "../../list-card";
import { NumberField, SelectField, TextField } from "../../fields";
import { scopeOptions, scopes, shapeName, useProduct, WHOLE_PRODUCT } from "./use-product";

const TIERS = [
  { value: "large", label: "Lớn" },
  { value: "medium", label: "Vừa" },
  { value: "small", label: "Nhỏ" },
] as const;

/** Standard sizes: up to three tiers per scope; a shape's own sizes replace the whole product's. */
export function SizesSection() {
  const { editor, product, apply } = useProduct();
  const tierLabel = (tier: string) => TIERS.find((entry) => entry.value === tier)?.label ?? tier;

  return (
    <div className="space-y-6">
      <p className="text-xs text-slate-500">Nhập rộng × cao (mm, thêm chiều sâu nếu có), hoặc mô tả bằng chữ như «Size L - XL» — không nhập cả hai. Kích thước của một hình thức thay cho kích thước chung.</p>
      {scopes(product, editor.language).map((scope) => {
        const inScope = product.sizes.map((size, index) => ({ size, index })).filter(({ size }) => size.shape === scope.shape);
        return (
          <section key={scope.shape ?? "whole"} className="space-y-3">
            <h3 className="text-sm font-black text-slate-900">{scope.title}</h3>
            {inScope.map(({ size, index }) => (
              <ListCard
                key={`${size.shape}:${size.tier}`}
                title={`Hạng ${tierLabel(size.tier)}`}
                subtitle={size.text ?? (size.w && size.h ? `${size.w} × ${size.h}${size.d ? ` × ${size.d}` : ""} mm` : "Chưa nhập")}
                path={`sizes[${index}]`}
                onRemove={() => apply((current) => removeSize(current, index))}
                removeLabel="Xóa kích thước"
              >
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <SelectField path={`sizes[${index}].tier`} options={TIERS} />
                  <SelectField path={`sizes[${index}].shape`} options={scopeOptions(product, editor.language)} nullable nullLabel={WHOLE_PRODUCT} hint={size.shape ? `Của ${shapeName(product.shapes.find((s) => s.uid === size.shape) ?? product.shapes[0], editor.language)}` : undefined} />
                  <NumberField path={`sizes[${index}].w`} nullable suffix="mm" min={1} />
                  <NumberField path={`sizes[${index}].h`} nullable suffix="mm" min={1} />
                  <NumberField path={`sizes[${index}].d`} nullable suffix="mm" min={1} />
                  <div className="sm:col-span-2"><TextField path={`sizes[${index}].text`} hint="Thay cho rộng × cao." /></div>
                  <div className="sm:col-span-2 lg:col-span-4"><TextField path={`sizes[${index}].i18n.*`} /></div>
                </div>
              </ListCard>
            ))}
            {!editor.readOnly && (
              <button type="button" disabled={!hasFreeTier(product, scope.shape)} onClick={() => apply((current) => addSize(current, scope.shape))} className={BUTTON_SECONDARY}>
                <Plus size={14} aria-hidden /> Thêm kích thước
              </button>
            )}
          </section>
        );
      })}
    </div>
  );
}
