"use client";

import { setProductSlug } from "@/lib/content/editor/product-ops";
import { suggestSlugs } from "@/lib/content/editor/slugs";
import { AliasList } from "../../alias-list";
import { MediaField } from "../../media-field";
import { SlugField } from "../../slug-field";
import { TextField } from "../../fields";
import { FormCard } from "../form-card";
import { useProduct } from "./use-product";

export function UrlsSection() {
  const { editor, product, apply } = useProduct();
  const suggestion = suggestSlugs({ vi: product.i18n.vi?.title, en: product.i18n.en?.title })[editor.language];

  return (
    <>
      <FormCard title="Đường dẫn" description="Mỗi ngôn ngữ có đường dẫn riêng (chỉ gồm chữ không dấu). Bấm sang tab ngôn ngữ khác để xem và sửa." columns={1}>
        <SlugField path="slugs.*.slug" onSlug={(slug) => apply((current) => setProductSlug(current, editor.language, slug))} suggestion={suggestion} />
        <AliasList path="slugs.*.aliases" withCategory onRelease={editor.releaseAlias} />
      </FormCard>
      <FormCard title="SEO" description="Để trống thì website dùng tên và mô tả sản phẩm.">
        <TextField path="i18n.*.seoTitle" maxLength={70} />
        <MediaField path="ogImage" imageOnly />
        <div className="md:col-span-2"><TextField path="i18n.*.seoDescription" multiline maxLength={170} /></div>
      </FormCard>
    </>
  );
}
