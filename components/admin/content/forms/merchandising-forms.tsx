"use client";

import { IconField } from "../icon-field";
import { MediaField } from "../media-field";
import { NumberField, SelectField, TextField } from "../fields";
import { ASPECT_OPTIONS, STATUS_OPTIONS } from "./choices";
import { FormCard } from "./form-card";

export function FastPrintForm() {
  return (
    <>
      <FormCard title="Nội dung" description="Hiện trên trang «In nhanh lấy liền».">
        <TextField path="i18n.*.name" required />
        <TextField path="i18n.*.tag" hint="Dòng nhãn nhỏ, ví dụ «Lấy trong 2 giờ»." />
        <div className="md:col-span-2"><TextField path="i18n.*.description" multiline /></div>
      </FormCard>
      <FormCard title="Hiển thị & giá">
        <MediaField path="image" />
        <IconField path="icon" />
        <NumberField path="turnaroundHours" nullable suffix="giờ" />
        <NumberField path="fromPrice" nullable suffix="đ" hint="Hiện dạng «Chỉ từ …đ / đơn vị»." />
        <SelectField path="unit" options="unit" nullable />
        <NumberField path="position" />
        <SelectField path="status" options={STATUS_OPTIONS} hint="«Đã lưu trữ» ẩn mục khỏi website; phải lưu trữ trước khi xóa hẳn." />
        <TextField path="key" hint="Mã nội bộ của mục, chỉ gồm chữ thường, số và dấu gạch ngang." required />
      </FormCard>
    </>
  );
}

export function ShowcaseForm() {
  return (
    <FormCard title="Ảnh mẫu" description="Ảnh trong thư viện mẫu in ở đầu trang Sản phẩm.">
      <MediaField path="media" nullable={false} required />
      <SelectField path="aspect" options={ASPECT_OPTIONS} hint="Khung hiển thị của ảnh trong lưới." />
      <TextField path="i18n.*.label" required />
      <NumberField path="position" />
      <TextField path="key" hint="Mã nội bộ, chỉ gồm chữ thường, số và dấu gạch ngang." required />
    </FormCard>
  );
}
