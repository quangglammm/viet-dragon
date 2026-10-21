// lib/product-specs.ts
// Industry-standard printing specifications (materials, printing techniques, and post-press finishing)
// customized dynamically per product, material, and category context.

import type { Locale } from "@/i18n/routing";

export const FORM_TITLES: Record<string, Record<Locale, string>> = {
  sizes: {
    vi: "Kích thước phổ biến:",
    en: "Popular sizes:",
    zh: "常用尺寸:",
    ja: "一般的なサイズ:",
    ko: "자주 쓰이는 규격:",
  },
  printTech: {
    vi: "Kỹ thuật in:",
    en: "Printing technique:",
    zh: "印刷工艺:",
    ja: "印刷技術:",
    ko: "인쇄 기법:",
  },
  material: {
    vi: "Chất liệu:",
    en: "Material:",
    zh: "材质:",
    ja: "素材:",
    ko: "재질:",
  },
  finishing: {
    vi: "Thành phẩm sau in:",
    en: "Post-press finishing:",
    zh: "印后加工:",
    ja: "印刷後加工・仕上がり:",
    ko: "인쇄 후가공 / 마감:",
  },
};

export const PRINT_TECHNIQUES: Record<Locale, string[]> = {
  vi: ["In nhanh", "Offset", "Ép kim", "Dập nổi dập chìm"],
  en: ["Fast print", "Offset", "Foil stamping", "Emboss / deboss"],
  zh: ["快印", "胶印 (Offset)", "烫金", "压凸/压凹"],
  ja: ["オンデマンド印刷", "オフセット", "箔押し", "型押し・エンボス"],
  ko: ["디지털 인쇄", "옵셋", "박 인쇄", "형압 / 엠보싱"],
};

/**
 * Returns a tailored list of common printing materials based on the product/shape context.
 */
export function getProductMaterials(
  productName: string,
  currentMaterial: string,
  locale: Locale,
  productId?: string,
  shapeId?: string,
  categoryId?: string
): string[] {
  const p = productName.toLowerCase();
  const pid = (productId ?? "").toLowerCase();
  const sid = (shapeId ?? "").toLowerCase();
  const cid = (categoryId ?? "").toLowerCase();

  const isDecal =
    sid.includes("decal") ||
    sid.includes("sticker") ||
    sid.includes("tem") ||
    p.includes("decal") ||
    p.includes("sticker") ||
    p.includes("tem") ||
    pid.includes("decal") ||
    pid.includes("sticker");

  const isBanner =
    sid.includes("standee") ||
    sid.includes("poster") ||
    sid.includes("banner") ||
    sid.includes("bang-ron") ||
    sid.includes("hiflex") ||
    p.includes("standee") ||
    p.includes("poster") ||
    p.includes("banner") ||
    p.includes("băng rôn") ||
    p.includes("hiflex");

  const isPackaging =
    cid.includes("packaging") ||
    cid.includes("bao-bi") ||
    sid.includes("hop") ||
    sid.includes("tui") ||
    p.includes("hộp") ||
    p.includes("túi") ||
    p.includes("thùng") ||
    pid.includes("hop") ||
    pid.includes("tui");

  const isBookletOrCalendar =
    sid.includes("lich") ||
    sid.includes("so-tay") ||
    sid.includes("catalogue") ||
    sid.includes("tap-chi") ||
    p.includes("lịch") ||
    p.includes("sổ tay") ||
    p.includes("catalogue") ||
    p.includes("tạp chí");

  let baseList: string[] = [];

  if (isDecal) {
    if (locale === "vi") baseList = ["Decal giấy", "Decal nhựa sữa", "Decal trong suốt", "Decal xi bạc"];
    else if (locale === "zh") baseList = ["铜版纸不干胶", "白底PVC不干胶", "透明不干胶", "消银龙/银箔不干胶"];
    else if (locale === "ja") baseList = ["紙製ステッカー", "白塩ビステッカー", "透明ステッカー", "銀ホイルステッカー"];
    else if (locale === "ko") baseList = ["아트지 스티커", "유포지 스티커", "투명 데칼", "은무데드롱 스티커"];
    else baseList = ["Paper decal", "White vinyl decal", "Clear vinyl decal", "Silver metallic decal"];
  } else if (isBanner) {
    if (locale === "vi") baseList = ["PP có keo", "PP không keo", "Bạt Hiflex", "Bạt không gân"];
    else if (locale === "zh") baseList = ["背胶PP", "无胶PP合成纸", "Hiflex户外喷绘布", "无网纹高精布"];
    else if (locale === "ja") baseList = ["糊付きPP合成紙", "糊なしPP合成紙", "ターポリン (Hiflex)", "高精細ノングレア布"];
    else if (locale === "ko") baseList = ["유성 점착 PP", "비점착 PP합성지", "하이드플렉스 현수막", "무결 현수막 원단"];
    else baseList = ["Adhesive PP", "Non-adhesive PP", "Hiflex banner", "Smooth banner"];
  } else if (isPackaging) {
    if (locale === "vi") baseList = ["Giấy Ivory", "Giấy Kraft", "Giấy Duplex", "Carton sóng"];
    else if (locale === "zh") baseList = ["白卡纸 (Ivory)", "牛皮纸 (Kraft)", "白板纸 (Duplex)", "瓦楞纸板"];
    else if (locale === "ja") baseList = ["アイボリー紙", "クラフト紙", "コートボール紙", "段ボール"];
    else if (locale === "ko") baseList = ["아이보리지", "크라프트지", "SC마닐라지", "골판지"];
    else baseList = ["Ivory board", "Kraft paper", "Duplex board", "Corrugated board"];
  } else if (isBookletOrCalendar) {
    if (locale === "vi") baseList = ["Giấy loại C", "Giấy loại F", "Giấy Mỹ thuật", "Bìa bồi Carton"];
    else if (locale === "zh") baseList = ["C类纸", "F类纸", "特种艺术纸", "精装灰板纸"];
    else if (locale === "ja") baseList = ["Cタイプ用紙", "Fタイプ用紙", "ファンシーペーパー", "厚紙ハードカバー"];
    else if (locale === "ko") baseList = ["C타입 용지", "F타입 용지", "고급 수입지", "하드커버 합지"];
    else baseList = ["Type C paper", "Type F paper", "Art paper", "Hardcover board"];
  } else {
    if (locale === "vi") baseList = ["Giấy loại C", "Giấy loại F", "Giấy loại I", "Giấy Kraft", "Giấy Mỹ thuật"];
    else if (locale === "zh") baseList = ["C类纸", "F类纸", "I类纸", "牛皮纸", "特种艺术纸"];
    else if (locale === "ja") baseList = ["Cタイプ用紙", "Fタイプ用紙", "Iタイプ用紙", "クラフト紙", "特殊紙"];
    else if (locale === "ko") baseList = ["C타입 용지", "F타입 용지", "I타입 용지", "크라프트지", "특수 고급지"];
    else baseList = ["Type C paper", "Type F paper", "Type I paper", "Kraft paper", "Art paper"];
  }

  // If currentMaterial is present and not matched, prepend it so the card's actual material is prominently shown
  if (currentMaterial) {
    const hasMatch = baseList.some(
      (m) => m.toLowerCase().includes(currentMaterial.toLowerCase()) || currentMaterial.toLowerCase().includes(m.toLowerCase())
    );
    if (!hasMatch) {
      return [currentMaterial, ...baseList.slice(0, 3)];
    }
  }

  return baseList;
}

/**
 * Returns dynamic post-press finishing options according to product & material nature (Bế, Dán, Cán màng...).
 */
export function getPostPressFinishing(
  productName: string,
  currentMaterial: string,
  locale: Locale,
  productId?: string,
  shapeId?: string,
  categoryId?: string
): string[] {
  const p = productName.toLowerCase();
  const pid = (productId ?? "").toLowerCase();
  const sid = (shapeId ?? "").toLowerCase();
  const cid = (categoryId ?? "").toLowerCase();
  const mat = currentMaterial.toLowerCase();

  const isDecal =
    sid.includes("decal") ||
    sid.includes("sticker") ||
    sid.includes("tem") ||
    p.includes("decal") ||
    p.includes("sticker") ||
    p.includes("tem") ||
    pid.includes("decal") ||
    pid.includes("sticker") ||
    mat.includes("decal");

  const isBannerOrPoster =
    sid.includes("standee") ||
    sid.includes("poster") ||
    sid.includes("banner") ||
    sid.includes("bang-ron") ||
    sid.includes("hiflex") ||
    p.includes("standee") ||
    p.includes("poster") ||
    p.includes("banner") ||
    pid.includes("poster") ||
    pid.includes("standee") ||
    mat.includes("pp") ||
    mat.includes("hiflex");

  const isBoxOrBag =
    cid.includes("packaging") ||
    cid.includes("bao-bi") ||
    sid.includes("hop") ||
    sid.includes("tui") ||
    p.includes("hộp") ||
    p.includes("túi") ||
    p.includes("thùng") ||
    pid.includes("hop") ||
    pid.includes("tui");

  const isFolder =
    sid.includes("folder") ||
    sid.includes("kep-file") ||
    sid.includes("bia-ho-so") ||
    p.includes("folder") ||
    p.includes("kẹp file") ||
    p.includes("bìa hồ sơ") ||
    pid.includes("folder");

  const isEnvelope =
    sid.includes("phong-bi") ||
    sid.includes("bao-thu") ||
    p.includes("phong bì") ||
    p.includes("bao thư") ||
    pid.includes("phong-bi");

  const isBookletOrCalendar =
    sid.includes("lich") ||
    sid.includes("so-tay") ||
    sid.includes("catalogue") ||
    sid.includes("tap-chi") ||
    p.includes("lịch") ||
    p.includes("sổ tay") ||
    p.includes("catalogue") ||
    pid.includes("lich") ||
    pid.includes("catalogue");

  if (isBoxOrBag) {
    if (locale === "vi") return ["Cán màng bảo vệ", "Bế dán thành phẩm", "Cấn gân gấp", "Bế demi", "Đục mắt ngỗng xỏ dây"];
    if (locale === "zh") return ["覆保护膜", "模切成型与糊盒", "压痕折线", "半穿模切", "打鸡眼穿绳"];
    if (locale === "ja") return ["保護ラミネート", "型抜き製函・糊貼り", "筋入れ折り目", "ハーフカット", "ハトメ・紐通し穴"];
    if (locale === "ko") return ["보호 코팅", "도무송 재단 및 접착", "오시 접선 가공", "반칼 가공", "타공 및 끈 연결"];
    return ["Protective lamination", "Die-cut & glued", "Creasing", "Kiss-cut", "Eyelet hole punch"];
  }

  if (isDecal) {
    if (locale === "vi") return ["Cán màng bóng/mờ", "Bế demi từng con", "Cắt đứt thành phẩm", "Bế theo file thiết kế"];
    if (locale === "zh") return ["光膜/哑膜", "半穿模切 (独立取用)", "全穿分条裁切", "异形轮廓裁切"];
    if (locale === "ja") return ["グロス/マットラミネート", "ハーフカット (1枚ずつ)", "全抜き断裁", "形状に沿ったカッティング"];
    if (locale === "ko") return ["유광/무광 코팅", "개별 반칼 도무송", "완칼 단품 재단", "자유형태 돔보 커팅"];
    return ["Gloss/matte lamination", "Kiss-cut stickers", "Die-cut singles", "Custom contour cut"];
  }

  if (isBannerOrPoster) {
    if (locale === "vi") return ["Cán màng chống nước", "Đóng khoen 4 góc", "Dán mép xỏ cây", "Gắn cuốn nhôm", "Cắt sát mép"];
    if (locale === "zh") return ["防水保护膜", "四角打扣环", "穿杆折边热合", "组装易拉宝铝架", "精细切边"];
    if (locale === "ja") return ["防水ラミネート", "四隅ハトメ加工", "袋縫いパイプ通し", "アルミロールアップ装着", "フチ裁断仕上げ"];
    if (locale === "ko") return ["방수 라미네이팅", "4각 아일렛 (타공)", "미싱 봉제 (파이프용)", "알루미늄 롤업 조립", "외곽선 정밀 재단"];
    return ["Waterproof lamination", "Corner eyelets", "Pole pocket hem", "Roll-up cassette mount", "Edge trim"];
  }

  if (isFolder) {
    if (locale === "vi") return ["Cán màng mờ", "Bế khuôn định hình", "Gấp dán tai cài", "Bế khe namecard"];
    if (locale === "zh") return ["覆哑膜", "模切定型", "插耳折叠糊袋", "名片插槽模切"];
    if (locale === "ja") return ["マットラミネート", "型抜き成形", "ポケット折り込み糊貼り", "名片スリット穴"];
    if (locale === "ko") return ["무광 코팅", "형태 도무송", "포켓 접착 가공", "명함 꽂이 칼선"];
    return ["Matte lamination", "Die-cut shape", "Fold & glue pocket", "Business card slit"];
  }

  if (isEnvelope) {
    if (locale === "vi") return ["Bế dán định hình", "Dán băng keo nắp", "Cấn nắp gập", "Cán màng mờ"];
    if (locale === "zh") return ["模切与折叠糊封", "封口自带双面胶条", "折盖压痕", "覆哑膜"];
    if (locale === "ja") return ["型抜き・製袋糊貼り", "フタ両面テープ加工", "折線筋入れ", "マットラミネート"];
    if (locale === "ko") return ["봉투 도무송 및 접착", "양면테이프 마감", "덮개 오시 가공", "무광 라미네이팅"];
    return ["Envelope die-cut & glued", "Adhesive peel & seal flap", "Scored flap fold", "Matte lamination"];
  }

  if (isBookletOrCalendar) {
    if (locale === "vi") return ["Cán màng bìa", "Đóng ghim giữa", "Vào keo gáy nhiệt", "Đóng lò xo", "Bo góc"];
    if (locale === "zh") return ["封面覆膜", "骑马钉装订", "无线胶装", "铁圈活页装订", "圆角加工"];
    if (locale === "ja") return ["表紙ラミネート", "中綴じ製本", "無線綴じ製本", "スパイラルリング製本", "角丸加工"];
    if (locale === "ko") return ["표지 코팅", "중철 제본", "무선 풀 제본", "스프링 제본", "귀도리 마감"];
    return ["Cover lamination", "Saddle stitching", "Perfect glue binding", "Spiral binding", "Corner rounding"];
  }

  // Default (Business cards, flyers, hangtags, vouchers, standard cards)
  if (locale === "vi") return ["Cán màng mờ", "Bế bo 4 góc", "Cắt vuông", "Ép kim logo", "Khoan lỗ xỏ dây"];
  if (locale === "zh") return ["覆哑膜", "四角圆角模切", "直角裁切", "烫金点缀", "打孔穿线"];
  if (locale === "ja") return ["マットラミネート", "4角角丸加工", "直角断裁仕上げ", "箔押し加工", "穴あけ加工"];
  if (locale === "ko") return ["무광 코팅", "4각 귀도리 (라운딩)", "직각 정밀 재단", "박 가공 포인트", "타공 가공"];
  return ["Matte lamination", "Rounded 4 corners", "Square trimmed", "Foil stamped accent", "Drilled hang hole"];
}
