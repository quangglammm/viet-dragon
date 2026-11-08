import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { pickLocale } from "@/lib/locale";
import { LOCALES } from "@/scripts/seed/localized";
import { createSeededDatabase, type SeededDatabase } from "@/tests/helpers/seeded-db";
import { loadBlog } from "./load";
import type { Block, Inline } from "./markdown";
import { blogIndexOf, blogPreviewOf, formatPostDate, postPageOf, postPath, resolvePostUrl, type Blog, type PostView } from "./posts";

// What the blog pages say, read from a database seeded from the old static posts, against what the old pages computed from them.

let seeded: SeededDatabase;
let blog: Blog;
let registered: ReadonlySet<string>;

beforeAll(async () => {
  seeded = await createSeededDatabase("read-blog");
  blog = await loadBlog(seeded.db);
  registered = new Set((await seeded.scratch.pool.query(`select storage_key from media`)).rows.map((row: { storage_key: string }) => row.storage_key));
}, 180_000);
afterAll(async () => {
  await seeded.close();
});

const olds = () => seeded.src.posts;
const viewOf = (slug: string): PostView => blog.posts.find((post) => post.slugs.vi.slug === slug)!;

/** What the old blog pages drew for a paragraph (the page's own rule, verbatim). */
function oldBlocks(content: string): Block[] {
  return content
    .split("\n\n")
    .filter(Boolean)
    .map((para): Block => {
      if (para.startsWith("**") && para.endsWith("**")) return { kind: "heading", level: 3, inlines: [{ kind: "text", text: para.slice(2, -2) }] };
      const inlines = para
        .split(/(\*\*[^*]+\*\*)/g)
        .filter((part) => part !== "")
        .map((part): Inline => (part.startsWith("**") && part.endsWith("**") ? { kind: "strong", children: [{ kind: "text", text: part.slice(2, -2) }] } : { kind: "text", text: part }));
      return { kind: "paragraph", inlines };
    });
}

describe("the blog", () => {
  it("holds the six old posts, all published", () => {
    expect(blog.posts).toHaveLength(6);
    expect(new Set(blog.posts.map((post) => post.slugs.vi.slug))).toEqual(new Set(olds().map((post) => post.slug)));
  });

  it("lists them newest first — the one change from the old file order (05-28 sat before 06-01)", () => {
    expect(olds().map((post) => post.slug)).toEqual(["chon-chat-lieu-in-phu-hop", "bao-bi-fnb-local-brand", "viet-dragon-mo-rong-binh-duong", "5-loi-thuong-gap-khi-chuan-bi-file-in", "bo-nhan-dien-thuong-hieu-startup", "may-in-uv-the-he-moi"]);
    expect(blog.posts.map((post) => post.slugs.vi.slug)).toEqual(["chon-chat-lieu-in-phu-hop", "viet-dragon-mo-rong-binh-duong", "bao-bi-fnb-local-brand", "5-loi-thuong-gap-khi-chuan-bi-file-in", "bo-nhan-dien-thuong-hieu-startup", "may-in-uv-the-he-moi"]);
  });

  it("carries the title, excerpt, category, date, read time, cover and body of the old page in every language", () => {
    const bad: string[] = [];
    for (const old of olds()) {
      for (const locale of LOCALES) {
        const card = blogPreviewOf(blog, locale, 6).find((candidate) => candidate.uid === viewOf(old.slug).uid)!;
        const want = {
          title: pickLocale(locale, old.title, old.titleEn, old.titleZh, old.titleJa, old.titleKo),
          excerpt: pickLocale(locale, old.excerpt, old.excerptEn, old.excerptZh, old.excerptJa, old.excerptKo),
          category: pickLocale(locale, old.categoryVi, old.categoryEn, old.categoryZh, old.categoryJa, old.categoryKo),
        };
        if (card.title !== want.title) bad.push(`${old.slug} ${locale} title`);
        if (card.excerpt !== want.excerpt) bad.push(`${old.slug} ${locale} excerpt`);
        if (card.category.label !== want.category) bad.push(`${old.slug} ${locale} category «${card.category.label}» for «${want.category}»`);
        if (card.category.key !== old.category) bad.push(`${old.slug} category key`);
        if (card.readTimeMin !== old.readTime) bad.push(`${old.slug} read time`);
        if (card.publishedOn !== old.date) bad.push(`${old.slug} date`);
        const view = viewOf(old.slug);
        const page = postPageOf(blog, locale, view);
        const content = pickLocale(locale, old.content, old.contentEn, old.contentZh, old.contentJa, old.contentKo);
        if (JSON.stringify(page.blocks) !== JSON.stringify(oldBlocks(content))) bad.push(`${old.slug} ${locale} body`);
        if (page.meta.title !== `${want.title} | Viet Dragon Blog` || page.meta.description !== want.excerpt) bad.push(`${old.slug} ${locale} meta`);
      }
      const cover = viewOf(old.slug).cover;
      if (cover !== (registered.has(old.coverImage.replace(/^\//, "")) ? old.coverImage : null)) bad.push(`${old.slug} cover ${cover} for ${old.coverImage}`);
    }
    expect(bad).toEqual([]);
  });

  it("serves the old URL of every post in every language: the Vietnamese one as it was, the others through one redirect", () => {
    const bad: string[] = [];
    for (const old of olds()) {
      expect(resolvePostUrl(blog, "vi", old.slug)).toMatchObject({ status: "ok" });
      for (const locale of LOCALES) {
        const resolved = resolvePostUrl(blog, locale, old.slug);
        const canonical = postPath(locale, viewOf(old.slug));
        if (locale === "vi" ? resolved.status !== "ok" : resolved.status !== "redirect" || resolved.to !== canonical) bad.push(`${old.slug} ${locale}: ${JSON.stringify(resolved)}`);
        if (resolvePostUrl(blog, locale, canonical.replace("/blog/", "")).status !== "ok") bad.push(`${canonical} does not render`);
      }
    }
    expect(bad).toEqual([]);
  });

  it("writes the old dates the old way", () => {
    for (const old of olds()) for (const locale of LOCALES) expect(formatPostDate(old.date, locale)).toBe(new Date(old.date).toLocaleDateString({ vi: "vi-VN", en: "en-US", zh: "zh-CN", ja: "ja-JP", ko: "ko-KR" }[locale], { day: "2-digit", month: "2-digit", year: "numeric" }));
  });

  it("features the newest post, and previews the newest three", () => {
    const { featured, rest } = blogIndexOf(blog, "vi");
    expect(featured?.href).toBe("/blog/chon-chat-lieu-in-phu-hop");
    expect(rest).toHaveLength(5);
    expect(blogPreviewOf(blog, "vi").map((card) => card.href)).toEqual(["/blog/chon-chat-lieu-in-phu-hop", "/blog/viet-dragon-mo-rong-binh-duong", "/blog/bao-bi-fnb-local-brand"]);
  });
});
