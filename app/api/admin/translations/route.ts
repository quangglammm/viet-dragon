import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { getAllTranslations, saveAllTranslations, type TranslationBundle } from "@/lib/content-store";

export async function GET() {
  const session = await getAdminSession();
  if (!session.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const translations = await getAllTranslations();
    return NextResponse.json(translations);
  } catch {
    return NextResponse.json({ error: "Failed to read translations" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const bundle = (await request.json()) as TranslationBundle;
    await saveAllTranslations(bundle);
    return NextResponse.json({ success: true, message: "Translations updated successfully" });
  } catch {
    return NextResponse.json({ error: "Failed to save translations" }, { status: 500 });
  }
}
