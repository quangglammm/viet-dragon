import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { getMediaAssets, saveUploadedFile } from "@/lib/content-store";

export async function GET() {
  const session = await getAdminSession();
  if (!session.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const media = await getMediaAssets();
    return NextResponse.json(media);
  } catch {
    return NextResponse.json({ error: "Failed to read media assets" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const asset = await saveUploadedFile(file);
    return NextResponse.json({ success: true, asset });
  } catch {
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
