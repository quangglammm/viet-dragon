"use client";

import { useEditor } from "../editor-context";
import { IconField } from "../icon-field";
import { SwitchField, TextField } from "../fields";
import { FormCard, KeyBadge } from "./form-card";

// The shared vocabulary: what a record is called in each language, and (for some) the icon that goes with it. The key is the
// record's identity and never changes — the site and every product refer to it.

function Identity({ label }: Readonly<{ label: string }>) {
  const { document } = useEditor();
  return <KeyBadge label={label} value={String(document.key ?? "")} />;
}

export function MaterialForm() {
  return (
    <FormCard title="Chất liệu" description="Tên hiển thị trên thẻ chất liệu của mọi sản phẩm dùng nó.">
      <div className="md:col-span-2"><Identity label="Mã chất liệu" /></div>
      <TextField path="i18n.*.name" required />
      <IconField path="icon" nullable />
    </FormCard>
  );
}

export function TraitForm() {
  return (
    <FormCard title="Đặc điểm" description="Biểu tượng và lời giải thích hiện cạnh mỗi gạch đầu dòng đặc điểm của chất liệu.">
      <div className="md:col-span-2"><Identity label="Mã đặc điểm" /></div>
      <TextField path="i18n.*.label" required />
      <IconField path="icon" />
      <div className="md:col-span-2"><TextField path="i18n.*.description" multiline /></div>
    </FormCard>
  );
}

export function UnitForm() {
  return (
    <FormCard title="Đơn vị tính" columns={1}>
      <Identity label="Mã đơn vị" />
      <TextField path="i18n.*.label" required />
    </FormCard>
  );
}

export function SpecItemForm() {
  return (
    <FormCard title="Thông số in" description="Một dòng trong danh sách kỹ thuật in, hoàn thiện hoặc chất liệu phổ biến của sản phẩm.">
      <div className="md:col-span-2"><Identity label="Loại / mã" /></div>
      <TextField path="i18n.*.label" required />
      <SwitchField path="isDefault" hint="Tự gợi ý khi thêm thông số cho sản phẩm mới." />
    </FormCard>
  );
}

export function PostCategoryForm() {
  return (
    <FormCard title="Chuyên mục bài viết" columns={1}>
      <Identity label="Mã chuyên mục" />
      <TextField path="i18n.*.label" required />
    </FormCard>
  );
}
