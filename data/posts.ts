export type PostCategory = "tips" | "case-study" | "news";

export interface BlogPost {
  slug: string;
  title: string;
  titleEn: string;
  excerpt: string;
  excerptEn: string;
  coverImage: string;
  date: string;
  category: PostCategory;
  categoryVi: string;
  categoryEn: string;
  readTime: number;
  content: string;
  contentEn: string;
}

import storedPosts from "./content/posts.json";

export const blogPosts: BlogPost[] = storedPosts as unknown as BlogPost[];

export const categoryColors: Record<PostCategory, { bg: string; text: string }> = {
  tips: { bg: "bg-blue-50", text: "text-blue-600" },
  "case-study": { bg: "bg-amber-50", text: "text-amber-600" },
  news: { bg: "bg-emerald-50", text: "text-emerald-600" },
};
