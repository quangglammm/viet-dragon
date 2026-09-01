import { NextResponse } from "next/server";
import { verifyAdminCredentials, createAdminSession } from "@/lib/admin-auth";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu" }, { status: 400 });
    }

    const isValid = await verifyAdminCredentials(username, password);

    if (!isValid) {
      return NextResponse.json({ error: "Tên đăng nhập hoặc mật khẩu không chính xác" }, { status: 401 });
    }

    await createAdminSession(username);
    return NextResponse.json({ success: true, username });
  } catch {
    return NextResponse.json({ error: "Lỗi máy chủ khi xác thực" }, { status: 500 });
  }
}
