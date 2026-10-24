"use client";

import { moveGroupItem, productTargets, removeItem, setItemTarget, type MenuGroup } from "@/lib/content/editor/menu-ops";
import { ListCard } from "../../list-card";
import { MediaField } from "../../media-field";
import { SwitchField, TextField } from "../../fields";
import { TargetField } from "./target-field";
import { useMenu } from "./use-menu";

type ItemRowProps = { columnIndex: number; groupIndex: number; itemIndex: number; group: MenuGroup };

/** One link of a group: what it points at, the text it shows (blank = the target's own name), an «In nhanh» tag and an image. */
export function ItemRow({ columnIndex, groupIndex, itemIndex, group }: Readonly<ItemRowProps>) {
  const { editor, apply } = useMenu();
  const item = group.items[itemIndex];
  const base = `columns[${columnIndex}].groups[${groupIndex}].items[${itemIndex}]`;
  const { shapes, options } = productTargets(editor.vocab, group.product);
  const key = "shape" in item.target ? item.target.shape : item.target.option;
  const targetName = [...shapes, ...options].find((entry) => entry.value === key)?.label ?? "(không còn tồn tại)";

  return (
    <ListCard
      title={item.i18n[editor.language] ?? item.i18n.vi ?? targetName}
      subtitle={`${"shape" in item.target ? "Hình thức" : "Chất liệu"}: ${targetName}${item.isFast ? " · In nhanh" : ""}`}
      path={base}
      canMoveUp={itemIndex > 0}
      canMoveDown={itemIndex < group.items.length - 1}
      onMove={(step) => apply((current) => moveGroupItem(current, group.product, itemIndex, step))}
      onRemove={() => apply((current) => removeItem(current, group.product, itemIndex))}
      removeLabel="Xóa mục"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <TargetField base={base} product={group.product} target={item.target} onTarget={(target) => apply((current) => setItemTarget(current, group.product, itemIndex, target))} />
        <TextField path={`${base}.i18n.*`} hint="Để trống thì dùng tên của hình thức hoặc chất liệu." />
        <MediaField path={`${base}.image`} hint="Để trống thì dùng ảnh của hình thức (hoặc ảnh bìa sản phẩm)." />
        <SwitchField path={`${base}.isFast`} />
      </div>
    </ListCard>
  );
}
