import { describe, expect, it } from "vitest";
import { postDocument, slugsOf } from "@/tests/fixtures/documents";
import type { PostCategoryDocument, PostDocument } from "../schemas";
import { blogIndexOf, blogPreviewOf, buildBlog, formatPostDate, postPageOf, postPath, resolvePostUrl } from "./posts";

const TIPS: PostCategoryDocument = { schema: 2, key: "tips", i18n: { vi: { label: "Mẹo In Ấn" }, en: { label: "Print Tips" }, zh: { label: "印刷技巧" } } };

/** A post of its own: the fixture with another uid, date and Vietnamese / English slug and title. */
function post(slug: string, publishedOn: string, overrides: Partial<PostDocument> = {}): PostDocument {
  return {
    ...postDocument(),
    uid: `00000000-0000-4000-8000-${slug.length.toString().padStart(2, "0")}${publishedOn.replaceAll("-", "").slice(2)}`,
    slugs: slugsOf(slug, `${slug}-en`),
    publishedOn,
    i18n: { vi: { title: `Bài ${slug}`, content: `Nội dung ${slug}.` }, en: { title: `Post ${slug}`, excerpt: `About ${slug}`, content: `Body ${slug}.` } },
    ...overrides,
  };
}

const build = (posts: PostDocument[]) => buildBlog({ posts, categories: [TIPS] });

describe("buildBlog", () => {
  it("lists published posts newest first, ties by the Vietnamese slug, and leaves archived ones out", () => {
    const blog = build([post("b", "2026-05-28"), post("a", "2026-06-10"), post("d", "2026-06-01"), post("c", "2026-06-01"), post("z", "2026-07-01", { status: "archived" })]);
    expect(blog.posts.map((p) => p.slugs.vi.slug)).toEqual(["a", "c", "d", "b"]);
  });

  it("keeps every language a text exists in, serves the cover from the site root, and names the categories", () => {
    const [view] = build([post("a", "2026-06-10", { cover: "images/blog/a.webp" })]).posts;
    expect(view.title).toEqual({ vi: "Bài a", en: "Post a" });
    expect(view.excerpt).toEqual({ en: "About a" });
    expect(view.cover).toBe("/images/blog/a.webp");
    expect(build([]).categories).toEqual({ tips: { vi: "Mẹo In Ấn", en: "Print Tips", zh: "印刷技巧" } });
  });

  it("does not touch the documents it was given", () => {
    const posts = [post("a", "2026-06-10"), post("b", "2026-05-01")];
    const before = structuredClone(posts);
    build(posts);
    expect(posts).toEqual(before);
  });
});

describe("postPath and resolvePostUrl", () => {
  const blog = () => build([post("a", "2026-06-10", { slugs: slugsOf("bai-a", "post-a", { vi: ["bai-cu"], en: ["old-a"] }) })]);

  it("builds /blog/<slug> in the page's language", () => {
    expect(postPath("vi", blog().posts[0])).toBe("/blog/bai-a");
    expect(postPath("en", blog().posts[0])).toBe("/blog/post-a");
    expect(postPath("zh", blog().posts[0])).toBe("/blog/post-a");
  });

  it("renders the canonical URL of the page's language", () => {
    expect(resolvePostUrl(blog(), "vi", "bai-a")).toMatchObject({ status: "ok" });
    expect(resolvePostUrl(blog(), "en", "post-a")).toMatchObject({ status: "ok" });
  });

  it("redirects an old slug of the page's language to its canonical", () => {
    expect(resolvePostUrl(blog(), "vi", "bai-cu")).toEqual({ status: "redirect", to: "/blog/bai-a" });
    expect(resolvePostUrl(blog(), "en", "old-a")).toEqual({ status: "redirect", to: "/blog/post-a" });
  });

  it("redirects the slug of another language to the canonical of the page's language", () => {
    expect(resolvePostUrl(blog(), "en", "bai-a")).toEqual({ status: "redirect", to: "/blog/post-a" });
    expect(resolvePostUrl(blog(), "vi", "post-a")).toEqual({ status: "redirect", to: "/blog/bai-a" });
    expect(resolvePostUrl(blog(), "ja", "bai-cu")).toEqual({ status: "redirect", to: "/blog/post-a" });
  });

  it("does not find an unknown slug or an archived post", () => {
    expect(resolvePostUrl(blog(), "vi", "nope")).toEqual({ status: "notFound" });
    const archived = build([post("a", "2026-06-10", { status: "archived" })]);
    expect(resolvePostUrl(archived, "vi", "a")).toEqual({ status: "notFound" });
  });

  it("prefers the page's own language when another language's slug equals one of its own", () => {
    const clash = build([post("x", "2026-06-10", { slugs: slugsOf("x", "shared") }), post("y", "2026-06-09", { slugs: slugsOf("shared", "y-en") })]);
    expect(resolvePostUrl(clash, "vi", "shared")).toMatchObject({ status: "ok", post: { slugs: { vi: { slug: "shared" } } } });
  });
});

describe("formatPostDate", () => {
  it("writes the date the way the language does, the same wherever the server is", () => {
    expect(formatPostDate("2026-06-10", "vi")).toBe("10/06/2026");
    expect(formatPostDate("2026-06-10", "en", "long")).toBe("June 10, 2026");
    expect(formatPostDate("2026-06-10", "zh")).toBe("2026/06/10");
    expect(formatPostDate("2026-01-01", "vi")).toBe("01/01/2026"); // UTC midnight stays the first
  });

  it("does not move a date to the day before on a server west of Greenwich", () => {
    const zone = process.env.TZ;
    process.env.TZ = "America/Los_Angeles";
    try {
      expect(formatPostDate("2026-01-01", "vi")).toBe("01/01/2026");
      expect(formatPostDate("2026-01-01", "en", "long")).toBe("January 01, 2026"); // the day keeps two digits, as the old page wrote it
    } finally {
      if (zone === undefined) delete process.env.TZ;
      else process.env.TZ = zone;
    }
  });
});

describe("the models the pages draw", () => {
  const blog = () => build([post("a", "2026-06-10", { readTimeMin: 5 }), post("b", "2026-06-01", { readTimeMin: null }), post("c", "2026-05-01"), post("d", "2026-04-01")]);

  it("features the newest post and lists the rest, each worded and linked in the page's language", () => {
    const { featured, rest } = blogIndexOf(blog(), "en");
    expect(featured).toMatchObject({ title: "Post a", href: "/blog/a-en", excerpt: "About a", category: { key: "tips", label: "Print Tips" }, readTimeMin: 5, date: "06/10/2026" });
    expect(rest.map((card) => card.title)).toEqual(["Post b", "Post c", "Post d"]);
  });

  it("falls back text by text: requested language → English → Vietnamese", () => {
    const [card] = blogPreviewOf(blog(), "zh");
    expect(card).toMatchObject({ title: "Post a", category: { label: "印刷技巧" } });
    expect(blogPreviewOf(build([post("a", "2026-06-10", { i18n: { vi: { title: "Chỉ vi", content: "x" }, en: { title: "Only en", content: "y" } } })]), "ko")[0].title).toBe("Only en");
  });

  it("has no featured post for an empty blog", () => {
    expect(blogIndexOf(build([]), "vi")).toEqual({ featured: null, rest: [] });
    expect(blogPreviewOf(build([]), "vi")).toEqual([]);
  });

  it("previews the newest three", () => {
    expect(blogPreviewOf(blog(), "vi").map((card) => card.href)).toEqual(["/blog/a", "/blog/b", "/blog/c"]);
    expect(blogPreviewOf(blog(), "vi", 2)).toHaveLength(2);
  });

  it("titles a post page «<title> | Viet Dragon Blog», describes it with the excerpt and links its neighbours", () => {
    const blogs = blog();
    const middle = postPageOf(blogs, "en", blogs.posts[1]);
    expect(middle.meta).toEqual({ title: "Post b | Viet Dragon Blog", description: "About b" });
    expect(middle.prev).toEqual({ label: "Post a", href: "/blog/a-en" });
    expect(middle.next).toEqual({ label: "Post c", href: "/blog/c-en" });
    expect(postPageOf(blogs, "en", blogs.posts[0]).prev).toBeNull();
    expect(postPageOf(blogs, "en", blogs.posts[3]).next).toBeNull();
    expect(postPageOf(blogs, "en", blogs.posts[0]).meta.description).toBe("About a");
    expect(postPageOf(blogs, "en", blogs.posts[0]).dateLong).toBe("June 10, 2026");
  });

  it("draws the body of the page's language in the post's format", () => {
    const markdown = build([post("m", "2026-06-10", { contentFormat: "markdown", i18n: { vi: { title: "M", content: "# Tiêu đề\n\n- một" }, en: { title: "M", content: "## Heading" } } })]);
    expect(postPageOf(markdown, "vi", markdown.posts[0]).blocks.map((block) => block.kind)).toEqual(["heading", "list"]);
    expect(postPageOf(markdown, "en", markdown.posts[0]).blocks).toEqual([{ kind: "heading", level: 3, inlines: [{ kind: "text", text: "Heading" }] }]);
    const plain = postPageOf(blog(), "vi", blog().posts[0]);
    expect(plain.blocks).toEqual([{ kind: "paragraph", inlines: [{ kind: "text", text: "Nội dung a." }] }]);
  });
});
