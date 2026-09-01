import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { getStoredBlogPosts, saveStoredBlogPosts } from "@/lib/content-store";
import type { BlogPost } from "@/data/posts";

export async function GET() {
  const session = await getAdminSession();
  if (!session.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const posts = await getStoredBlogPosts();
    return NextResponse.json(posts);
  } catch {
    return NextResponse.json({ error: "Failed to read blog posts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const posts = (await request.json()) as BlogPost[];
    await saveStoredBlogPosts(posts);
    return NextResponse.json({ success: true, message: "Blog posts updated successfully" });
  } catch {
    return NextResponse.json({ error: "Failed to save blog posts" }, { status: 500 });
  }
}
