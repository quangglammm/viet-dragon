import { NextResponse } from "next/server";
import { verifyAdminCredentials, createAdminSession } from "@/lib/admin-auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = (body.username || "admin").trim();
    const password = (body.password || "").trim();

    if (!password) {
      return NextResponse.json({ error: "Vui lòng nhập mật khẩu" }, { status: 400 });
    }

    const isValid = await verifyAdminCredentials(username, password);

    if (!isValid) {
      return NextResponse.json({ error: "Mật khẩu không chính xác" }, { status: 401 });
    }

    await createAdminSession(username);
    return NextResponse.json({ success: true, username });
  } catch {
    return NextResponse.json({ error: "Lỗi máy chủ khi xác thực" }, { status: 500 });
  }
}
