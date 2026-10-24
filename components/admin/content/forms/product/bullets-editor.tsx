"use client";

import { Plus } from "lucide-react";
import { BUTTON_SECONDARY } from "@/components/admin/page-parts";
import { addBullet, moveBullet, removeBullet, setBulletKind } from "@/lib/content/editor/product-ops";
import { ListCard } from "../../list-card";
import { NumberField, SelectField, TextField } from "../../fields";
import { useProduct } from "./use-product";

const KINDS = [
  { value: "feature", label: "Đặc điểm (có biểu tượng)" },
  { value: "best_for", label: "Phù hợp cho" },
] as const;

/** The card's bullet lines: features (an icon and a text) and "best for" lines (a text), each ordered within its own kind. */
export function BulletsEditor({ optionIndex }: Readonly<{ optionIndex: number }>) {
  const { editor, product, apply } = useProduct();
  const option = product.options[optionIndex];
  const base = `options[${optionIndex}].bullets`;

  return (
    <div className="space-y-2">
      <p className="text-xs font-black text-slate-700">Đặc điểm & đối tượng phù hợp</p>
      {option.bullets.map((bullet, index) => {
        const sameKind = option.bullets.filter((other) => other.kind === bullet.kind);
        return (
          <ListCard
            key={`${bullet.kind}:${bullet.position}:${index}`}
            title={bullet.i18n[editor.language] ?? bullet.i18n.vi ?? "(chưa có nội dung)"}
            subtitle={bullet.kind === "feature" ? "Đặc điểm" : "Phù hợp cho"}
            path={`${base}[${index}]`}
            canMoveUp={bullet.position > 0}
            canMoveDown={bullet.position < sameKind.length - 1}
            onMove={(step) => apply((current) => moveBullet(current, option.uid, index, step))}
            onRemove={() => apply((current) => removeBullet(current, option.uid, index))}
            removeLabel="Xóa dòng"
          >
            <div className="grid gap-3 md:grid-cols-3">
              <SelectField path={`${base}[${index}].kind`} options={KINDS} onValue={(kind) => kind && apply((current) => setBulletKind(current, option.uid, index, kind as "feature" | "best_for"))} />
              <SelectField path={`${base}[${index}].trait`} options="trait" nullable nullLabel="— Không có biểu tượng —" hint={bullet.kind === "best_for" ? "Chỉ đặc điểm mới có biểu tượng." : undefined} />
              <NumberField path={`${base}[${index}].position`} />
              <div className="md:col-span-3"><TextField path={`${base}[${index}].i18n.*`} multiline rows={2} /></div>
            </div>
          </ListCard>
        );
      })}
      {!editor.readOnly && (
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => apply((current) => addBullet(current, option.uid, "feature"))} className={BUTTON_SECONDARY}><Plus size={14} aria-hidden /> Thêm đặc điểm</button>
          <button type="button" onClick={() => apply((current) => addBullet(current, option.uid, "best_for"))} className={BUTTON_SECONDARY}><Plus size={14} aria-hidden /> Thêm «phù hợp cho»</button>
        </div>
      )}
    </div>
  );
}
