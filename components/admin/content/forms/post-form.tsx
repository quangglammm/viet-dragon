"use client";

import { type Document } from "@/lib/content/editor/api";
import { setText } from "@/lib/content/editor/paths";
import { followRootNames, setRootSlug } from "@/lib/content/editor/slug-ops";
import { suggestSlugs } from "@/lib/content/editor/slugs";
import type { PostDocument } from "@/lib/content/schemas";
import { AliasList } from "../alias-list";
import { useEditor } from "../editor-context";
import { DateField, NumberField, SelectField, TextField } from "../fields";
import { MediaField } from "../media-field";
import { SlugField } from "../slug-field";
import { CONTENT_FORMAT_OPTIONS, STATUS_OPTIONS } from "./choices";
import { FormCard } from "./form-card";

// A blog post: its text in every language, what it is filed under, and its addresses. The text of a post is long, so the content box
// is tall; the format says whether the text is plain (a line break starts a paragraph) or Markdown.

const TITLE_PATH = "i18n.*.title";

/**
 * The title. For a post that was never published, typing a Vietnamese or English title also rebuilds its URLs while they are still the
 * placeholder or the old title's slug (zh/ja/ko follow English). A published post never has its URL changed by typing.
 */
function PostTitleField() {
  const editor = useEditor();
  const post = editor.document as unknown as PostDocument;
  const follows = editor.baseline === null && (editor.language === "vi" || editor.language === "en");

  const onText = (text: string) => {
    const typed = setText(post, editor.resolve(TITLE_PATH), text);
    const next = follows
      ? followRootNames(typed, { vi: post.i18n.vi?.title, en: post.i18n.en?.title }, { vi: typed.i18n.vi?.title, en: typed.i18n.en?.title })
      : typed;
    editor.replace(next as unknown as Document);
  };

  return <TextField path={TITLE_PATH} required onText={onText} />;
}

export function PostForm() {
  const editor = useEditor();
  const post = editor.document as unknown as PostDocument;
  const suggestion = suggestSlugs({ vi: post.i18n.vi?.title, en: post.i18n.en?.title })[editor.language];

  return (
    <>
      <FormCard title="Nội dung" description="Tiêu đề, tóm tắt và nội dung của bài, theo từng ngôn ngữ (bấm sang tab ngôn ngữ khác để viết bản dịch).">
        <div className="md:col-span-2"><PostTitleField /></div>
        <div className="md:col-span-2"><TextField path="i18n.*.excerpt" multiline rows={3} hint="Đoạn giới thiệu ngắn hiện trên thẻ bài viết." /></div>
        <div className="md:col-span-2"><TextField path="i18n.*.content" multiline rows={18} required /></div>
        <SelectField path="contentFormat" options={CONTENT_FORMAT_OPTIONS} hint="Văn bản thường: xuống dòng trống để sang đoạn mới. Markdown: **đậm**, # tiêu đề, - danh sách." />
      </FormCard>
      <FormCard title="Thông tin bài viết">
        <SelectField path="category" options="post_category" required />
        <SelectField path="status" options={STATUS_OPTIONS} hint="«Đã lưu trữ» ẩn bài khỏi website; phải lưu trữ trước khi xóa hẳn." />
        <DateField path="publishedOn" required />
        <NumberField path="readTimeMin" nullable suffix="phút" />
        <div className="md:col-span-2"><MediaField path="cover" /></div>
      </FormCard>
      <FormCard title="Đường dẫn & SEO" description="Mỗi ngôn ngữ có đường dẫn riêng (chỉ gồm chữ không dấu). Để trống phần SEO thì website dùng tiêu đề và tóm tắt." columns={1}>
        <SlugField path="slugs.*.slug" onSlug={(slug) => editor.replace(setRootSlug(post, editor.language, slug) as unknown as Document)} suggestion={suggestion} />
        <AliasList path="slugs.*.aliases" />
        <TextField path="i18n.*.seoTitle" maxLength={70} />
        <TextField path="i18n.*.seoDescription" multiline maxLength={170} />
        <MediaField path="ogImage" imageOnly />
      </FormCard>
    </>
  );
}
