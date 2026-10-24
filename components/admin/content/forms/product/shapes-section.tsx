"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Modal } from "@/components/admin/modal";
import { BUTTON_DANGER, BUTTON_SECONDARY } from "@/components/admin/page-parts";
import { addShape, moveShape, removeShape, scopedToShape, setChildSlug } from "@/lib/content/editor/product-ops";
import { suggestSlugs } from "@/lib/content/editor/slugs";
import { AliasList } from "../../alias-list";
import { ListCard } from "../../list-card";
import { MediaField } from "../../media-field";
import { SlugField } from "../../slug-field";
import { NumberField, TextField } from "../../fields";
import type { FocusRequest } from "../../editor-context";
import { ChildNameField } from "./name-field";
import { useOpenCards } from "./use-open-cards";
import { shapeName, useProduct } from "./use-product";

type ShapesSectionProps = { expandAll?: boolean; focus?: FocusRequest | null };

export function ShapesSection({ expandAll = false, focus = null }: Readonly<ShapesSectionProps>) {
  const { editor, product, apply } = useProduct();
  const { isOpen, toggle, show } = useOpenCards("shapes", product.shapes, focus);
  const [removing, setRemoving] = useState<string | null>(null);
  const removed = product.shapes.find((shape) => shape.uid === removing);
  const withShape = removed ? scopedToShape(product, removed.uid) : null;

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">Các hình thức (khổ, kiểu dáng) của sản phẩm. Mỗi hình thức có thể có chất liệu, kích thước và thông số riêng.</p>
      {product.shapes.map((shape, index) => (
        <ListCard
          key={shape.uid}
          title={shapeName(shape, editor.language)}
          subtitle={`Thứ tự ${shape.position + 1}`}
          path={`shapes[${index}]`}
          open={expandAll || isOpen(shape.uid)}
          onToggle={() => toggle(shape.uid)}
          canMoveUp={index > 0}
          canMoveDown={index < product.shapes.length - 1}
          onMove={(step) => apply((current) => moveShape(current, shape.uid, step))}
          onRemove={() => setRemoving(shape.uid)}
          removeLabel="Xóa hình thức"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <ChildNameField kind="shapes" uid={shape.uid} path={`shapes[${index}].i18n.*.name`} />
            <TextField path={`shapes[${index}].i18n.*.badge`} hint="Nhãn nhỏ trên thẻ, ví dụ «Mới»." />
            <div className="md:col-span-2"><TextField path={`shapes[${index}].i18n.*.description`} multiline /></div>
            <MediaField path={`shapes[${index}].image`} />
            <NumberField path={`shapes[${index}].position`} hint="Thứ tự (đổi bằng nút mũi tên)." />
          </div>
          <div className="space-y-3 rounded-2xl bg-slate-50 p-3">
            <SlugField
              path={`shapes[${index}].slugs.*.slug`}
              onSlug={(slug) => apply((current) => setChildSlug(current, "shapes", shape.uid, editor.language, slug))}
              suggestion={suggestSlugs({ vi: shape.i18n.vi?.name, en: shape.i18n.en?.name })[editor.language]}
            />
            <AliasList path={`shapes[${index}].slugs.*.aliases`} onRelease={editor.releaseAlias} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <TextField path={`shapes[${index}].i18n.*.seoTitle`} maxLength={70} />
            <MediaField path={`shapes[${index}].ogImage`} imageOnly />
            <div className="md:col-span-2"><TextField path={`shapes[${index}].i18n.*.seoDescription`} multiline maxLength={170} /></div>
          </div>
        </ListCard>
      ))}
      {product.shapes.length === 0 && <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-xs font-semibold text-slate-400">Sản phẩm này chưa có hình thức nào.</p>}
      {!editor.readOnly && (
        <button type="button" onClick={() => show(apply((current) => addShape(current)).shapes.at(-1)?.uid ?? "")} className={BUTTON_SECONDARY}>
          <Plus size={14} aria-hidden /> Thêm hình thức
        </button>
      )}
      {removed && withShape && (
        <Modal title="Xóa hình thức?" description={`«${shapeName(removed, editor.language)}» sẽ bị xóa khỏi bản nháp.`} onClose={() => setRemoving(null)}>
          {withShape.options + withShape.sizes + withShape.specs > 0 && (
            <p className="mb-4 text-xs font-semibold text-amber-800">
              Cũng sẽ xóa những gì chỉ thuộc hình thức này: {withShape.options} chất liệu, {withShape.sizes} kích thước, {withShape.specs} thông số. Hình thức còn trong menu thì không xuất bản được cho đến khi gỡ khỏi menu.
            </p>
          )}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setRemoving(null)} className={BUTTON_SECONDARY}>Giữ lại</button>
            <button type="button" onClick={() => { apply((current) => removeShape(current, removed.uid)); setRemoving(null); }} className={BUTTON_DANGER}>Xóa hình thức</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
