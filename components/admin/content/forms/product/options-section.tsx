"use client";

import { Plus } from "lucide-react";
import { BUTTON_SECONDARY } from "@/components/admin/page-parts";
import { addOption, moveOption, removeOption } from "@/lib/content/editor/product-ops";
import type { FocusRequest } from "../../editor-context";
import { ListCard } from "../../list-card";
import { OptionCard } from "./option-card";
import { useOpenCards } from "./use-open-cards";
import { scopes, shapeName, useProduct } from "./use-product";

/** The materials the product offers, grouped by where they are offered: the whole product, then each shape. */
type OptionsSectionProps = { expandAll?: boolean; focus?: FocusRequest | null };

export function OptionsSection({ expandAll = false, focus = null }: Readonly<OptionsSectionProps>) {
  const { editor, product, apply } = useProduct();
  const { isOpen, toggle, show } = useOpenCards("options", product.options, focus);
  const materialLabel = (value: string) => editor.vocab.material?.find((material) => material.value === value)?.label ?? (value || "Chưa chọn chất liệu");

  return (
    <div className="space-y-6">
      <p className="text-xs text-slate-500">Mỗi dòng là một chất liệu mà sản phẩm cung cấp, với giá, nội dung thẻ và ảnh riêng. Bấm vào dòng để mở.</p>
      {scopes(product, editor.language).map((scope) => {
        const inScope = product.options.map((option, index) => ({ option, index })).filter(({ option }) => option.shape === scope.shape);
        return (
          <section key={scope.shape ?? "whole"} className="space-y-3">
            <h3 className="text-sm font-black text-slate-900">{scope.title} <span className="font-semibold text-slate-400">({inScope.length})</span></h3>
            {inScope.map(({ option, index }, place) => (
              <ListCard
                key={option.uid}
                title={option.i18n[editor.language]?.name ?? option.i18n.vi?.name ?? materialLabel(option.material)}
                subtitle={materialLabel(option.material)}
                path={`options[${index}]`}
                open={expandAll || isOpen(option.uid)}
                onToggle={() => toggle(option.uid)}
                canMoveUp={place > 0}
                canMoveDown={place < inScope.length - 1}
                onMove={(step) => apply((current) => moveOption(current, option.uid, step))}
                onRemove={() => apply((current) => removeOption(current, option.uid))}
                removeLabel="Xóa chất liệu"
              >
                <OptionCard index={index} />
              </ListCard>
            ))}
            {inScope.length === 0 && <p className="text-[11px] font-semibold text-slate-400">Chưa có chất liệu nào.</p>}
            {!editor.readOnly && (
              <button type="button" onClick={() => show(apply((current) => addOption(current, scope.shape)).options.at(-1)?.uid ?? "")} className={BUTTON_SECONDARY}>
                <Plus size={14} aria-hidden /> Thêm chất liệu{scope.shape ? ` cho ${shapeName(product.shapes.find((s) => s.uid === scope.shape)!, editor.language)}` : ""}
              </button>
            )}
          </section>
        );
      })}
    </div>
  );
}
