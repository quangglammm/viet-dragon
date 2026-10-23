import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireApiUser } from "@/lib/dal";
import { getMediaAssets, saveUploadedFile, deleteMediaFiles } from "@/lib/content-store";

export async function GET(request: Request) {
  const auth = await requireApiUser(request, ["content", "edit"]);
  if (!auth.ok) return auth.response;

  try {
    const media = await getMediaAssets();
    return NextResponse.json(media);
  } catch {
    return NextResponse.json({ error: "Failed to read media assets" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireApiUser(request, ["media", "upload"], { contentType: "multipart" });
  if (!auth.ok) return auth.response;

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
  const auth = await requireApiUser(request, ["media", "delete"]);
  if (!auth.ok) return auth.response;

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
