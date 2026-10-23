import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireApiUser } from "@/lib/dal";
import { getStoredBlogPosts, saveStoredBlogPosts } from "@/lib/content-store";
import type { BlogPost } from "@/data/posts";

export async function GET(request: Request) {
  const auth = await requireApiUser(request, ["content", "edit"]);
  if (!auth.ok) return auth.response;

  try {
    const posts = await getStoredBlogPosts();
    return NextResponse.json(posts);
  } catch {
    return NextResponse.json({ error: "Failed to read blog posts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireApiUser(request, ["content", "edit"]);
  if (!auth.ok) return auth.response;

  try {
    const posts = (await request.json()) as BlogPost[];
    await saveStoredBlogPosts(posts);

    // Invalidate client caches so changes reflect immediately on the storefront
    revalidatePath("/", "layout");

    return NextResponse.json({ success: true, message: "Blog posts updated successfully" });
  } catch {
    return NextResponse.json({ error: "Failed to save blog posts" }, { status: 500 });
  }
}
