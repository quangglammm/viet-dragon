"use client";

import { useState } from "react";
import { Modal } from "@/components/admin/modal";
import { BUTTON_DANGER, BUTTON_SECONDARY, INPUT_CLASS } from "@/components/admin/page-parts";
import { addGroup, moveColumn, removeColumn, unusedProducts, type MenuColumn } from "@/lib/content/editor/menu-ops";
import { ListCard } from "../../list-card";
import { NumberField } from "../../fields";
import { GroupCard } from "./group-card";
import { useMenu } from "./use-menu";

type ColumnCardProps = {
  index: number;
  column: MenuColumn;
  isOpen: (product: string) => boolean;
  toggle: (product: string) => void;
  show: (product: string) => void;
  /** Opens every group (the coverage test draws all of them). */
  expandAll?: boolean;
};

/** One column of the mega-menu: the groups under it, and a way to add the products that are not in the menu yet. */
export function ColumnCard({ index, column, isOpen, toggle, show, expandAll = false }: Readonly<ColumnCardProps>) {
  const { editor, menu, apply } = useMenu();
  const [removing, setRemoving] = useState(false);
  const free = unusedProducts(menu, editor.vocab.product ?? []);

  return (
    <>
      <ListCard
        title={`Cột ${column.column}`}
        subtitle={`${column.groups.length} sản phẩm`}
        path={`columns[${index}]`}
        canMoveUp={index > 0}
        canMoveDown={index < menu.columns.length - 1}
        onMove={(step) => apply((current) => moveColumn(current, index, step))}
        onRemove={() => (column.groups.length === 0 ? apply((current) => removeColumn(current, index)) : setRemoving(true))}
        removeLabel="Xóa cột"
      >
        <NumberField path={`columns[${index}].column`} locked hint="Tự đánh số theo thứ tự các cột." />
        <div className="space-y-3">
          {column.groups.map((group, groupIndex) => (
            <GroupCard
              key={group.product}
              columnIndex={index}
              groupIndex={groupIndex}
              group={group}
              groupCount={column.groups.length}
              open={expandAll || isOpen(group.product)}
              onToggle={() => toggle(group.product)}
              onShow={() => show(group.product)}
            />
          ))}
          {column.groups.length === 0 && <p className="text-[11px] font-semibold text-slate-400">Cột này chưa có sản phẩm nào: hãy thêm sản phẩm hoặc xóa cột (cột trống không được lưu).</p>}
        </div>
        {!editor.readOnly && (
          <label className="block space-y-1.5 text-xs font-bold text-slate-700">
            Thêm sản phẩm vào cột này
            <select
              value=""
              disabled={free.length === 0}
              onChange={(event) => {
                if (event.target.value === "") return;
                apply((current) => addGroup(current, index, event.target.value));
                show(event.target.value);
              }}
              className={INPUT_CLASS}
            >
              <option value="">{free.length === 0 ? "Mọi sản phẩm của danh mục đã có trong menu" : "— Chọn sản phẩm —"}</option>
              {free.map((product) => (
                <option key={product.value} value={product.value}>{product.label}</option>
              ))}
            </select>
          </label>
        )}
      </ListCard>
      {removing && (
        <Modal title="Xóa cột?" description={`Cột ${column.column} có ${column.groups.length} sản phẩm; xóa cột sẽ gỡ chúng khỏi menu (sản phẩm vẫn còn trên website).`} onClose={() => setRemoving(false)}>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setRemoving(false)} className={BUTTON_SECONDARY}>Giữ lại</button>
            <button type="button" onClick={() => { apply((current) => removeColumn(current, index)); setRemoving(false); }} className={BUTTON_DANGER}>Xóa cột</button>
          </div>
        </Modal>
      )}
    </>
  );
}
