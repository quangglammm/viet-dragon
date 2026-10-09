// lib/product-sizes.ts
// Industry-standard printing dimensions for Viet Dragon products by category, subgroup, and shape.

import type { Locale } from "@/i18n/routing";

export interface SizeItem {
  id: "large" | "medium" | "small";
  label: string;
  dims: string;
}

export function getProductSizes(
  productName: string,
  locale: Locale,
  productId?: string,
  shapeId?: string,
  categoryId?: string
): SizeItem[] {
  const p = productName.toLowerCase();
  const pid = (productId ?? "").toLowerCase();
  const sid = (shapeId ?? "").toLowerCase();
  const cid = (categoryId ?? "").toLowerCase();

  const lLabel = locale === "vi" ? "Lớn" : locale === "zh" ? "大号" : locale === "ja" ? "大" : locale === "ko" ? "대" : "Large";
  const mLabel = locale === "vi" ? "Vừa" : locale === "zh" ? "中号" : locale === "ja" ? "中" : locale === "ko" ? "중" : "Medium";
  const sLabel = locale === "vi" ? "Nhỏ" : locale === "zh" ? "小号" : locale === "ja" ? "小" : locale === "ko" ? "소" : "Small";

  const badge = (
    baseLabel: string,
    notes: { vi: string; en: string; zh: string; ja: string; ko: string } | string
  ) => {
    const text = typeof notes === "string" ? notes : notes[locale] ?? notes.vi;
    return text ? `${baseLabel} (${text})` : baseLabel;
  };

  // 1. Hashtag cầm tay & Hashtag tay cầm rời (Sự kiện / Chụp ảnh / Check-in)
  // Ưu tiên kiểm tra trước Hangtag để không bị sid.includes("tag-") bắt nhầm
  const isHashtag = sid.includes("hashtag") || p.includes("hashtag");
  if (isHashtag) {
    return [
      { id: "large", label: lLabel, dims: "30 x 40 cm" },
      { id: "medium", label: mLabel, dims: "25 x 35 cm" },
      { id: "small", label: sLabel, dims: "20 x 30 cm" },
    ];
  }

  // 2. Bảng treo POSM / Hanger quảng cáo (Tách riêng khỏi Băng rôn Hiflex ngoài trời)
  const isHangingBoard =
    sid.includes("bang-treo") ||
    p.includes("bảng treo") ||
    p.includes("hanger") ||
    p.includes("wobbler");
  if (isHangingBoard) {
    return [
      { id: "large", label: lLabel, dims: "40 x 60 cm" },
      { id: "medium", label: mLabel, dims: "30 x 40 cm" },
      { id: "small", label: sLabel, dims: "20 x 30 cm" },
    ];
  }

  // 3. Mác sản phẩm / Thẻ bài / Hang tag / Tag trang sức / Tag cảm ơn
  const isHangtag =
    pid === "mac-san-pham" ||
    pid === "tags" ||
    pid === "tag" ||
    sid.includes("mac-") ||
    (sid.includes("tag-") && !sid.includes("hashtag")) ||
    p.includes("mác") ||
    p.includes("hangtag") ||
    p.includes("hang tag") ||
    p.includes("thẻ treo") ||
    p.includes("tag treo") ||
    p.includes("tag quần áo") ||
    p.includes("mác treo") ||
    p.includes("product tag") ||
    p.includes("吊牌") ||
    p.includes("下げ札") ||
    p.includes("행택");

  if (isHangtag) {
    // 3a. Tag trang sức (khuyên tai, nhẫn, vòng tay mini)
    if (
      sid.includes("trang-suc") ||
      sid.includes("jewelry") ||
      p.includes("trang sức") ||
      p.includes("jewelry") ||
      p.includes("首饰") ||
      p.includes("주얼리")
    ) {
      return [
        { id: "large", label: lLabel, dims: "4 x 6 cm" },
        { id: "medium", label: mLabel, dims: "3 x 5 cm" },
        { id: "small", label: sLabel, dims: "2.5 x 4 cm" },
      ];
    }
    // 3b. Tag cảm ơn (card cảm ơn kèm đơn)
    if (
      sid.includes("cam-on") ||
      sid.includes("thank-you") ||
      p.includes("cảm ơn") ||
      p.includes("thank you") ||
      p.includes("感谢") ||
      p.includes("サンキュー") ||
      p.includes("감사")
    ) {
      return [
        { id: "large", label: lLabel, dims: "9 x 5.4 cm" },
        { id: "medium", label: mLabel, dims: "6 x 6 cm" },
        { id: "small", label: sLabel, dims: "5 x 5 cm" },
      ];
    }
    // 3c. Mác thời trang / Mác quần áo chuẩn (mác chữ nhật dẹt)
    return [
      { id: "large", label: lLabel, dims: "5.4 x 9 cm" },
      { id: "medium", label: mLabel, dims: "4.5 x 8.5 cm" },
      { id: "small", label: sLabel, dims: "4 x 5 cm" },
    ];
  }

  // 4. Danh thiếp / Namecards / Thẻ
  // Phải kiểm tra trước Thiệp mời để không bị sid.includes("thiep") bắt nhầm danh-thiep-chuan
  const isCard =
    pid === "danh-thiep" ||
    pid === "namecards" ||
    pid === "card" ||
    sid.includes("danh-thiep") ||
    p.includes("danh thiếp") ||
    p.includes("namecard") ||
    p.includes("card visit") ||
    p.includes("名片") ||
    p.includes("名刺") ||
    p.includes("명함");

  if (isCard) {
    // 4a. Danh thiếp vuông (Square business cards)
    if (sid.includes("vuong") || p.includes("vuông") || p.includes("square")) {
      return [
        { id: "large", label: badge(lLabel, "6 x 6 cm"), dims: "6 x 6 cm" },
        {
          id: "medium",
          label: badge(mLabel, {
            vi: "Chuẩn vuông",
            en: "Square standard",
            zh: "标准方形",
            ja: "正方形標準",
            ko: "정사각 표준",
          }),
          dims: "5.4 x 5.4 cm",
        },
        { id: "small", label: badge(sLabel, "5 x 5 cm"), dims: "5 x 5 cm" },
      ];
    }
    // 4b. Danh thiếp gập đôi (Folded cards)
    if (
      sid.includes("gap-doi") ||
      p.includes("gấp đôi") ||
      p.includes("gập đôi") ||
      p.includes("folded")
    ) {
      return [
        {
          id: "large",
          label: badge(lLabel, {
            vi: "Mở ngang",
            en: "Folded H",
            zh: "横开",
            ja: "横開き",
            ko: "가로 접지",
          }),
          dims: "18 x 5.4 cm",
        },
        {
          id: "medium",
          label: badge(mLabel, {
            vi: "Mở dọc",
            en: "Folded V",
            zh: "竖开",
            ja: "縦開き",
            ko: "세로 접지",
          }),
          dims: "9 x 10.8 cm",
        },
        { id: "small", label: badge(sLabel, "9 x 10 cm"), dims: "9 x 10 cm" },
      ];
    }
    // 4c. Thẻ thông minh / Thẻ nhựa PVC / ATM (Smart cards)
    if (
      sid.includes("thong-minh") ||
      p.includes("thông minh") ||
      p.includes("smart") ||
      p.includes("nhựa pvc") ||
      p.includes("thẻ nhựa") ||
      p.includes("atm")
    ) {
      return [
        {
          id: "large",
          label: badge(lLabel, {
            vi: "Thẻ đeo",
            en: "Badge",
            zh: "佩戴胸牌",
            ja: "ネームタグ",
            ko: "명찰",
          }),
          dims: "7 x 10 cm",
        },
        {
          id: "medium",
          label: badge(mLabel, {
            vi: "Chuẩn ATM",
            en: "ISO / ATM",
            zh: "标准卡片",
            ja: "標準ATM規格",
            ko: "ATM 표준",
          }),
          dims: "8.6 x 5.4 cm",
        },
        {
          id: "small",
          label: badge(sLabel, {
            vi: "Móc khóa",
            en: "Keytag",
            zh: "钥匙扣卡",
            ja: "キーホルダー",
            ko: "키링형",
          }),
          dims: "2.8 x 5.4 cm",
        },
      ];
    }
    // 4d. Danh thiếp chuẩn chữ nhật
    return [
      {
        id: "large",
        label: badge(lLabel, {
          vi: "Chuẩn VN",
          en: "Standard VN",
          zh: "标准越南规格",
          ja: "ベトナム標準",
          ko: "베트남 표준",
        }),
        dims: "9 x 5.4 cm",
      },
      {
        id: "medium",
        label: badge(mLabel, {
          vi: "Gọn",
          en: "Compact",
          zh: "紧凑型",
          ja: "コンパクト",
          ko: "컴팩트",
        }),
        dims: "9 x 5 cm",
      },
      {
        id: "small",
        label: badge(sLabel, {
          vi: "Chuẩn ISO",
          en: "ISO standard",
          zh: "ISO标准",
          ja: "ISO規格",
          ko: "ISO 규격",
        }),
        dims: "8.6 x 5.4 cm",
      },
    ];
  }

  // 5. Bao thư / Phong bì (Envelopes)
  // Kiểm tra trước Notepad để bao-thu-cua-so không bị chữ "sổ" bắt nhầm
  const isEnvelope =
    pid === "bao-thu" ||
    pid === "envelopes" ||
    pid === "envelope" ||
    sid.includes("bao-thu") ||
    sid.includes("envelope") ||
    p.includes("bao thư") ||
    p.includes("phong bì") ||
    p.includes("envelope") ||
    p.includes("信封") ||
    p.includes("封筒") ||
    p.includes("봉투");

  if (isEnvelope) {
    if (sid.includes("bao-thu-nho") || sid === "nho") {
      return [
        { id: "large", label: badge(lLabel, "12x22 nắp 3.5cm"), dims: "12 x 22 cm" },
        { id: "medium", label: badge(mLabel, "12x22 nắp 3cm"), dims: "12 x 22 cm" },
        { id: "small", label: badge(sLabel, "11 x 17.5 cm"), dims: "11 x 17.5 cm" },
      ];
    }
    if (sid.includes("bao-thu-trung") || sid === "trung") {
      return [
        { id: "large", label: badge(lLabel, "17 x 23 cm"), dims: "17 x 23 cm" },
        {
          id: "medium",
          label: badge(mLabel, {
            vi: "A5 chuẩn",
            en: "Standard A5",
            zh: "标准A5",
            ja: "標準A5",
            ko: "표준 A5",
          }),
          dims: "16 x 23 cm",
        },
        { id: "small", label: badge(sLabel, "15 x 22 cm"), dims: "15 x 22 cm" },
      ];
    }
    if (sid.includes("bao-thu-lon") || sid === "lon") {
      return [
        { id: "large", label: badge(lLabel, "26 x 36 cm"), dims: "26 x 36 cm" },
        {
          id: "medium",
          label: badge(mLabel, {
            vi: "A4 chuẩn",
            en: "Standard A4",
            zh: "标准A4",
            ja: "標準A4",
            ko: "표준 A4",
          }),
          dims: "25 x 35 cm",
        },
        { id: "small", label: badge(sLabel, "24 x 34 cm"), dims: "24 x 34 cm" },
      ];
    }
    if (sid.includes("cua-so") || p.includes("cửa sổ") || p.includes("window")) {
      return [
        {
          id: "large",
          label: badge(lLabel, {
            vi: "A4 kính",
            en: "A4 Window",
            zh: "A4透明窗",
            ja: "A4窓付",
            ko: "A4 창봉투",
          }),
          dims: "25 x 35 cm",
        },
        {
          id: "medium",
          label: badge(mLabel, {
            vi: "A5 kính",
            en: "A5 Window",
            zh: "A5透明窗",
            ja: "A5窓付",
            ko: "A5 창봉투",
          }),
          dims: "16 x 23 cm",
        },
        {
          id: "small",
          label: badge(sLabel, {
            vi: "12x22 kính",
            en: "12x22 Window",
            zh: "12x22透明窗",
            ja: "12x22窓付",
            ko: "12x22 창봉투",
          }),
          dims: "12 x 22 cm",
        },
      ];
    }
    return [
      { id: "large", label: badge(lLabel, "A4"), dims: "25 x 35 cm" },
      { id: "medium", label: badge(mLabel, "A5"), dims: "16 x 23 cm" },
      { id: "small", label: badge(sLabel, "12 x 22 cm"), dims: "12 x 22 cm" },
    ];
  }

  // 6. Voucher / Phiếu quà tặng / Thẻ tích điểm / Thẻ cào
  const isVoucher =
    pid === "vouchers" ||
    pid === "voucher" ||
    sid.includes("voucher") ||
    sid.includes("tich-diem") ||
    sid.includes("the-cao") ||
    p.includes("voucher") ||
    p.includes("phiếu quà tặng") ||
    p.includes("gift card") ||
    p.includes("coupon") ||
    p.includes("tích điểm") ||
    p.includes("thẻ cào") ||
    p.includes("代金券") ||
    p.includes("ギフト券") ||
    p.includes("상품권");

  if (isVoucher) {
    if (sid.includes("tich-diem") || p.includes("tích điểm")) {
      return [
        {
          id: "large",
          label: badge(lLabel, {
            vi: "Gập đôi",
            en: "Folded",
            zh: "对折",
            ja: "二つ折り",
            ko: "접이식",
          }),
          dims: "18 x 5.4 cm",
        },
        {
          id: "medium",
          label: badge(mLabel, {
            vi: "Chuẩn ví",
            en: "Wallet standard",
            zh: "钱包标准",
            ja: "財布サイズ",
            ko: "지갑 규격",
          }),
          dims: "9 x 5.4 cm",
        },
        { id: "small", label: badge(sLabel, "9 x 5 cm"), dims: "9 x 5 cm" },
      ];
    }
    if (sid.includes("the-cao") || p.includes("thẻ cào") || p.includes("cào")) {
      return [
        {
          id: "large",
          label: badge(lLabel, {
            vi: "Chuẩn card",
            en: "Card standard",
            zh: "标准卡片",
            ja: "カード標準",
            ko: "카드 표준",
          }),
          dims: "9 x 5.4 cm",
        },
        { id: "medium", label: badge(mLabel, "6 x 9 cm"), dims: "6 x 9 cm" },
        {
          id: "small",
          label: badge(sLabel, {
            vi: "Mini",
            en: "Mini",
            zh: "迷你",
            ja: "ミニ",
            ko: "미니",
          }),
          dims: "4.5 x 7 cm",
        },
      ];
    }
    return [
      { id: "large", label: lLabel, dims: "10 x 20 cm" },
      { id: "medium", label: mLabel, dims: "7 x 15 cm" },
      {
        id: "small",
        label: badge(sLabel, {
          vi: "Card",
          en: "Card",
          zh: "卡片",
          ja: "カード",
          ko: "카드",
        }),
        dims: "9 x 5.4 cm",
      },
    ];
  }

  // 7. Catalogue, Sách, Profile công ty, Menu, Cẩm nang
  // Phải kiểm tra trước Folder để profile-company không bị ho-so bắt nhầm
  const isCatalogue =
    pid === "catalogues" ||
    pid === "catalogue" ||
    sid.includes("catalogue") ||
    sid.includes("cam-nang") ||
    (pid === "catalogues" && sid.includes("profile")) ||
    p.includes("catalogue") ||
    p.includes("cẩm nang") ||
    p.includes("profile") ||
    p.includes("cuốn") ||
    p.includes("sách") ||
    p.includes("menu") ||
    p.includes("画册") ||
    p.includes("カタログ") ||
    p.includes("카탈로그");

  if (isCatalogue) {
    if (
      sid.includes("profile") ||
      p.includes("hồ sơ năng lực") ||
      p.includes("company profile")
    ) {
      return [
        {
          id: "large",
          label: badge(lLabel, {
            vi: "A4 đứng",
            en: "A4 Portrait",
            zh: "A4竖版",
            ja: "A4タテ",
            ko: "A4 세로",
          }),
          dims: "21 x 29.7 cm",
        },
        {
          id: "medium",
          label: badge(mLabel, {
            vi: "A4 ngang",
            en: "A4 Landscape",
            zh: "A4横版",
            ja: "A4ヨコ",
            ko: "A4 가로",
          }),
          dims: "29.7 x 21 cm",
        },
        { id: "small", label: badge(sLabel, "A5"), dims: "14.8 x 21 cm" },
      ];
    }
    if (sid.includes("cam-nang") || p.includes("cẩm nang")) {
      return [
        { id: "large", label: badge(lLabel, "A5"), dims: "14.5 x 20.5 cm" },
        { id: "medium", label: badge(mLabel, "B6"), dims: "12.5 x 17.6 cm" },
        {
          id: "small",
          label: badge(sLabel, {
            vi: "Bỏ túi",
            en: "Pocket A6",
            zh: "口袋A6",
            ja: "ポケットA6",
            ko: "포켓 A6",
          }),
          dims: "10 x 15 cm",
        },
      ];
    }
    return [
      { id: "large", label: badge(lLabel, "A4"), dims: "20.5 x 29.5 cm" },
      { id: "medium", label: badge(mLabel, "A5"), dims: "14.5 x 20.5 cm" },
      { id: "small", label: badge(sLabel, "B5"), dims: "17 x 25 cm" },
    ];
  }

  // 8. Bìa đựng hồ sơ / Folder / Kẹp file
  const isFolder =
    (pid === "bia-dung-ho-so" ||
      pid === "folders" ||
      pid === "folder" ||
      sid.includes("bia-ho-so") ||
      p.includes("bìa đựng") ||
      p.includes("kẹp file") ||
      p.includes("folder") ||
      p.includes("文件夹") ||
      p.includes("フォルダー") ||
      p.includes("홀더")) &&
    pid !== "catalogues";

  if (isFolder) {
    return [
      {
        id: "large",
        label: badge(lLabel, {
          vi: "Khổ lớn",
          en: "Oversized",
          zh: "大规格",
          ja: "特大サイズ",
          ko: "대형 규격",
        }),
        dims: "22.5 x 31.5 cm",
      },
      {
        id: "medium",
        label: badge(mLabel, {
          vi: "A4 chuẩn",
          en: "Standard A4",
          zh: "标准A4",
          ja: "標準A4",
          ko: "표준 A4",
        }),
        dims: "22 x 31 cm",
      },
      { id: "small", label: badge(sLabel, "A5"), dims: "16 x 23 cm" },
    ];
  }

  // 9. Tờ gấp (Brochures / Leaflets)
  const isBiFoldTriFold =
    pid === "to-gap" ||
    pid === "leaflets-brochures" ||
    sid.includes("to-gap") ||
    sid.includes("brochure") ||
    p.includes("tờ gấp") ||
    p.includes("brochure") ||
    p.includes("折页") ||
    p.includes("パンフレット") ||
    p.includes("리플렛");

  if (isBiFoldTriFold) {
    if (
      sid.includes("to-gap-doi") ||
      p.includes("gấp đôi") ||
      p.includes("gập đôi") ||
      p.includes("bi-fold")
    ) {
      return [
        {
          id: "large",
          label: badge(lLabel, {
            vi: "Mở A3 gập đôi",
            en: "Open A3 Bi-fold",
            zh: "A3展开对折",
            ja: "A3開き2つ折り",
            ko: "A3 펼침 2단 접지",
          }),
          dims: "29.7 x 42 cm",
        },
        {
          id: "medium",
          label: badge(mLabel, {
            vi: "Mở A4 gập đôi",
            en: "Open A4 Bi-fold",
            zh: "A4展开对折",
            ja: "A4開き2つ折り",
            ko: "A4 펼침 2단 접지",
          }),
          dims: "21 x 29.7 cm",
        },
        {
          id: "small",
          label: badge(sLabel, {
            vi: "Mở A5 gập đôi",
            en: "Open A5 Bi-fold",
            zh: "A5展开对折",
            ja: "A5開き2つ折り",
            ko: "A5 펼침 2단 접지",
          }),
          dims: "14.8 x 21 cm",
        },
      ];
    }
    if (
      sid.includes("to-gap-ba") ||
      p.includes("gấp ba") ||
      p.includes("gập 3") ||
      p.includes("tri-fold")
    ) {
      return [
        {
          id: "large",
          label: badge(lLabel, {
            vi: "Mở A3 gập 3",
            en: "Open A3 Tri-fold",
            zh: "A3展开3折",
            ja: "A3開き3つ折り",
            ko: "A3 펼침 3단 접지",
          }),
          dims: "29.7 x 42 cm",
        },
        {
          id: "medium",
          label: badge(mLabel, {
            vi: "Mở A4 gập 3",
            en: "Open A4 Tri-fold",
            zh: "A4展开3折",
            ja: "A4開き3つ折り",
            ko: "A4 펼침 3단 접지",
          }),
          dims: "21 x 29.7 cm",
        },
        {
          id: "small",
          label: badge(sLabel, {
            vi: "Bỏ túi",
            en: "Pocket",
            zh: "口袋型",
            ja: "ポケット",
            ko: "포켓형",
          }),
          dims: "10 x 20 cm",
        },
      ];
    }
    return [
      { id: "large", label: badge(lLabel, "A4 gập 3"), dims: "21 x 29.7 cm" },
      { id: "medium", label: badge(mLabel, "A5 gập đôi"), dims: "14.8 x 21 cm" },
      {
        id: "small",
        label: badge(sLabel, {
          vi: "Bỏ túi",
          en: "Pocket",
          zh: "口袋型",
          ja: "ポケット",
          ko: "포켓형",
        }),
        dims: "10 x 20 cm",
      },
    ];
  }

  // 10. Tờ rơi (Flyers) & Bằng khen
  const isFlyer =
    pid === "to-roi" ||
    pid === "flyers" ||
    pid === "flyer" ||
    sid.includes("to-roi") ||
    sid.includes("flyer") ||
    sid.includes("bang-khen") ||
    p.includes("tờ rơi") ||
    p.includes("flyer") ||
    p.includes("bằng khen") ||
    p.includes("giấy khen") ||
    p.includes("chứng nhận") ||
    p.includes("certificate") ||
    p.includes("传单") ||
    p.includes("チラシ") ||
    p.includes("전단지");

  if (isFlyer) {
    if (
      sid.includes("bang-khen") ||
      p.includes("bằng khen") ||
      p.includes("giấy khen") ||
      p.includes("chứng nhận") ||
      p.includes("certificate")
    ) {
      return [
        { id: "large", label: badge(lLabel, "A3"), dims: "29.7 x 42 cm" },
        {
          id: "medium",
          label: badge(mLabel, {
            vi: "A4 chuẩn",
            en: "Standard A4",
            zh: "标准A4",
            ja: "標準A4",
            ko: "표준 A4",
          }),
          dims: "21 x 29.7 cm",
        },
        { id: "small", label: badge(sLabel, "B5"), dims: "19 x 26 cm" },
      ];
    }
    if (sid.includes("vong-tay") || p.includes("vòng tay")) {
      return [
        {
          id: "large",
          label: badge(lLabel, {
            vi: "Bản rộng",
            en: "Wide",
            zh: "加宽型",
            ja: "ワイド幅",
            ko: "와이드",
          }),
          dims: "2.5 x 25 cm",
        },
        {
          id: "medium",
          label: badge(mLabel, {
            vi: "Chuẩn",
            en: "Standard",
            zh: "标准",
            ja: "標準",
            ko: "표준",
          }),
          dims: "2 x 25 cm",
        },
        {
          id: "small",
          label: badge(sLabel, {
            vi: "Trẻ em",
            en: "Kids",
            zh: "儿童款",
            ja: "子ども用",
            ko: "어린이용",
          }),
          dims: "2 x 20 cm",
        },
      ];
    }
    return [
      { id: "large", label: badge(lLabel, "A4"), dims: "21 x 29.7 cm" },
      { id: "medium", label: badge(mLabel, "A5"), dims: "14.8 x 21 cm" },
      { id: "small", label: badge(sLabel, "A6"), dims: "10.5 x 14.8 cm" },
    ];
  }

  // 11. Vé sự kiện & Vòng tay sự kiện (Tickets & Wristbands)
  const isTicketOrWristband =
    pid === "ve-tickets" ||
    pid === "vong-tay-su-kien" ||
    pid === "tickets" ||
    pid === "ticket" ||
    sid.includes("ticket") ||
    sid.includes("wristband") ||
    sid.includes("vong-tay") ||
    p.includes("vé") ||
    p.includes("ticket") ||
    p.includes("vòng tay") ||
    p.includes("wristband") ||
    p.includes("门票") ||
    p.includes("チケット") ||
    p.includes("티켓");

  if (isTicketOrWristband) {
    if (
      sid.includes("wristband") ||
      sid.includes("vong-tay") ||
      p.includes("vòng tay") ||
      p.includes("wristband") ||
      p.includes("手环") ||
      p.includes("リストバンド") ||
      p.includes("손목밴드")
    ) {
      return [
        {
          id: "large",
          label: badge(lLabel, {
            vi: "Bản rộng",
            en: "Wide",
            zh: "加宽型",
            ja: "ワイド幅",
            ko: "와이드",
          }),
          dims: "2.5 x 25 cm",
        },
        {
          id: "medium",
          label: badge(mLabel, {
            vi: "Chuẩn",
            en: "Standard",
            zh: "标准",
            ja: "標準",
            ko: "표준",
          }),
          dims: "2 x 25 cm",
        },
        {
          id: "small",
          label: badge(sLabel, {
            vi: "Trẻ em",
            en: "Kids",
            zh: "儿童款",
            ja: "子ども用",
            ko: "어린이용",
          }),
          dims: "2 x 20 cm",
        },
      ];
    }
    return [
      {
        id: "large",
        label: badge(lLabel, {
          vi: "Cùi xé",
          en: "Stub",
          zh: "副券撕口",
          ja: "もぎり付",
          ko: "절취선 포함",
        }),
        dims: "7 x 20 cm",
      },
      {
        id: "medium",
        label: badge(mLabel, {
          vi: "Chuẩn",
          en: "Standard",
          zh: "标准",
          ja: "標準",
          ko: "표준",
        }),
        dims: "5.5 x 15 cm",
      },
      {
        id: "small",
        label: badge(sLabel, {
          vi: "Mini",
          en: "Mini",
          zh: "迷你",
          ja: "ミニ",
          ko: "미니",
        }),
        dims: "5 x 10 cm",
      },
    ];
  }

  // 12. Túi giấy / Paper bags
  const isBag =
    pid === "tui-giay" ||
    pid === "bags" ||
    pid === "paper-bag" ||
    sid.includes("tui-") ||
    sid.includes("bag") ||
    p.includes("túi giấy") ||
    p.includes("túi") ||
    p.includes("paper bag") ||
    p.includes("bag") ||
    p.includes("纸袋") ||
    p.includes("紙袋") ||
    p.includes("쇼핑백");

  if (isBag) {
    if (sid.includes("banh-mi") || p.includes("bánh mì") || p.includes("bread")) {
      return [
        {
          id: "large",
          label: badge(lLabel, {
            vi: "Bánh que",
            en: "Baguette",
            zh: "法棍长条",
            ja: "細長パン",
            ko: "바게트형",
          }),
          dims: "8 x 28 x 4 cm",
        },
        {
          id: "medium",
          label: badge(mLabel, {
            vi: "Bánh ổ",
            en: "Loaf",
            zh: "普通面包",
            ja: "標準パン",
            ko: "일반 빵",
          }),
          dims: "10 x 24 x 5 cm",
        },
        {
          id: "small",
          label: badge(sLabel, {
            vi: "Tam giác",
            en: "Triangle",
            zh: "三角包",
            ja: "三角サンド",
            ko: "삼각 샌드위치",
          }),
          dims: "19 x 19.5 cm",
        },
      ];
    }
    if (sid.includes("co-nap") || p.includes("nắp")) {
      return [
        { id: "large", label: badge(lLabel, "32 x 28 x 10 cm"), dims: "32 x 28 x 10 cm" },
        { id: "medium", label: badge(mLabel, "26 x 22 x 8 cm"), dims: "26 x 22 x 8 cm" },
        { id: "small", label: badge(sLabel, "18 x 16 x 6 cm"), dims: "18 x 16 x 6 cm" },
      ];
    }
    return [
      { id: "large", label: lLabel, dims: "41 x 29 x 10 cm" },
      { id: "medium", label: mLabel, dims: "35 x 25 x 10 cm" },
      { id: "small", label: sLabel, dims: "20 x 15 x 6 cm" },
    ];
  }

  // 13. Hộp giấy / Paper box / Hộp quà
  const isBox =
    pid === "hop-giay" ||
    pid === "boxes" ||
    pid === "paper-box" ||
    sid.includes("hop-") ||
    sid.includes("box") ||
    p.includes("hộp giấy") ||
    p.includes("hộp quà") ||
    p.includes("hộp carton") ||
    p.includes("box") ||
    p.includes("包装盒") ||
    p.includes("箱") ||
    p.includes("ボックス") ||
    p.includes("상자");

  if (isBox) {
    return [
      { id: "large", label: lLabel, dims: "35 x 25 x 10 cm" },
      { id: "medium", label: mLabel, dims: "22 x 16 x 8 cm" },
      { id: "small", label: sLabel, dims: "12 x 10 x 5 cm" },
    ];
  }

  // 14. Lịch Tết / Calendar
  const isCalendar =
    pid === "lich-tet" ||
    pid === "calendars" ||
    pid === "calendar" ||
    sid.includes("lich-") ||
    sid.includes("calendar") ||
    p.includes("lịch") ||
    p.includes("calendar") ||
    p.includes("台历") ||
    p.includes("カレンダー") ||
    p.includes("달력");

  if (isCalendar) {
    if (sid.includes("nam-cham") || p.includes("nam châm") || p.includes("magnet")) {
      return [
        { id: "large", label: badge(lLabel, "15 x 20 cm"), dims: "15 x 20 cm" },
        { id: "medium", label: badge(mLabel, "10 x 15 cm"), dims: "10 x 15 cm" },
        {
          id: "small",
          label: badge(sLabel, {
            vi: "Card",
            en: "Card",
            zh: "卡片",
            ja: "カード",
            ko: "카드",
          }),
          dims: "9 x 5.4 cm",
        },
      ];
    }
    if (sid.includes("treo-tuong") || p.includes("treo tường") || p.includes("wall")) {
      return [
        { id: "large", label: lLabel, dims: "40 x 60 cm" },
        { id: "medium", label: mLabel, dims: "35 x 70 cm" },
        { id: "small", label: sLabel, dims: "30 x 40 cm" },
      ];
    }
    return [
      {
        id: "large",
        label: badge(lLabel, {
          vi: "Bàn lớn",
          en: "Desk L",
          zh: "大台历",
          ja: "卓上大",
          ko: "탁상 대",
        }),
        dims: "24 x 18 cm",
      },
      {
        id: "medium",
        label: badge(mLabel, {
          vi: "Bàn chuẩn",
          en: "Desk standard",
          zh: "标准台历",
          ja: "卓上標準",
          ko: "탁상 표준",
        }),
        dims: "21 x 15 cm",
      },
      {
        id: "small",
        label: badge(sLabel, {
          vi: "Mini",
          en: "Mini",
          zh: "迷你",
          ja: "ミニ",
          ko: "미니",
        }),
        dims: "16 x 12 cm",
      },
    ];
  }

  // 15. Bao lì xì (Red envelopes)
  const isLixi =
    pid === "bao-li-xi" ||
    pid === "li-xi" ||
    pid === "lixi" ||
    sid.includes("lixi") ||
    p.includes("lì xì") ||
    p.includes("lixi") ||
    p.includes("red envelope") ||
    p.includes("红包") ||
    p.includes("ポチ袋") ||
    p.includes("세뱃돈");

  if (isLixi) {
    return [
      {
        id: "large",
        label: badge(lLabel, {
          vi: "Đựng thẳng",
          en: "Flat cash",
          zh: "直放平展",
          ja: "お札そのまま",
          ko: "펼친 지폐형",
        }),
        dims: "8 x 16 cm",
      },
      {
        id: "medium",
        label: badge(mLabel, {
          vi: "Gấp đôi",
          en: "Folded",
          zh: "对折",
          ja: "二つ折り",
          ko: "반접이형",
        }),
        dims: "8 x 11.5 cm",
      },
      {
        id: "small",
        label: badge(sLabel, {
          vi: "Vuông",
          en: "Square",
          zh: "正方形",
          ja: "正方形",
          ko: "정사각",
        }),
        dims: "8 x 8 cm",
      },
    ];
  }

  // 16. Thiệp Tết / Thiệp chúc mừng / Thiệp mời (LOẠI TRỪ danh-thiep)
  const isGreetingCard =
    pid !== "danh-thiep" &&
    !isCard &&
    (pid === "thiep-tet" ||
      pid === "thiep-moi" ||
      pid === "invitations" ||
      sid.includes("thiep") ||
      sid.includes("invitation") ||
      p.includes("thiệp") ||
      p.includes("invitation") ||
      p.includes("贺卡") ||
      p.includes("グリーティングカード") ||
      p.includes("청첩장"));

  if (isGreetingCard) {
    return [
      { id: "large", label: lLabel, dims: "15 x 20 cm" },
      { id: "medium", label: mLabel, dims: "12 x 17 cm" },
      { id: "small", label: badge(sLabel, "A6"), dims: "10 x 15 cm" },
    ];
  }

  // 17. Giấy tiêu đề (Letterheads)
  const isLetterhead =
    pid === "giay-tieu-de" ||
    pid === "letterheads" ||
    pid === "letterhead" ||
    sid.includes("letterhead") ||
    p.includes("tiêu đề") ||
    p.includes("letterhead") ||
    p.includes("信头纸") ||
    p.includes("便箋") ||
    p.includes("레터헤드");

  if (isLetterhead) {
    return [
      {
        id: "large",
        label: badge(lLabel, {
          vi: "A4 chuẩn",
          en: "Standard A4",
          zh: "标准A4",
          ja: "標準A4",
          ko: "표준 A4",
        }),
        dims: "21 x 29.7 cm",
      },
      { id: "medium", label: badge(mLabel, "A5"), dims: "14.8 x 21 cm" },
      {
        id: "small",
        label: badge(sLabel, {
          vi: "Letter quốc tế",
          en: "US Letter",
          zh: "美标Letter",
          ja: "レター規格",
          ko: "레터 규격",
        }),
        dims: "21.6 x 27.9 cm",
      },
    ];
  }

  // 18. Giấy ghi chú / Notepad (LOẠI TRỪ bao thư cửa sổ)
  const isNotepad =
    pid !== "bao-thu" &&
    !isEnvelope &&
    (pid === "giay-ghi-chu" ||
      pid === "notes" ||
      pid === "notepad" ||
      sid.includes("ghi-chu") ||
      sid.includes("note") ||
      p.includes("ghi chú") ||
      p.includes("notepad") ||
      p.includes("note block") ||
      (p.includes("sổ") && !p.includes("cửa sổ")) ||
      p.includes("便签") ||
      p.includes("メモ") ||
      p.includes("메모지"));

  if (isNotepad) {
    return [
      { id: "large", label: badge(lLabel, "A6"), dims: "10 x 15 cm" },
      { id: "medium", label: mLabel, dims: "7.5 x 10 cm" },
      {
        id: "small",
        label: badge(sLabel, {
          vi: "Vuông",
          en: "Square",
          zh: "正方形",
          ja: "正方形",
          ko: "정사각",
        }),
        dims: "7.5 x 7.5 cm",
      },
    ];
  }

  // 19. Áo thun đồng phục
  const isTshirt =
    pid === "ao-thun" ||
    pid === "tshirts" ||
    pid === "tshirt" ||
    sid.includes("ao-thun") ||
    sid.includes("tshirt") ||
    p.includes("áo thun") ||
    p.includes("áo polo") ||
    p.includes("t-shirt") ||
    p.includes("tshirt") ||
    p.includes("t恤") ||
    p.includes("tシャツ") ||
    p.includes("티셔츠");

  if (isTshirt) {
    return [
      { id: "large", label: badge(lLabel, "L - XL"), dims: "Size L - XL" },
      { id: "medium", label: badge(mLabel, "Size M"), dims: "Size M" },
      { id: "small", label: badge(sLabel, "Size S"), dims: "Size S" },
    ];
  }

  // 20. Standee, Băng rôn, Poster, Tranh Canvas, Decal Khổ Lớn, PP Format
  // Đặt TRƯỚC tem nhãn để decal-kho-lon không bị rơi vào con tem nhãn nhỏ
  const isLargeFormat =
    pid === "poster-bangron-standee" ||
    pid === "posters-standee" ||
    sid.includes("standee") ||
    sid.includes("bang-ron") ||
    sid.includes("canvas") ||
    sid.includes("decal-kho-lon") ||
    sid.includes("pp-boi-format") ||
    sid.includes("hiflex") ||
    p.includes("standee") ||
    p.includes("băng rôn") ||
    p.includes("banner") ||
    p.includes("canvas") ||
    p.includes("hiflex") ||
    p.includes("poster");

  if (isLargeFormat) {
    if (
      sid.includes("decal-kho-lon") ||
      sid.includes("pp-boi-format") ||
      p.includes("khổ lớn") ||
      p.includes("format")
    ) {
      return [
        {
          id: "large",
          label: badge(lLabel, {
            vi: "Khổ tấm",
            en: "Sheet",
            zh: "大板材",
            ja: "大判シート",
            ko: "원장 규격",
          }),
          dims: "120 x 240 cm",
        },
        {
          id: "medium",
          label: badge(mLabel, {
            vi: "Khổ vừa",
            en: "Medium",
            zh: "中板材",
            ja: "中判",
            ko: "중형",
          }),
          dims: "80 x 120 cm",
        },
        { id: "small", label: badge(sLabel, "A1"), dims: "60 x 80 cm" },
      ];
    }
    if (sid.includes("standee") || p.includes("standee")) {
      return [
        { id: "large", label: badge(lLabel, "0.8 x 2m"), dims: "80 x 200 cm" },
        { id: "medium", label: badge(mLabel, "0.6 x 1.6m"), dims: "60 x 160 cm" },
        {
          id: "small",
          label: badge(sLabel, {
            vi: "Để bàn",
            en: "Desk",
            zh: "桌上型",
            ja: "卓上",
            ko: "탁상형",
          }),
          dims: "21 x 29.7 cm",
        },
      ];
    }
    if (sid.includes("canvas") || p.includes("canvas")) {
      return [
        { id: "large", label: lLabel, dims: "60 x 90 cm" },
        { id: "medium", label: mLabel, dims: "40 x 60 cm" },
        { id: "small", label: sLabel, dims: "30 x 40 cm" },
      ];
    }
    if (
      sid.includes("bang-ron") ||
      sid.includes("hiflex") ||
      p.includes("băng rôn") ||
      p.includes("hiflex")
    ) {
      return [
        { id: "large", label: lLabel, dims: "100 x 500 cm" },
        { id: "medium", label: mLabel, dims: "80 x 300 cm" },
        { id: "small", label: sLabel, dims: "60 x 200 cm" },
      ];
    }
    // Default Poster
    return [
      { id: "large", label: badge(lLabel, "A2"), dims: "42 x 59.4 cm" },
      { id: "medium", label: badge(mLabel, "A3"), dims: "29.7 x 42 cm" },
      { id: "small", label: badge(sLabel, "A4"), dims: "21 x 29.7 cm" },
    ];
  }

  // 21. Tem nhãn / Decal / Nhãn dán / Sticker (con tem, tem tấm)
  const isStamp =
    pid === "nhan-dan" ||
    pid === "labels" ||
    pid === "decal" ||
    sid.includes("decal") ||
    sid.includes("sticker") ||
    sid.includes("nhan-") ||
    p.includes("tem") ||
    p.includes("decal") ||
    p.includes("nhãn") ||
    p.includes("label") ||
    p.includes("sticker") ||
    p.includes("标签") ||
    p.includes("ステッカー") ||
    p.includes("스티커");

  if (isStamp) {
    if (
      sid.includes("tem-be") ||
      p.includes("tem vỡ") ||
      p.includes("bảo hành") ||
      p.includes("tamper")
    ) {
      return [
        { id: "large", label: lLabel, dims: "1.5 x 3 cm" },
        { id: "medium", label: mLabel, dims: "1 x 2.5 cm" },
        { id: "small", label: sLabel, dims: "1 x 1.5 cm" },
      ];
    }
    if (
      sid.includes("sticker-sheets") ||
      sid.includes("sheet") ||
      p.includes("dạng tờ") ||
      p.includes("tấm")
    ) {
      return [
        { id: "large", label: badge(lLabel, "A3"), dims: "29.7 x 42 cm" },
        { id: "medium", label: badge(mLabel, "A4"), dims: "21 x 29.7 cm" },
        { id: "small", label: badge(sLabel, "A5"), dims: "14.8 x 21 cm" },
      ];
    }
    return [
      { id: "large", label: lLabel, dims: "8 x 8 cm" },
      { id: "medium", label: mLabel, dims: "5 x 5 cm" },
      { id: "small", label: sLabel, dims: "3 x 3 cm" },
    ];
  }

  // Fallback an toàn theo Category
  if (cid === "packaging") {
    return [
      { id: "large", label: lLabel, dims: "41 x 29 x 10 cm" },
      { id: "medium", label: mLabel, dims: "35 x 25 x 10 cm" },
      { id: "small", label: sLabel, dims: "20 x 15 x 6 cm" },
    ];
  }

  return [
    { id: "large", label: badge(lLabel, "A4"), dims: "21 x 29.7 cm" },
    { id: "medium", label: badge(mLabel, "A5"), dims: "14.8 x 21 cm" },
    { id: "small", label: badge(sLabel, "A6"), dims: "10.5 x 14.8 cm" },
  ];
}
