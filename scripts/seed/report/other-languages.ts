import type { Notes } from "../notes";
import { BULLET_SUGGESTIONS, SUGGESTED_LOCALES, SUGGESTION_COMMENT, SUGGESTION_TEXT_COUNTS, TRAIT_SUGGESTIONS } from "../suggested-translations";
import type { ReportData } from "./collect";
import { counted, lines, n, renderInfo, table, type Info } from "./format";

// Part 3: Chinese, Japanese and Korean. They follow English: URLs are copies of English (Latin letters only), text
// that exists is kept, and the gaps are filled with AI-suggested translations that need a native reader. None of this
// needs a decision now, so the items are information — apart from one box approving the suggestions as a stopgap.

function materialNames(notes: Notes): Info {
  const conflicts = notes.get("material-name-conflict");
  return {
    title: "Cùng một loại giấy nhưng tên dịch khác nhau giữa các sản phẩm",
    today: "Một loại giấy dùng chung ở nhiều sản phẩm đang được dịch bằng những cách gọi khác nhau (chủ yếu tiếng Trung / Nhật / Hàn).",
    facts: counted(`${n(conflicts.length)} cặp (loại giấy × ngôn ngữ) bị lệch.`, conflicts, 4),
    next: "Tên được dùng nhiều nhất trở thành tên chung của loại giấy; tên riêng của từng sản phẩm vẫn được giữ làm tiêu đề thẻ nên website hiển thị y như cũ. Người dịch bản ngữ thống nhất sau (Phụ lục C).",
  };
}

function sharedTranslations(data: ReportData): Info {
  const { stats, notes } = data.outcome;
  const shared = Object.entries(stats.sharedListings);
  const conflicts = notes.get("title-precedence-differs");
  return {
    title: "Sản phẩm ở hai danh mục dùng chung một bản dịch; tiêu đề có hai nguồn",
    today: "Một số sản phẩm có ở cả danh mục thường và danh mục Tết nhưng chỉ có một bản dịch tiếng Trung/Nhật/Hàn cho cả hai; tiêu đề zh/ja/ko còn có hai nơi lưu với thứ tự ưu tiên khác nhau giữa các trang.",
    facts: lines([
      `${n(shared.length)} sản phẩm nằm ở nhiều danh mục: ${shared.map(([id, categories]) => `${id} (${categories.join(", ")})`).join("; ")}.`,
      `${n(conflicts.length)} trường hợp (sản phẩm × ngôn ngữ) có tiêu đề ở hai nơi khác nhau.`,
    ]),
    next: "Hai bản dùng chung bản dịch hiện có; khi tiêu đề có hai nguồn, nguồn nằm trong chính sản phẩm được ưu tiên. Viết nội dung riêng cho phiên bản Tết khi có người dịch.",
  };
}

function specPhrases(notes: Notes): Info {
  const phrases = notes.get("spec-same-vi-different-translation");
  return {
    title: "Cùng một cụm tiếng Việt nhưng bản dịch tiếng Nhật/Hàn khác nhau",
    today: "Một số cụm thông số tiếng Việt giống hệt nhau ở các danh sách khác nhau nhưng được dịch khác nhau sang tiếng Nhật hoặc tiếng Hàn.",
    facts: counted(`${n(phrases.length)} cụm.`, phrases),
    next: "Mỗi bản dịch là một mục thông số riêng, nên website hiển thị y như cũ. Gộp thành một bản dịch khi có người dịch bản ngữ.",
  };
}

function summarizingBullets(data: ReportData): Info {
  const lists = data.outcome.notes.get("bullet-count-differs-by-locale");
  return {
    title: "Gạch đầu dòng «phù hợp cho» tiếng Trung/Nhật/Hàn chỉ có một dòng tóm tắt",
    today: "Ba lựa chọn của sản phẩm Tờ rơi Tết có ba gạch đầu dòng «phù hợp cho» ở tiếng Việt và tiếng Anh, nhưng tiếng Trung / Nhật / Hàn chỉ có một dòng gộp cả ba ý.",
    facts: counted(`${n(lists.length)} danh sách bị lệch số dòng giữa các ngôn ngữ.`, lists),
    next: `Dòng tóm tắt được thay bằng ba dòng dịch sát nghĩa (${n(SUGGESTION_TEXT_COUNTS.bullets)} đoạn, Phụ lục D). Dòng tóm tắt gốc nằm trong phiên bản 1 và trong bản lưu gốc, khôi phục được bất cứ lúc nào.`,
  };
}

/** Part 3, from the intro to the approval box. */
export function renderOtherLanguages(data: ReportData): string {
  const infos = [materialNames(data.outcome.notes), sharedTranslations(data), specPhrases(data.outcome.notes), summarizingBullets(data)];
  const traits = Object.keys(TRAIT_SUGGESTIONS).length;
  return [
    `## 3. Tiếng Trung, tiếng Nhật, tiếng Hàn — theo English, dịch sau`,
    `**Không cần chủ shop quyết định các mục này bây giờ.** Tiếng Việt và English phải hoàn chỉnh và được duyệt trước (phần 2); ba ngôn ngữ còn lại được dựng từ English để mọi trang đều có đủ nội dung và đường dẫn.`,
    lines([
      "**Đường dẫn:** sao chép từ English (chữ Latin không dấu, giống ở mọi ngôn ngữ); biên tập viên có thể sửa sau.",
      "**Văn bản đã có** trong dữ liệu hiện nay (tên sản phẩm, mô tả, chất liệu…): giữ nguyên, không đổi.",
      `**Văn bản chưa có:** ${n(SUGGESTION_TEXT_COUNTS.traits)} đoạn trong từ điển đặc điểm chất liệu (${n(traits)} đặc điểm × tên + mô tả × 3 ngôn ngữ) và ${n(SUGGESTION_TEXT_COUNTS.bullets)} dòng «phù hợp cho» — đã được **dịch đề xuất bằng AI** (Phụ lục D). Các bản dịch này chưa qua người đọc bản ngữ nên được đánh dấu ở khắp nơi: lưu thành phiên bản số 2 của từng mục (kèm ghi chú «${SUGGESTION_COMMENT}»), bản gốc là phiên bản 1.`,
      "Sau khi bổ sung, mức đầy đủ của tiếng Trung / Nhật / Hàn đạt 100% như tiếng Việt và English (bảng ở phần 1).",
    ]),
    infos.map(renderInfo).join("\n\n"),
    [
      `### Bản dịch đề xuất bằng AI`,
      `Các bản dịch trong Phụ lục D dùng tạm cho đến khi có người bản ngữ duyệt (có thể sửa ngay trong trang quản trị).`,
      `**Quyết định:** ☐ Dùng tạm các bản dịch đề xuất    ☐ Không dùng (hiện bản English)    ☐ Đã có người bản ngữ duyệt: ____________________`,
    ].join("\n\n"),
  ].join("\n\n");
}

/** Appendix D: every suggested text next to the Vietnamese it came from. */
export function renderSuggestionTables(data: ReportData): string {
  const { traits, bullets } = data.suggestionSources;
  const traitRows = Object.entries(TRAIT_SUGGESTIONS).flatMap(([key, byLocale]) => [
    [`\`${key}\` — tên`, traits[key]?.label ?? "", ...SUGGESTED_LOCALES.map((l) => byLocale[l].label), "☐"],
    [`\`${key}\` — mô tả`, traits[key]?.description ?? "", ...SUGGESTED_LOCALES.map((l) => byLocale[l].description), "☐"],
  ]);
  const bulletRows = BULLET_SUGGESTIONS.flatMap((suggestion, option) =>
    suggestion.bestFor.zh.map((_, index) => [
      `${suggestion.product} — ${suggestion.optionNameVi} (dòng ${index + 1})`,
      bullets[option]?.bestForVi[index] ?? "",
      ...SUGGESTED_LOCALES.map((l) => suggestion.bestFor[l][index]),
      "☐",
    ]),
  );
  const header = ["Mục", "Tiếng Việt (nguồn)", "中文", "日本語", "한국어", "Người bản ngữ đã duyệt"];
  return [
    `### Phụ lục D — bản dịch đề xuất bằng AI (${n(traitRows.length * SUGGESTED_LOCALES.length + bulletRows.length * SUGGESTED_LOCALES.length)} đoạn)`,
    `**Đặc điểm chất liệu** (${n(traitRows.length / 2)} đặc điểm):`,
    table(header, traitRows),
    `**Gạch đầu dòng «phù hợp cho»** (thay cho dòng tóm tắt gốc):`,
    table(header, bulletRows),
  ].join("\n\n");
}
