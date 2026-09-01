import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { getStoredProducts, saveStoredProducts } from "@/lib/content-store";
import type { ProductCategory } from "@/data/categories";

export async function GET() {
  const session = await getAdminSession();
  if (!session.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const categories = await getStoredProducts();
    return NextResponse.json(categories);
  } catch {
    return NextResponse.json({ error: "Failed to read products" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const categories = (await request.json()) as ProductCategory[];
    await saveStoredProducts(categories);
    return NextResponse.json({ success: true, message: "Products updated successfully" });
  } catch {
    return NextResponse.json({ error: "Failed to save products" }, { status: 500 });
  }
}
