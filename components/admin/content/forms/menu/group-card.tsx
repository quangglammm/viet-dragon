"use client";

import { Plus } from "lucide-react";
import { BUTTON_SECONDARY, INPUT_CLASS } from "@/components/admin/page-parts";
import { addItem, moveGroup, moveGroupToColumn, nextTarget, removeGroup, type MenuGroup } from "@/lib/content/editor/menu-ops";
import { ListCard } from "../../list-card";
import { MediaField } from "../../media-field";
import { SelectField, TextField } from "../../fields";
import { ItemRow } from "./item-row";
import { productLabel, useMenu } from "./use-menu";

type GroupCardProps = {
  columnIndex: number;
  groupIndex: number;
  group: MenuGroup;
  /** How many groups the column holds (to know whether a move up or down is possible). */
  groupCount: number;
  open: boolean;
  onToggle: () => void;
  /** Opens this group (called after an item was added to it). */
  onShow: () => void;
};

/** The block of one product in the menu: its heading and picture, and the links under it. */
export function GroupCard({ columnIndex, groupIndex, group, groupCount, open, onToggle, onShow }: Readonly<GroupCardProps>) {
  const { editor, menu, apply } = useMenu();
  const base = `columns[${columnIndex}].groups[${groupIndex}]`;
  const target = nextTarget(menu, editor.vocab, group.product);
  const otherColumns = menu.columns.map((column, index) => ({ column, index })).filter(({ index }) => index !== columnIndex);

  return (
    <ListCard
      title={productLabel(editor.vocab, group.product)}
      subtitle={`${group.items.length} mục`}
      path={base}
      open={open}
      onToggle={onToggle}
      canMoveUp={groupIndex > 0}
      canMoveDown={groupIndex < groupCount - 1}
      onMove={(step) => apply((current) => moveGroup(current, group.product, step))}
      onRemove={() => apply((current) => removeGroup(current, group.product))}
      removeLabel="Gỡ sản phẩm khỏi menu"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <SelectField path={`${base}.product`} options="product" locked hint="Không đổi được: muốn đổi sản phẩm, hãy gỡ nhóm này và thêm nhóm khác." />
        {otherColumns.length > 0 && !editor.readOnly && (
          <label className="block space-y-1.5 text-xs font-bold text-slate-700">
            Chuyển sang cột khác
            <select value="" onChange={(event) => event.target.value !== "" && apply((current) => moveGroupToColumn(current, group.product, Number(event.target.value)))} className={INPUT_CLASS}>
              <option value="">— Chọn cột —</option>
              {otherColumns.map(({ column, index }) => (
                <option key={column.column} value={index}>Cột {column.column}</option>
              ))}
            </select>
          </label>
        )}
        <TextField path={`${base}.i18n.*.label`} hint="Để trống thì dùng tên sản phẩm." />
        <MediaField path={`${base}.image`} hint="Để trống thì dùng ảnh bìa của sản phẩm." />
        <div className="md:col-span-2"><TextField path={`${base}.i18n.*.description`} multiline hint="Để trống thì dùng mô tả sản phẩm (trang danh mục «Ấn phẩm Tết» hiện dòng này)." /></div>
      </div>
      <div className="space-y-2">
        <p className="text-xs font-black text-slate-700">Các mục trong nhóm</p>
        {group.items.map((_, itemIndex) => (
          <ItemRow key={itemIndex} columnIndex={columnIndex} groupIndex={groupIndex} itemIndex={itemIndex} group={group} />
        ))}
        {group.items.length === 0 && <p className="text-[11px] font-semibold text-slate-400">Nhóm này chưa có mục nào: chỉ hiện tên sản phẩm.</p>}
        {!editor.readOnly && (
          <button
            type="button"
            disabled={target === null}
            title={target === null ? "Sản phẩm này chưa có hình thức hoặc chất liệu đã xuất bản." : undefined}
            onClick={() => {
              if (target === null) return;
              apply((current) => addItem(current, group.product, target));
              onShow();
            }}
            className={BUTTON_SECONDARY}
          >
            <Plus size={14} aria-hidden /> Thêm mục
          </button>
        )}
      </div>
    </ListCard>
  );
}
