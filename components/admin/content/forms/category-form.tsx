"use client";

import { AlertTriangle } from "lucide-react";
import type { Document } from "@/lib/content/editor/api";
import { setRootSlug } from "@/lib/content/editor/slug-ops";
import type { CategoryDocument } from "@/lib/content/schemas";
import { AliasList } from "../alias-list";
import { useEditor } from "../editor-context";
import { IconField } from "../icon-field";
import { MediaField } from "../media-field";
import { NumberField, TextField } from "../fields";
import { SlugField } from "../slug-field";
import { FormCard, KeyBadge } from "./form-card";

// One of the website's few categories. Its slug is the category part of EVERY product URL in that language, so changing it moves the
// address of all its products at once: the old addresses keep working (they become old URLs), and the editor is told before they do it.

export function CategoryForm() {
  const editor = useEditor();
  const category = editor.document as unknown as CategoryDocument;
  const published = (editor.baseline as unknown as CategoryDocument | null)?.slugs[editor.language]?.slug;
  const renaming = published !== undefined && published !== category.slugs[editor.language]?.slug;

  return (
    <>
      <FormCard title="Danh mục" description="Tên và mô tả hiện trên trang danh mục và trong menu.">
        <div className="md:col-span-2"><KeyBadge label="Mã danh mục" value={category.key} /></div>
        <TextField path="i18n.*.name" required />
        <NumberField path="position" hint="Thứ tự của danh mục trên website." />
        <div className="md:col-span-2"><TextField path="i18n.*.description" multiline rows={3} /></div>
        <IconField path="icon" />
        <MediaField path="cover" />
      </FormCard>
      <FormCard title="Đường dẫn & SEO" description="Mỗi ngôn ngữ có đường dẫn danh mục riêng (chỉ gồm chữ không dấu). Bấm sang tab ngôn ngữ khác để xem và sửa." columns={1}>
        {renaming && (
          <p role="note" className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-semibold leading-relaxed text-amber-900">
            <AlertTriangle size={14} className="mt-0.5 shrink-0" aria-hidden />
            Đổi đường dẫn danh mục sẽ đổi địa chỉ của mọi sản phẩm trong danh mục này (ở ngôn ngữ đang sửa). Địa chỉ cũ vẫn mở được.
          </p>
        )}
        <SlugField path="slugs.*.slug" onSlug={(slug) => editor.replace(setRootSlug(category, editor.language, slug) as unknown as Document)} />
        <AliasList path="slugs.*.aliases" />
        <TextField path="i18n.*.seoTitle" maxLength={70} />
        <TextField path="i18n.*.seoDescription" multiline maxLength={170} />
        <MediaField path="ogImage" imageOnly />
      </FormCard>
    </>
  );
}
