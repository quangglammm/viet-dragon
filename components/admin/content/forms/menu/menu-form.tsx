"use client";

import { Plus } from "lucide-react";
import { BUTTON_SECONDARY } from "@/components/admin/page-parts";
import { addColumn, groupAtPath } from "@/lib/content/editor/menu-ops";
import { useOpenKeys } from "../../use-open-keys";
import { KeyBadge } from "../form-card";
import { ColumnCard } from "./column-card";
import { useMenu } from "./use-menu";

// The mega-menu of one category: columns, each holding the products (groups) shown in it, each with the links (items) under it.
// A product appears once in a menu. Group and item texts and images only OVERRIDE what the product, shape or option already has.

export function MenuForm({ expandAll = false }: Readonly<{ expandAll?: boolean }>) {
  const { editor, menu, apply } = useMenu();
  const { isOpen, toggle, show } = useOpenKeys((path) => groupAtPath(menu, path), editor.focus);

  return (
    <div className="space-y-4">
      <p className="text-xs leading-relaxed text-slate-500">
        Menu lớn hiện khi rê chuột vào danh mục trên website. Mỗi sản phẩm của danh mục có tối đa một nhóm; chữ và ảnh nhập ở đây chỉ thay cho tên và ảnh có sẵn của sản phẩm, hình thức hoặc chất liệu. Sản phẩm không có trong menu vẫn mở được bằng đường dẫn.
      </p>
      <KeyBadge label="Menu của danh mục" value={menu.category} />
      {menu.columns.map((column, index) => (
        <ColumnCard key={index} index={index} column={column} isOpen={isOpen} toggle={toggle} show={show} expandAll={expandAll} />
      ))}
      {menu.columns.length === 0 && <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-xs font-semibold text-slate-400">Menu này chưa có cột nào.</p>}
      {!editor.readOnly && (
        <button type="button" onClick={() => apply((current) => addColumn(current))} className={BUTTON_SECONDARY}>
          <Plus size={14} aria-hidden /> Thêm cột
        </button>
      )}
    </div>
  );
}
