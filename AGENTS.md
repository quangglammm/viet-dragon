# Viet Dragon – Agent Instructions

## Read the docs before touching Next.js APIs
This project uses **Next.js 16.2.9** — breaking changes from earlier versions are real.
Read `node_modules/next/dist/docs/` before writing any Next.js-specific code.
Most important breaking change: **`params` is now `Promise<{...}>`** — always `await params` in page and metadata functions.

---

## Stack & exact versions
| Package | Version | Notes |
|---|---|---|
| Next.js | 16.2.9 | App Router, React Server Components |
| React | 19.2.4 | |
| Tailwind CSS | v4 | `@theme inline` syntax — no `tailwind.config.ts` |
| Motion | 12.x | Import from `"motion/react"` — NOT `"framer-motion"` |
| next-intl | 4.13.x | `/[locale]` routing — see Internationalization below |
| Lenis | 1.3.x | Smooth scroll — desktop only (see below) |

GSAP/ScrollTrigger and the old pin/cover scroll rig (`PanelContainer.tsx`) were removed —
do not reintroduce them or look for that file; see **Scroll & entrance animation** below
for the current architecture.

---

## Project overview
**Viet Dragon** (vietdragon.vn) — professional printing company, HCM City & Bình Dương.
- Two real language **modes** — Vietnamese (default, unprefixed URLs) and English
  (`/en/...`) — switchable via the flag toggle in `Navbar.tsx`. Content shows in ONE
  language at a time; never render both inline (`"VI · EN"` strings) — see
  **Internationalization** below.
- Primary CTA everywhere: **"Nhận Báo Giá" / "Get a Quote"** → `/#cta`
- Visual direction: white/neutral backgrounds, printed product images take the spotlight
- All images are picsum placeholders (`unoptimized` prop required) — real photos come later

---

## Routes
Every route is nested under `app/[locale]/` — `locale` is `"vi"` (default, unprefixed:
`/`, `/products`) or `"en"` (prefixed: `/en`, `/en/products`).

| Route | Type | Notes |
|---|---|---|
| `/[locale]` | Server | 18 stacked sections (Hero → Footer), no scroll pinning |
| `/[locale]/products` | Server async | `await params` for `{ locale }` |
| `/[locale]/products/[categoryId]` | Server async | `await params`; `generateStaticParams` pre-generates all 4 categories (locales handled by the parent layout) |
| `/[locale]/blog` | Server async | `await params` for `{ locale }` |
| `/[locale]/blog/[slug]` | Server async | `await params`; `generateStaticParams` pre-generates all 6 posts |

Both `/products` and `/blog` have their own `layout.tsx` that wraps Navbar + Footer.
Root `app/[locale]/layout.tsx` calls `generateStaticParams` for both locales and
`setRequestLocale` — every nested page/layout under it is statically generated per locale.

---

## Design system
Rebranded from the original red palette to a purple/gradient system lifted from the
`template/` reference theme (ThemeForest "Printnow"). Defined in `app/globals.css` under
`:root` and `@theme inline`:
```css
--brand-primary: #7000fe   /* primary accent — CTAs, links, icons */
--brand-soft:    #f3f5ff   /* section bg — Portfolio, Testimonials, Services, Process cards */
--brand-dark:    #09052f   /* navbar top bar, footer, dark image overlays */
--brand-border:  #eeeff4   /* hairline borders */
--gradient-brand: linear-gradient(90deg, #ff4e8d 0%, #ae34e8 55%, #7000fe 100%)
```
Use as Tailwind classes: `bg-brand-primary`, `text-brand-dark`, etc. `--gradient-brand` is
not a Tailwind color utility — apply it via the `.text-gradient-brand` helper (gradient-clipped
text) or `background: var(--gradient-brand)`.

Reusable animation/theme utility classes (also in `globals.css`, ported from the same
reference theme — reuse these instead of re-implementing):
- `.btn-wipe` — two-corner diagonal fill on hover (signature CTA button treatment)
- `.eyebrow-pill` / `.eyebrow-pill-dark` / `.eyebrow-pill-text` — gradient-tinted pill label above section headings
- `.dot-nav-item` / `.is-active` — elongating pagination dot (8px → 32px, gradient fill when active)
- `imageWipeReveal` (in `lib/motion.ts`) — Motion variant for the clip-path "wipe down" image reveal; pair with `initial="hidden"` + `whileInView="visible"`

Font: **Be Vietnam Pro** via `--font-sans` — subsets: `latin`, `vietnamese`.

---

## Scroll & entrance animation
Landing page sections are plain stacked `<section>` elements — there is no scroll
pinning, no GSAP, and no `PanelContainer.tsx` (removed; don't reintroduce it or a
`.scroll-panel` class).

**Desktop (≥ 1024px):** `SmoothScroll.tsx` runs Lenis independently (its own `raf` loop)
purely for smooth-scroll feel — it is not wired to any pinning/ScrollTrigger system.

**Mobile/tablet (< 1024px):** `SmoothScroll.tsx` checks `window.innerWidth < 1024` and
returns early — native browser scroll is used so IntersectionObserver (`whileInView`)
fires correctly on touch devices.

**Section pattern:**
```tsx
className="relative w-full bg-white overflow-hidden py-14 lg:py-20"
```
No `h-screen`/`min-h-screen` requirement — sections size to content.

**Do NOT add siblings after closing `</div>` of the inner grid inside a `flex` section.**
Flex siblings in a row container will compete for width and crush grid cells. Mobile card strip in Hero is placed *inside* the text column div to avoid this.

---

## Animation patterns
- **Entrance animations**: prefer `whileInView` + `viewport={{ once: true, margin: "-80px" }}`
  for elements that animate independently (this is what `SectionHeading` uses internally)
- `useSectionInView()` (in `hooks/`) + `animate={inView ? {...} : {}}` for a section where
  multiple sibling elements must reveal off the *same* trigger — see Reusable UI primitives
- Hero cards: `originX: 0.5, originY: 1` (bottom-center pivot) creates the hand-of-cards fan
- Marquee: `animate={{ x: ["0%", "-50%"] }}` with **2 identical text spans** for seamless loop

---

## Data files
- `data/categories.ts` — `ProductCategory[]` (4 categories: Tiếp thị/Marketing, Văn phòng/Office,
  Bao bì/Packaging, Ấn phẩm Tết/Tet Publications — item counts vary per category); exports
  `showcaseImages`. Every name/description field is split `xVi`/`x` (English) — read with
  `pickLocale()`, never both at once.
- `data/posts.ts` — `BlogPost[]` (6 posts); exports `categoryColors`. Same split pattern,
  including full article bodies (`content` / `contentEn`).
- All `coverImage` / `image` fields use `https://picsum.photos/seed/<seed>/<w>/<h>`
- Add `unoptimized` to every `<Image>` using picsum — remove when real images are provided
- **`data/*.ts` vs `messages/*.json`**: structured records with a stable shape (categories,
  products, blog posts) live in `data/` with `xVi`/`x` field pairs. Pure UI copy (headings,
  buttons, FAQ, checklists, pricing plans) lives in `messages/vi.json` + `messages/en.json` —
  see Internationalization below. Don't move one into the other's convention.

---

## Internationalization
`next-intl` with `/[locale]` App Router segment routing. `vi` is default/unprefixed
(`/`, `/products`), `en` is prefixed (`/en`, `/en/products`) — `localePrefix: "as-needed"`
in `i18n/routing.ts`.

- **Always import `Link`, `usePathname`, `useRouter` from `@/i18n/navigation`** for internal
  links/navigation — never `next/link` or `next/navigation`. Using the plain Next.js versions
  is the single easiest way to break EN-locale navigation (links silently drop the `/en`
  prefix). `WipeButton` already does this internally.
- **UI copy** (headings, buttons, checklists, FAQ, pricing plans, etc.) lives in
  `messages/vi.json` / `messages/en.json`, namespaced per section (`about`, `pricing`, `faq`, …).
  Read with `useTranslations("namespace")` (client components) or
  `getTranslations({ locale, namespace })` (server/async). Both files must stay in sync —
  diff their flattened key sets after editing either one (a missing key throws at runtime).
- **List content** (arrays of translated objects — FAQ items, pricing features, process
  steps) — use `t.raw("key")`, which returns the JSON array/object unprocessed. Keep
  non-translatable metadata (icons, hrefs, image seeds, `highlighted` flags) in the
  component as a locale-agnostic array and zip it with `t.raw()` by index — see
  `Pricing.tsx` or `Portfolio.tsx` for the pattern.
- **`data/*.ts` fields** (not UI copy) — read via `pickLocale(locale, viValue, enValue)`
  from `lib/locale.ts`, with `locale` from `useLocale()` (client) or the page's own
  `params.locale` (server).
- **Never render both languages inline** (`"VI · EN"` or `{vi} / {en}`) — that pattern is
  what this migration removed; one locale renders at a time.
- Date formatting: `toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", {...})` — see
  `formatDate()` in the blog pages.
- `proxy.ts` (project root, **not** `middleware.ts` — Next 16 renamed the convention)
  runs `next-intl`'s `createMiddleware(routing)`.

## Reusable UI primitives
Introduced to stop re-implementing the same JSX per section — reach for these before
writing a new eyebrow/heading/button/badge block:
- `components/ui/section-heading.tsx` — eyebrow pill + `h2` (+ optional description),
  manages its own `whileInView` reveal. `dark` prop for dark-background sections.
- `components/ui/wipe-button.tsx` — `.btn-wipe` CTA in the standard markup shape
  (`tone`: primary/dark/light, `size`: sm/md/lg), renders the i18n-aware `Link`.
- `components/ui/icon-badge.tsx` — icon-in-circle badge (`size`: sm/md/lg, `rounded`: full/xl).
- `hooks/use-section-in-view.ts` — the `useRef` + `useInView(ref, { once: true, margin: "-80px" })`
  pair, for sections where multiple children must reveal off one shared trigger.
- `lib/locale.ts` — `pickLocale(locale, vi, en)` for `data/*.ts` field selection.

Not extracted (checked, not worth it): the "white card + rounded-2xl + border" shell
differs enough per section (row vs column, dark variant, floating card) that a shared
wrapper would need as many props as it saves.

## Navigation rules
- Hash links must always be absolute: `/#cta`, `/#services`, `/#vision` — never bare `#cta`
- Bare hashes (e.g. `#cta`) resolve relative to the current URL, breaking navigation from `/products` or `/blog`
- Navbar breakpoint: `lg` (1024px) — hamburger shows on mobile AND tablet; full nav at desktop only

---

## Component map
```
i18n/
  routing.ts               defineRouting({ locales: [vi, en], defaultLocale: vi })
  navigation.ts             Locale-aware Link/usePathname/useRouter/redirect — import from here, not next/*
  request.ts                getRequestConfig — loads messages/<locale>.json
messages/
  vi.json, en.json          UI copy, namespaced per section — keep key sets in sync
proxy.ts                    next-intl createMiddleware (Next 16 "proxy" convention, not middleware.ts)
hooks/
  use-section-in-view.ts    Shared useRef + useInView(once, margin -80px)
lib/
  locale.ts                 pickLocale(locale, vi, en) for data/*.ts fields
  utils.ts                  cn()
components/
  providers/
    SmoothScroll.tsx        Lenis init (desktop only, ≥1024px) — no GSAP, no pinning
  sections/                 all "use client"; landing page order = page.tsx import order
    Navbar.tsx              Fixed top nav, mobile hamburger drawer, VI/EN flag switcher
    Hero.tsx                3-slide autoplay carousel, word-highlight headline
    ShopCategories.tsx      Horizontal category rail (scroll-snap on mobile)
    ShopBanner.tsx          2-up promo banner
    About.tsx               Image + stat card, checklist, CTA
    Services.tsx            4 free-service cards
    Shop.tsx                 Tabbed product grid by category
    CtaBanner.tsx            Full-bleed image banner, 2 CTAs
    Portfolio.tsx            Asymmetric project mosaic (desktop) / 2×3 grid (mobile)
    Pricing.tsx              3-tier plan cards
    Testimonials.tsx         Autoplay quote carousel, dot-nav
    FAQ.tsx                  Accordion + image
    Quality.tsx              Dark bg, quality checklist
    Process.tsx              3-step process cards
    BlogPreview.tsx          3-post preview (landing page section)
    Brands.tsx               Infinite marquee of served industries
    CTA.tsx                  Full-viewport brand-primary CTA (`/#cta` anchor target)
    Footer.tsx               Dark footer, 4 columns
  ui/
    section-heading.tsx, wipe-button.tsx, icon-badge.tsx   Reusable primitives — see above
    accordion.tsx, avatar.tsx, badge.tsx, button.tsx, card.tsx, separator.tsx, tabs.tsx   shadcn/ui primitives
```
