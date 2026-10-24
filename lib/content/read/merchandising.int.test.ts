import { readFileSync } from "node:fs";
import { createTranslator } from "next-intl";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { pickLocale } from "@/lib/locale";
import { LOCALES, translated } from "@/scripts/seed/localized";
import { createSeededDatabase, type SeededDatabase } from "@/tests/helpers/seeded-db";
import { loadFastPrint, loadMessages, loadShowcase } from "./load";
import { fastPrintCardsOf, showcaseCardsOf, showcaseSlotsOf, type FastPrint, type ShowcaseItemView } from "./merchandising";

// Fast Print, the showcase and the UI copy as a database seeded from the old files serves them, against what the old pages computed.

let seeded: SeededDatabase;
let fastPrint: FastPrint;
let showcase: ShowcaseItemView[];

beforeAll(async () => {
  seeded = await createSeededDatabase("read-merch");
  fastPrint = await loadFastPrint(seeded.db);
  showcase = await loadShowcase(seeded.db);
}, 180_000);
afterAll(async () => {
  await seeded.close();
});

const messagesFile = (locale: string): Record<string, unknown> => JSON.parse(readFileSync(`messages/${locale}.json`, "utf8"));

describe("Fast Print", () => {
  const SUFFIX = { vi: "Vi", en: "En", zh: "Zh", ja: "Ja", ko: "Ko" } as const;

  it("shows the six old items in the old order, worded, priced and pictured as the old page did, in every language", () => {
    const bad: string[] = [];
    const old = seeded.src.fastPrint;
    for (const locale of LOCALES) {
      const cards = fastPrintCardsOf(fastPrint, locale);
      expect(cards.map((card) => card.key)).toEqual(old.map((item) => item.id));
      // The price line the page writes: the UI copy's template filled with the item's amount and the unit's name.
      const t = createTranslator({ locale, messages: messagesFile(locale), namespace: "fastPrint" }) as unknown as (key: string, values: Record<string, string | number>) => string;
      cards.forEach((card, at) => {
        const item = old[at] as Record<string, string>;
        const field = (base: string) => item[`${base}${SUFFIX[locale]}`];
        if (card.name !== field("name")) bad.push(`${item.id} ${locale} name`);
        if (card.tag !== field("tag")) bad.push(`${item.id} ${locale} tag`);
        if (card.description !== field("desc")) bad.push(`${item.id} ${locale} description`);
        if (card.icon !== item.icon) bad.push(`${item.id} icon`);
        const price = card.price ? t("price", { amount: card.price.amount, unit: card.price.unit }) : null;
        if (price !== field("price")) bad.push(`${item.id} ${locale} price «${price}» for «${field("price")}»`);
      });
    }
    expect(bad).toEqual([]);
  });

  it("serves the pictures from the media library", () => {
    expect(fastPrintCardsOf(fastPrint, "vi").map((card) => card.image)).toEqual(seeded.src.fastPrint.map((item) => item.image));
  });
});

describe("the showcase", () => {
  it("shows the five old pictures with the old captions in every language", () => {
    const bad: string[] = [];
    const old = seeded.src.showcase;
    for (const locale of LOCALES) {
      const cards = showcaseCardsOf(showcase, locale);
      expect(cards).toHaveLength(old.length);
      cards.forEach((card, at) => {
        const s = old[at];
        const label = pickLocale(locale, s.label, s.labelEn, translated(seeded.src.translations.SHOWCASE_LABELS, s.seed, "zh"), translated(seeded.src.translations.SHOWCASE_LABELS, s.seed, "ja"), translated(seeded.src.translations.SHOWCASE_LABELS, s.seed, "ko"));
        if (card.label !== label) bad.push(`${s.seed} ${locale}`);
        if (card.src !== s.src || card.aspect !== s.aspect) bad.push(`${s.seed} picture`);
      });
    }
    expect(bad).toEqual([]);
  });

  it("slots the desktop layout the way the old page indexed it: one tall, two squares, two wides", () => {
    const slots = showcaseSlotsOf(showcaseCardsOf(showcase, "vi"));
    expect([slots.tall?.src, ...slots.squares.map((card) => card.src), ...slots.wides.map((card) => card.src)]).toEqual(seeded.src.showcase.map((item) => item.src));
  });
});

describe("the UI copy", () => {
  it("is the files' texts when nothing was published over them (the seed carried the files over)", async () => {
    for (const locale of LOCALES) expect(await loadMessages(seeded.db, locale), locale).toEqual(messagesFile(locale));
  });

  it("shows a published text in its language only, and leaves every other text alone", async () => {
    const vi = messagesFile("vi") as { nav: { quote: string } };
    await seeded.scratch.pool.query(`update site_message set data = jsonb_set(data, '{quote}', '"Báo giá ngay"') where locale = 'vi' and namespace = 'nav'`);
    const merged = (await loadMessages(seeded.db, "vi")) as { nav: { quote: string; openMenu: string } };
    expect(merged.nav.quote).toBe("Báo giá ngay");
    expect(merged.nav.openMenu).toBe((vi as unknown as { nav: { openMenu: string } }).nav.openMenu);
    expect((await loadMessages(seeded.db, "en")) as unknown).toEqual(messagesFile("en"));
  });

  it("keeps the file's text where the published one is empty, and ignores a namespace the files do not have", async () => {
    await seeded.scratch.pool.query(`update site_message set data = jsonb_set(data, '{quote}', '""') where locale = 'ja' and namespace = 'nav'`);
    await seeded.scratch.pool.query(`insert into site_message (locale, namespace, data) values ('ja', 'strayNamespace', '{"x": "y"}')`);
    const merged = (await loadMessages(seeded.db, "ja")) as Record<string, unknown> & { nav: { quote: string } };
    expect(merged.nav.quote).toBe((messagesFile("ja") as { nav: { quote: string } }).nav.quote);
    expect(merged.strayNamespace).toBeUndefined();
  });
});
