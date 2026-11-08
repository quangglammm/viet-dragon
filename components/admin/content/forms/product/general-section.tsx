"use client";

import { moveToCategory } from "@/lib/content/editor/product-ops";
import { MediaField } from "../../media-field";
import { NumberField, SelectField, TextField } from "../../fields";
import { STATUS_OPTIONS } from "../choices";
import { FormCard } from "../form-card";
import { useProduct } from "./use-product";

export function GeneralSection() {
  const { editor, product, apply } = useProduct();
  const published = editor.baseline?.category as string | undefined;
  const moving = published !== undefined && published !== product.category;

  return (
    <>
      <FormCard title="Thông tin chung">
        <div className="md:col-span-2"><TextField path="i18n.*.title" required /></div>
        <div className="md:col-span-2"><TextField path="i18n.*.description" multiline rows={4} /></div>
        <SelectField
          path="category"
          options="category"
          required
          onValue={(category) => category && apply((current) => moveToCategory(current, category))}
          hint={moving ? "Đổi danh mục: sản phẩm rời khỏi menu của danh mục cũ (hãy xếp lại vào menu mới); đường dẫn cũ vẫn mở được." : undefined}
        />
        <SelectField path="status" options={STATUS_OPTIONS} hint="«Đã lưu trữ» ẩn sản phẩm khỏi website; phải lưu trữ trước khi xóa hẳn." />
        <MediaField path="cover" />
        <NumberField path="position" hint="Thứ tự trong danh mục." />
      </FormCard>
    </>
  );
}
