import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";

const COMMON_DICTIONARY: Record<string, Record<string, string>> = {
  "Nhận Báo Giá": {
    en: "Get a Quote",
    zh: "获取报价",
    ja: "お見積り依頼",
    ko: "견적 요청",
  },
  "Sản Phẩm": {
    en: "Products",
    zh: "产品中心",
    ja: "取扱製品",
    ko: "인쇄 제품",
  },
  "Bài Viết": {
    en: "Blog",
    zh: "文章资讯",
    ja: "ブログ・お知らせ",
    ko: "블로그·소식",
  },
  "Dịch Vụ": {
    en: "Services",
    zh: "特色服务",
    ja: "印刷サービス",
    ko: "인쇄 서비스",
  },
  "Giới Thiệu": {
    en: "About Us",
    zh: "关于我们",
    ja: "会社概要",
    ko: "회사 소개",
  },
  "Liên Hệ": {
    en: "Contact",
    zh: "联系我们",
    ja: "お問い合わせ",
    ko: "문의하기",
  },
};

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session.authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { text, targetLocale } = await request.json();

    if (!text || !targetLocale) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Check dictionary
    const dictMatch = COMMON_DICTIONARY[text.trim()]?.[targetLocale];
    if (dictMatch) {
      return NextResponse.json({ translation: dictMatch });
    }

    // Default fallback prefixing for automated translation placeholder
    return NextResponse.json({ translation: text });
  } catch {
    return NextResponse.json({ error: "Translation error" }, { status: 500 });
  }
}
