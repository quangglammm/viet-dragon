"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  Save,
  Check,
  Edit2,
  X,
  Sparkles,
  Calendar,
  Clock,
} from "lucide-react";
import type { BlogPost } from "@/data/posts";

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/admin/blog")
      .then((res) => res.json())
      .then((data: BlogPost[]) => {
        if (active) {
          setPosts(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setError("Không thể tải danh sách bài viết");
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const handleSavePosts = async (updatedPosts: BlogPost[]) => {
    setSaving(true);
    setError("");
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedPosts),
      });

      if (!res.ok) throw new Error("Save failed");

      setPosts(updatedPosts);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      setEditingPost(null);
    } catch {
      setError("Lỗi khi lưu bài viết");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePost = (updated: BlogPost) => {
    const nextPosts = posts.map((p) => (p.slug === updated.slug ? updated : p));
    handleSavePosts(nextPosts);
  };

  return (
    <AdminShell>
      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-primary">
            <Sparkles size={15} /> Cẩm Nang & Kiến Thức In Ấn
          </div>
          <h1 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">
            Cẩm Nang & Bài Viết Chuyên Ngành In
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Quản lý {posts.length} bài viết hướng dẫn chọn chất liệu giấy, quy cách gia công bao bì và tin tức xưởng in Viet Dragon.
          </p>
        </div>

        {saveSuccess && (
          <div className="inline-flex items-center gap-1.5 rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-2 text-xs font-bold text-emerald-700 shadow-xs">
            <Check size={14} strokeWidth={3} /> Đã cập nhật thành công!
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700 shadow-xs">
          {error}
        </div>
      )}

      {/* Posts List */}
      {loading ? (
        <div className="flex h-64 w-full items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-xs">
          <div className="flex flex-col items-center gap-2">
            <div className="h-7 w-7 animate-spin rounded-full border-3 border-brand-primary border-t-transparent" />
            <p className="text-xs font-semibold text-slate-500">Đang nạp danh sách bài viết...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <div
              key={post.slug}
              className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs hover:shadow-xl hover:border-brand-primary/40 transition-all duration-300"
            >
              <div>
                {/* Cover Image */}
                <div className="relative h-48 w-full overflow-hidden rounded-2xl bg-slate-100">
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    sizes="450px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute top-2.5 left-2.5 rounded-lg bg-slate-900/85 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-white shadow-xs">
                    {post.categoryVi}
                  </span>
                </div>

                {/* Content Details */}
                <div className="mt-4">
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} /> {post.date}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> {post.readTime} phút đọc
                    </span>
                  </div>

                  <h3 className="mt-2 text-base font-extrabold text-slate-900 line-clamp-2 leading-snug group-hover:text-brand-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 border-t border-slate-100 pt-3.5 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">/{post.slug}</span>
                <button
                  type="button"
                  onClick={() => setEditingPost(post)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-brand-primary transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <Edit2 size={12} /> Sửa Bài Viết
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Blog Modal */}
      {editingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative my-8 max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl">
            <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-lg bg-brand-primary/10 text-brand-primary px-2 py-0.5 text-[11px] font-bold">
                    {editingPost.categoryVi}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-400">/{editingPost.slug}</span>
                </div>
                <h2 className="mt-1 text-xl font-black text-slate-900">
                  Biên Tập Bài Viết Chuyên Ngành
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setEditingPost(null)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdatePost(editingPost);
              }}
              className="space-y-5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700">
                    Tiêu đề bài viết (Tiếng Việt)
                  </label>
                  <input
                    type="text"
                    value={editingPost.title}
                    onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-xs font-bold text-slate-900 focus:border-brand-primary focus:bg-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700">
                    Tiêu đề bài viết (English)
                  </label>
                  <input
                    type="text"
                    value={editingPost.titleEn}
                    onChange={(e) => setEditingPost({ ...editingPost, titleEn: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-xs font-bold text-slate-900 focus:border-brand-primary focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">
                  Đường dẫn ảnh bìa (Cover Image URL)
                </label>
                <input
                  type="text"
                  value={editingPost.coverImage}
                  onChange={(e) => setEditingPost({ ...editingPost, coverImage: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-xs font-mono text-slate-800 focus:border-brand-primary focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700">
                    Tóm tắt ngắn (Tiếng Việt)
                  </label>
                  <textarea
                    rows={2}
                    value={editingPost.excerpt}
                    onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-900 focus:border-brand-primary focus:bg-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700">
                    Tóm tắt ngắn (English)
                  </label>
                  <textarea
                    rows={2}
                    value={editingPost.excerptEn}
                    onChange={(e) => setEditingPost({ ...editingPost, excerptEn: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-900 focus:border-brand-primary focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">
                  Nội dung chi tiết bài viết (Content Vi)
                </label>
                <textarea
                  rows={8}
                  value={editingPost.content}
                  onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3.5 text-xs font-mono text-slate-900 leading-relaxed focus:border-brand-primary focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">
                  Nội dung chi tiết bài viết (Content En)
                </label>
                <textarea
                  rows={8}
                  value={editingPost.contentEn}
                  onChange={(e) => setEditingPost({ ...editingPost, contentEn: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-3.5 text-xs font-mono text-slate-900 leading-relaxed focus:border-brand-primary focus:bg-white focus:outline-hidden"
                />
              </div>

              {/* Actions */}
              <div className="mt-8 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingPost(null)}
                  className="rounded-2xl px-5 py-3 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-2xl bg-brand-primary px-7 py-3 text-xs font-extrabold text-white shadow-lg shadow-brand-primary/25 hover:opacity-95 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {saving ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <Save size={15} /> Lưu Bài Viết
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
