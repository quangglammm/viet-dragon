import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/admin-auth";
import { getMediaAssets, saveUploadedFile, deleteMediaFiles } from "@/lib/content-store";

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

export async function DELETE(request: Request) {
  const session = await getAdminSession();
  if (!session.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const urls: string[] = Array.isArray(body.urls)
      ? body.urls
      : typeof body.url === "string"
      ? [body.url]
      : [];

    if (urls.length === 0) {
      return NextResponse.json(
        { error: "Không có tệp tin nào được chọn để xóa" },
        { status: 400 }
      );
    }

    const result = await deleteMediaFiles(urls);
    revalidatePath("/", "layout");
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Không thể xóa tệp tin phương tiện" },
      { status: 500 }
    );
  }
}
