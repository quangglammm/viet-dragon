import type { Locale } from "@/i18n/routing";

// The rule that rewrote a stored material name into the canonical stock name the product card showed ("Couche" -> "Giấy loại C"),
// kept verbatim from the card it used to live in (components/ui/material-flashcard.tsx, which now reads the heading from the database).
// The seed uses it to find the ~44 distinct stocks behind the 110 option rows. It leaves with the seed's legacy sources.

export function formatMaterialDisplayName(name: string, locale: Locale): string {
  if (locale === "vi") {
    if (/^(c300(\s*\(chuẩn\))?|c300\s*-\s*c350.*|couche\b.*|giấy\s+couche\b.*)$/i.test(name)) {
      if (/bồi carton/i.test(name)) {
        return name.replace(/couche/i, "Giấy loại C");
      }
      return "Giấy loại C";
    }
    if (/^c300\s+ép kim/i.test(name)) {
      return "Giấy loại C Ép Kim Vàng";
    }
    if (/^(ford\s*300(gsm)?(\s*\(.*\))?|ford\s+\d+.*(\(.*\))?|ruột\s+giấy\s+ford.*|lịch\s+để\s+bàn\s+giấy\s+ford.*)$/i.test(name)) {
      return "Giấy loại F";
    }
    if (/^ivory\b.*$/i.test(name)) {
      return "Giấy loại I";
    }

    let result = name;
    result = result.replace(/\bgiấy\s+couche\b/gi, "Giấy loại C");
    result = result.replace(/\b(c300|couche)\b/gi, "Giấy loại C");
    result = result.replace(/\bgiấy\s+ford(\s*300(gsm)?)?\b/gi, "Giấy loại F");
    result = result.replace(/\bford\s*300(gsm)?\b/gi, "Giấy loại F");
    result = result.replace(/\bford\b/gi, "Giấy loại F");
    result = result.replace(/\bgiấy\s+ivory\b/gi, "Giấy loại I");
    result = result.replace(/\bivory\b/gi, "Giấy loại I");
    return result;
  }
  if (locale === "en") {
    if (/^(c300.*|couche.*)$/i.test(name)) {
      if (/corrugated|carton/i.test(name)) {
        return name.replace(/couche/i, "Type C Paper");
      }
      return "Type C Paper";
    }
    if (/^ford\b.*$/i.test(name)) {
      return "Type F Paper";
    }
    if (/^ivory\b.*$/i.test(name)) {
      return "Type I Paper";
    }
    let result = name;
    result = result.replace(/\b(c300|couche)\b/gi, "Type C Paper");
    result = result.replace(/\bford\s*300(gsm)?\b/gi, "Type F Paper");
    result = result.replace(/\bford\b/gi, "Type F Paper");
    result = result.replace(/\bivory\b/gi, "Type I Paper");
    return result;
  }
  if (locale === "zh") {
    if (/^c300\b/i.test(name) || /^couche\b/i.test(name) || /铜版纸/.test(name)) return "C类纸";
    if (/^ford\b/i.test(name) || /道林纸/.test(name)) return "F类纸";
    if (/^ivory\b/i.test(name) || /白卡纸/.test(name)) return "I类纸";
  }
  if (locale === "ja") {
    if (/^c300\b/i.test(name) || /^couche\b/i.test(name) || /コート紙/.test(name)) return "Cタイプ用紙";
    if (/^ford\b/i.test(name) || /上質紙/.test(name)) return "Fタイプ用紙";
    if (/^ivory\b/i.test(name) || /アイボリー/.test(name)) return "Iタイプ用紙";
  }
  if (locale === "ko") {
    if (/^c300\b/i.test(name) || /^couche\b/i.test(name) || /아트지/.test(name)) return "C타입 용지";
    if (/^ford\b/i.test(name) || /모조지/.test(name)) return "F타입 용지";
    if (/^ivory\b/i.test(name) || /백상지|아이보리/.test(name)) return "I타입 용지";
  }
  return name;
}
