import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireApiUser } from "@/lib/dal";
import { getStoredProducts, saveStoredProducts } from "@/lib/content-store";
import type { ProductCategory } from "@/data/categories";

export async function GET(request: Request) {
  const auth = await requireApiUser(request, ["content", "edit"]);
  if (!auth.ok) return auth.response;

  try {
    const categories = await getStoredProducts();
    return NextResponse.json(categories);
  } catch {
    return NextResponse.json({ error: "Failed to read products" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireApiUser(request, ["content", "edit"]);
  if (!auth.ok) return auth.response;

  try {
    const categories = (await request.json()) as ProductCategory[];
    await saveStoredProducts(categories);

    // Invalidate client caches so changes reflect immediately on the storefront
    revalidatePath("/", "layout");

    return NextResponse.json({ success: true, message: "Products updated successfully" });
  } catch {
    return NextResponse.json({ error: "Failed to save products" }, { status: 500 });
  }
}
