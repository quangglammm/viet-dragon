import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/dal";
import { getAllTranslations, saveAllTranslations, type TranslationBundle } from "@/lib/content-store";

export async function GET(request: Request) {
  const auth = await requireApiUser(request, ["content", "edit"]);
  if (!auth.ok) return auth.response;

  try {
    const translations = await getAllTranslations();
    return NextResponse.json(translations);
  } catch {
    return NextResponse.json({ error: "Failed to read translations" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireApiUser(request, ["content", "edit"]);
  if (!auth.ok) return auth.response;

  try {
    const bundle = (await request.json()) as TranslationBundle;
    await saveAllTranslations(bundle);
    return NextResponse.json({ success: true, message: "Translations updated successfully" });
  } catch {
    return NextResponse.json({ error: "Failed to save translations" }, { status: 500 });
  }
}
