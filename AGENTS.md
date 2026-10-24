# Viet Dragon – Agent Instructions

## Read the docs before touching Next.js APIs
This project uses **Next.js 16.2.x** (16.2.12 installed) — breaking changes from earlier versions are real.
Read `node_modules/next/dist/docs/` before writing any Next.js-specific code.
Most important breaking change: **`params` is now `Promise<{...}>`** — always `await params` in page and metadata functions.

Other v16 facts, verified against those docs:
- `proxy.ts` (not `middleware.ts`) defaults to the **Node.js runtime**.
- `revalidateTag(tag, profile)` needs the second argument (`{ expire: 0 }` for immediate expiry
  from a Route Handler); the one-argument form is deprecated.
- `output: "standalone"` does **not** copy `public/` or `.next/static` — a Docker image must copy them itself.

---

## Stack & exact versions
| Package | Version | Notes |
|---|---|---|
| Next.js | 16.2.x (16.2.12 installed) | App Router, React Server Components |
| React | 19.2.4 | |
| Tailwind CSS | v4 | `@theme inline` syntax — no `tailwind.config.ts` |
| Motion | 12.x | Import from `"motion/react"` — NOT `"framer-motion"` |
| next-intl | 4.13.x | `/[locale]` routing — see Internationalization below |
| Lenis | 1.3.x | Smooth scroll — desktop only (see below) |
| Swiper | 14.x | Hero and Testimonials carousels — `swiper/react` + `swiper/modules` |
| zod | 4.x | Env validation (`lib/env.ts`); request-body validation in the admin API (planned) |
| pino | 10.x | Server logging — only through `lib/logger.ts`, see **Logging** below |
| Drizzle ORM · drizzle-kit · `pg` | 0.45.x · 0.31.x · 8.x | PostgreSQL access (`lib/db`) and migrations (`drizzle.config.ts`); schema = auth + audit + the CMS content model (45 tables, Phase 3a — see **Content model**) |
| Better Auth · `@better-auth/drizzle-adapter` · `auth` CLI | 1.7.12 (exact, keep all three in lockstep) | Invite-only accounts, DB sessions, admin plugin (roles). `@node-rs/argon2` hashes passwords. See **Authentication** below |
| tsx | 4.x | Runs `scripts/admin-cli.ts` (`admin:create` / `admin:reset-password`). Dev dependency, also used inside the Docker `tools` image |

GSAP/ScrollTrigger and the old pin/cover scroll rig (`PanelContainer.tsx`) were removed —
do not reintroduce them or look for that file; see **Scroll & entrance animation** below
for the current architecture.

---

## Package manager
This project uses **pnpm** (pinned via `packageManager` in `package.json`) — not npm or yarn.
- Install deps: `pnpm install` — never `npm install`/`yarn install`. Running the wrong tool
  regenerates `package-lock.json`/`yarn.lock` as a second, conflicting lockfile.
- Add a dependency: `pnpm add <pkg>` · dev dependency: `pnpm add -D <pkg>`
- Run scripts: `pnpm dev`, `pnpm build` (runs `next build --webpack`), `pnpm start`, `pnpm lint`, `pnpm test`, `pnpm test:int`,
  `pnpm admin:create`, `pnpm admin:reset-password <email>` (see **Authentication**), `pnpm seed` (see **Content model**)
- `pnpm-lock.yaml` is the only lockfile committed — if `package-lock.json` or `yarn.lock`
  ever reappear (e.g. an editor auto-ran `npm install`), delete them, don't commit them.
- `pnpm-workspace.yaml` holds `allowBuilds` approvals for deps with native build scripts
  (`@parcel/watcher`, `@swc/core`, `sharp`, `unrs-resolver`). If `pnpm install` reports
  `ERR_PNPM_IGNORED_BUILDS` after adding a new dependency, run `pnpm approve-builds` from
  an interactive terminal (not a non-TTY/agent shell — it writes unresolved
  `set this to true or false` placeholders there instead of prompting) and commit the
  updated file.

---

## Project overview
**Viet Dragon** (vietdragon.vn) — professional printing company, TP. Hồ Chí Minh, Đồng Nai, Vũng Tàu & Bình Dương.
- Five locales — Vietnamese (`vi`, default, unprefixed URLs), English (`en`), Chinese (`zh`),
  Japanese (`ja`) and Korean (`ko`), all non-default ones prefixed (`/en/...`, `/zh/...`) —
  switchable via the flag dropdown in `Navbar.tsx`. Content shows in ONE language at a
  time; never render both inline (`"VI · EN"` strings) — see **Internationalization** below.
- Primary CTA everywhere: **"Nhận Báo Giá" / "Get a Quote"** → `/#cta`
- Visual direction: white/neutral backgrounds, printed product images take the spotlight
- Real photos live under `public/images/<section>/` (hero, about, category, product,
  portfolio, service, quality, cta, faq, blog) — these `<Image>`s render without an
  `unoptimized` prop. Exception: **testimonial avatars** (`Testimonials.tsx`) still hit
  `picsum.photos/seed/vdt{1,2,3}/80/80`, so `next.config.ts`'s `images.remotePatterns`
  entry for `picsum.photos` must stay until those are replaced.
- `public/videos/about.mp4` — background/loop video used by the About section.
- Floating chrome rendered outside the section stack: `FloatingContact` (Zalo + phone
  buttons, bottom-right, global in `app/[locale]/layout.tsx`) and `MaterialGlossaryFab`
  (bottom-left icon-legend popover, on the pages that show material cards). Shared phone/Zalo constants live in `lib/contact.ts` — reuse those
  instead of re-hardcoding the number. `app/[locale]/layout.tsx` also mounts
  `SiteDataProvider` (the navigation read from the content database), `QuoteModalProvider` (the quote modal) and `LanguageDetectorToast`.
- Consult leads: `QuoteModal` and `ConsultBottomSheet` both POST to `/api/consult`, which emails
  the lead via nodemailer (SMTP env vars — see **Environment variables**). `/zalo-reply` is a
  standalone client page (outside `[locale]`) that copies a prepared reply and opens Zalo.

---

## Routes
Public routes are nested under `app/[locale]/` — `locale` is `"vi"` (default, unprefixed:
`/`, `/products`) or one of `"en"`, `"zh"`, `"ja"`, `"ko"` (prefixed: `/en`, `/en/products`,
`/zh/products`, …).

| Route | Type | Notes |
|---|---|---|
| `/[locale]` | Server | Navbar + 17 stacked sections (Hero → Footer, including `PartnerLogos`), no scroll pinning |
| `/[locale]/products` | Server async | `await params`; showcase gallery + one card per category from the content database |
| `/[locale]/products/fast-print` | Server + client | "In nhanh lấy liền" page; interactive part in `FastPrintClient.tsx` (static until the next milestone) |
| `/[locale]/products/[category]` | Server async, **dynamic** | `await params`; `resolvePage` (`lib/content/read/resolve-page.ts`) → `categoryPageOf`; the segment is the category's slug in the page's language |
| `/[locale]/products/[category]/[product]` | Server async, **dynamic** | a product's shapes grid (`SubgroupShapesView`) or, with no shapes, its materials (`ProductDetailView`) |
| `/[locale]/products/[category]/[product]/[segment]` | Server async, **dynamic** | one shape of the product, or one of its materials scrolled to; both through `ProductDetailView` |
| `/[locale]/blog` | Server async | `await params` for `{ locale }` |
| `/[locale]/blog/[slug]` | Server async | `await params`; `generateStaticParams` pre-generates every post in `blogPosts` (6 today) |
| `/[locale]/[...rest]` | Server | Catch-all that only calls `notFound()`, so unknown URLs (and every other `notFound()` under `[locale]`) render `[locale]/not-found.tsx` — a localized 404 (namespace `notFound`, Navbar + Footer). Without it `[locale]` as the top-level segment never reaches that file |

Routes **outside** `[locale]` (excluded from the next-intl `proxy.ts` matcher):

| Route | Notes |
|---|---|
| `/admin/*` | CMS UI — own root layout, Vietnamese only. `/admin/content/[type]` (list) and `/admin/content/[type]/[id]` (editor) are the editors on the content database (Phase 3d). See **Admin CMS** |
| `/api/admin/*` | CMS API — legacy `blog`, `media`, `products`, `translations`, `translate` (Phase 3d replaces them) and the new `content/**` (drafts, publish, revisions, delete — see **Content model**). Every handler starts with `requireApiUser` (a test enforces it) |
| `/api/auth/*` | Better Auth (`app/api/auth/[...all]/route.ts`): sign-in/out, session, password change, admin-plugin user management. Sign-in must use this HTTP surface — only HTTP requests are rate limited, not `auth.api.*` calls |
| `/api/consult` | Public. Receives quote/consult leads from `QuoteModal` / `ConsultBottomSheet`, emails them |
| `/zalo-reply` | Client page that copies a prepared reply message and opens Zalo (`noindex`) |
| `/api/health` | Liveness for the Docker healthcheck: always 200 while the process serves, body `{ status, db: "ok" \| "down" }` — a database outage must not mark the app unhealthy |
| `/robots.txt` | `app/robots.ts` — disallows `/admin`, `/api/`, `/zalo-reply`; no `sitemap` entry until Phase 4 |

`/products` and `/blog` have their own `layout.tsx` that wraps Navbar + Footer
(the `[category]/[product]` detail pages nest under the `/products` layout).
Root `app/[locale]/layout.tsx` reads the navigation from the content database (`getNavigation`) and calls `setRequestLocale`;
its `generateStaticParams` returns `[]`, so **nothing under `[locale]` is prerendered**: `next build` needs no database, the home page and
the other static pages are generated on their first request and cached until a publish touches what they read (tags), and the three
catalog routes above are plain dynamic routes (no `generateStaticParams`) that render per request from the tag-cached reads
(~15–30 ms measured). Why dynamic: when a cached (ISR) page throws a redirect, Next 16.2.12 sends the `Location` header twice on the first
response, and clients that join repeated headers (Node's `fetch`, some crawlers) follow «/a, /a» to a 404 — found by the parity run; a
dynamic render sends it once, and an alias released in the admin stops redirecting at once. Do not add `generateStaticParams` or
`connection()` to those routes (a dynamic API under ISR is a 500, `DYNAMIC_SERVER_USAGE`).

**SEO today:** per-page `title` + `description` only (5 languages; the catalog pages' come from the database), `metadataBase` from `SITE_URL`,
`alternateLinks: false` in `i18n/routing.ts` (next-intl's automatic `Link: rel="alternate"` headers name the SAME path in every language, which
is wrong now that each language has its own slugs),
`noindex` on `/admin` and `/zalo-reply`. Canonical, `hreflang` (+ `x-default`), Open Graph, JSON-LD
and `sitemap.xml` are Phase 4 (`lib/seo`); the SEO fields (`seo_title`, `seo_description`,
`og_media_id`) are in the content schema since Phase 3a (nothing reads them yet) — see `docs/data-model.md` §11.5a.

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
- `.dot-nav-item` / `.is-active` — elongating pagination dot (8px → 32px, gradient fill when active);
  wired into Testimonials' Swiper instance via `pagination={{ bulletClass, bulletActiveClass }}`
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
Flex siblings in a row container will compete for width and crush grid cells — nest a new
element inside the existing column/grid div instead of appending it as a row sibling.

---

## Animation patterns
- **Entrance animations**: prefer `whileInView` + `viewport={{ once: true, margin: "-80px" }}`
  for elements that animate independently (this is what `SectionHeading` uses internally)
- `useSectionInView()` (in `hooks/`) + `animate={inView ? {...} : {}}` for a section where
  multiple sibling elements must reveal off the *same* trigger — see Reusable UI primitives
- Hero: Swiper (`effect="fade"`, `crossFade: true`, autoplay) cross-fades slides *and* the
  section's own gradient background together (`gradients[index]` keyed off `onSlideChange`)
- Testimonials: Swiper autoplay carousel, pagination styled via `.dot-nav-item`/`.is-active`
- Marquee: `animate={{ x: ["0%", "-50%"] }}` with **2 identical text spans** for seamless loop

---

## Data files
- `data/subgroups-catalog.ts` (≈9,200 lines) — **no longer read by the public site (since Phase 4 M2): it is the seed's input**
  (`pnpm seed`) and the legacy admin's; a test (`lib/content/read/legacy-sources.test.ts`) fails if public code imports it, the menus,
  `data/translations`, `data/categories` (values), `lib/product-sizes`, `lib/product-specs`, `lib/shape-aliases` or `lib/content-store`
  (one listed leftover until M3: the showcase captions on `/products`). Phase 4 M5 moves them under `scripts/seed/legacy/`. What it holds: `MAIN_CATEGORIES` (4: Tiếp thị/Marketing, Văn phòng/Office, Bao bì/Packaging,
  Ấn phẩm Tết/Tet Publications) and `SUBGROUPS_CATALOG` (25 subgroups — 7 marketing, 6 office,
  4 packaging, 8 tet — with 77 shapes and 101 materials in total); lookups via
  `getSubgroupById()` / `getSubgroupsByCategory()`.
- `data/categories.ts` — the **types** (`ProductCategory`, `ProductItem`, `ProductOption`,
  `ProductOptionGroup`), still read by the seed and the legacy admin; `showcaseImages` moved to `data/showcase.ts`. Every name/description field is split `xVi`/`x`
  (English) with optional `xZh`/`xJa`/`xKo` — read with `pickLocale()`, never several at once.
- `data/translations.ts` — extra zh/ja/ko text kept **outside** the records
  (`SHOWCASE_LABELS`, `CATEGORY_NAMES`, `CATEGORY_DESCS`, `ITEM_NAMES`, `ITEM_DESCS`,
  `SHAPE_DESCS`, keyed by id). The seed reads it; of the public site only `/products` still does (showcase captions).
- `data/posts.ts` — `BlogPost` type, `blogPosts` (6 posts, **imported from
  `data/content/posts.json`** at build time) and `categoryColors`. Same `xVi`/`x` split,
  including full article bodies (`content` / `contentEn` / `contentZh` / …).
- `data/marketing-menu.ts`, `office-menu.ts`, `packaging-menu.ts`, `tet-menu.ts` — the old Navbar
  mega-menu definitions; the seed reads them, the Navbar now draws the menus from the database (`MegaMenuDesktop` / `MegaMenuMobile`).
- `data/content/*.json` — files written by the current admin (`posts.json`, `products.json`,
  `subgroups.json`). Only `posts.json` is read by the site (via `data/posts.ts`); `products.json`
  and `subgroups.json` are **not read by any public page**.
- `data/material-traits.ts` — the old icon glossary for `ProductOption.descriptionTraits` bullets; the seed reads it, the card and the
  glossary popover now read the traits from the database.
- `coverImage` / `image` fields are real local paths (`/images/category/...`,
  `/images/product/...`, `/images/blog/...`) served straight from `public/` — no
  `unoptimized` prop needed on those `<Image>`s. The one picsum reference in the
  codebase is the testimonial avatar seeds in `Testimonials.tsx` (not a `data/*.ts` field —
  those live inline in the component, zipped with `messages/*.json` `t.raw("items")`).
- **`data/*.ts` vs `messages/*.json`**: structured records with a stable shape (blog posts, until the next
  milestone moves them; categories, products and traits are in the database) live in `data/` with `xVi`/`x` field pairs. Pure UI
  copy (headings, buttons, FAQ, checklists) lives in `messages/<locale>.json` (all five) —
  see Internationalization below. Don't move one into the other's convention.

---

## Internationalization
`next-intl` with `/[locale]` App Router segment routing. Locales: `vi` (default/unprefixed:
`/`, `/products`), `en`, `zh`, `ja`, `ko` (prefixed: `/en`, `/zh/products`, …) —
`localePrefix: "as-needed"` and `localeDetection: false` in `i18n/routing.ts`.

- **Always import `Link`, `usePathname`, `useRouter` (and `redirect` / `permanentRedirect`) from `@/i18n/navigation`** for internal
  links/navigation — never `next/link` or `next/navigation`. Using the plain Next.js versions
  is the single easiest way to break non-default-locale navigation (links silently drop the
  `/en`, `/zh`, … prefix). `WipeButton` already does this internally. (The admin and
  `/zalo-reply` live outside `[locale]` and correctly use the plain Next.js versions.)
- **UI copy** (headings, buttons, checklists, FAQ, etc.) lives in
  `messages/{vi,en,zh,ja,ko}.json`, namespaced per section (`about`, `shop`, `faq`, …).
  Read with `useTranslations("namespace")` (client components) or
  `getTranslations({ locale, namespace })` (server/async). **All five files must stay in
  sync** — diff their flattened key sets after editing any one (a missing key throws at
  runtime). `i18n/request.ts` loads them with a build-time dynamic `import()`, so editing
  the JSON at runtime has no effect on a production build.
- **List content** (arrays of translated objects — FAQ items, process steps) — use
  `t.raw("key")`, which returns the JSON array/object unprocessed. Keep non-translatable
  metadata (icons, hrefs, image seeds, `highlighted` flags) in the component as a
  locale-agnostic array and zip it with `t.raw()` by index — see `Portfolio.tsx` for the
  pattern.
- **`data/*.ts` fields** (not UI copy) — read via
  `pickLocale(locale, viValue, enValue, zhValue?, jaValue?, koValue?)` from `lib/locale.ts`
  (falls back to the English value when a zh/ja/ko value is `undefined`), with `locale` from
  `useLocale()` (client) or the page's own `params.locale` (server).
- **Never render several languages inline** (`"VI · EN"` or `{vi} / {en}`) — one locale
  renders at a time.
- Date formatting: map the locale to a BCP-47 code (`vi-VN`, `en-US`, `zh-CN`, `ja-JP`,
  `ko-KR`) before `toLocaleDateString` — see `formatDate()` in the blog pages.
- `proxy.ts` (project root, **not** `middleware.ts` — Next 16 renamed the convention)
  runs `next-intl`'s `createMiddleware(routing)`. Its `matcher` skips `api`, `admin`,
  `zalo-reply`, `_next`, `_vercel` and any path containing a file extension.

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
- `lib/locale.ts` — `pickLocale(locale, vi, en, zh?, ja?, ko?)` for `data/*.ts` field selection.
- `lib/contact.ts` — phone / Zalo / email constants (`PHONE_NUMBER`, `PHONE_NUMBER_2`,
  `ZALO_CHAT_URL`, `CONTACT_EMAIL`, plus `*_FORMATTED` variants); reuse these instead of
  re-hardcoding the phone/Zalo number in a new component (`FloatingContact` and
  `MaterialFlashcard` already do).

Not extracted (checked, not worth it): the "white card + rounded-2xl + border" shell
differs enough per section (row vs column, dark variant, floating card) that a shared
wrapper would need as many props as it saves.

## Navigation rules
- Hash links must always be absolute: `/#cta`, `/#services`, `/#vision` — never bare `#cta`
- Bare hashes (e.g. `#cta`) resolve relative to the current URL, breaking navigation from `/products` or `/blog`
- Navbar breakpoint: `lg` (1024px) — hamburger shows on mobile AND tablet; full nav at desktop only

---

## Admin CMS
**Status: being rebuilt** on branch `feature/admin-cms`. Decisions, phases and acceptance
criteria live in `docs/admin-architecture.md`; the auth checklist in `docs/security.md`;
the VPS/Docker runbook in `docs/deployment.md`. Sections marked **(planned)** describe the
target — until a phase lands, the "current state" below is the truth.

### Current state (`develop`)
- UI: the admin has its own root layout (`app/admin/layout.tsx`, Vietnamese-only UI) and sits
  **outside** `app/[locale]` and outside next-intl. `app/admin/login` and `app/admin/account/password`
  (the forced change) are standalone dark-card pages (`AuthCardShell`); everything else lives in the
  route group `app/admin/(console)/`, whose server layout calls `requireUser()` and renders
  `components/admin/admin-shell.tsx`. Console pages: `account`, `users` and `audit` (Phase 2), the **content
  editors** `content/[type]` + `content/[type]/[id]` (Phase 3d — see **Content model → Editors**), plus
  the five legacy editors `site-content`, `products`, `blog`, `media`, `translations` (client components,
  no longer wrapping themselves in the shell; hidden from the sidebar when `NODE_ENV=production`).
- API: `app/api/admin/{blog,media,products,translations,translate}`. Persistence is
  `lib/content-store.ts`, which reads and writes `data/content/*.json`, `messages/*.json`
  and `public/uploads/` on the **local filesystem**.
- Auth: Better Auth guards both the pages and these API routes (`requireApiUser`: content routes need
  `content:edit`, media upload `media:upload` as multipart, media delete `media:delete`). The old shared-password
  session (`lib/admin-auth.ts`, a hardcoded fallback password and a forgeable base64 cookie) is deleted; those
  credentials remain in git history until Phase 7 rotates anything that ever used them. The handlers still parse
  bodies with `request.json() as T` and write to the source tree — they are Caddy-blocked in production and are
  replaced wholesale in Phase 3, so don't extend them.
- **What the public site sees of admin edits (Phase 4 M2):** the catalog — products, categories, shapes, materials, traits, sizes and
  specs — and the whole navigation (mega-menus, footer, home shop strips) come from the content database, so a publish shows on the
  next request, no rebuild. Still static until M3: blog posts (`data/posts.ts`, bundling `data/content/posts.json` at build time), UI
  copy (`messages/*.json`, bundled by `i18n/request.ts`), Fast Print and the showcase gallery. `products.json` / `subgroups.json` are
  never read at all.
- `/api/admin/translate` is a stub (returns the input unchanged unless it is one of six
  hardcoded nav labels).

### Target **(planned — see the phases in `docs/admin-architecture.md`)**
PostgreSQL + Drizzle ORM · Better Auth with invite-only named accounts and `admin` /
`editor` roles · public pages reading content through `lib/content/*` (tag-cached, with a
static-seed fallback) · validated media pipeline served from a volume · Docker Compose +
Caddy on one VPS. **The customer must be able to edit every product attribute in all 5
languages**, and edits are **drafts until published** (draft → preview → publish, every publish a
restorable revision). The relational schema (validated against the real data), the draft/publish
design, the seed rules and the owner-review list are in `docs/data-model.md` (+ `docs/data-model.sql`).

### Content model (Phase 3a schema + 3b seed + localized URLs + 3c draft / publish / delete services and the `/api/admin/content` API landed; the editors (3d) use it; the public catalog pages and navigation read it since Phase 4 M2, blog / UI copy / Fast Print / showcase in M3)
The full design is `docs/data-model.md` (local); this is what the code now guarantees.
- **Tables:** `lib/db/content/*.ts` (foundations, library, catalog, shapes-options, sizes-specs, menus, merchandising, blog,
  site-message, drafts; shared builders in `columns.ts`, SEO/Open Graph columns in `seo.ts`), re-exported by `lib/db/schema.ts`.
  Relative imports only (drizzle-kit loads them outside Next). 46 tables; products are the aggregate root; every
  translated entity has an `*_i18n` table keyed `(owner, locale)`.
- **Migrations:** `0002_content_tables` is drizzle-kit output plus ONE hand-added function at the top (`nonblank()`, which
  the table CHECKs call); `0003_content_integrity` is hand-written: immutable-key/uid triggers, frozen slug owners,
  TRUNCATE guards, the commit-time (deferred) checks, the deferrable `menu_item` foreign keys and the 5 `locale` rows. Add
  future columns with `pnpm db:generate`; put triggers/functions in a `--custom` migration. Trap: `drizzle-kit generate --custom`
  snapshots the WHOLE current schema, so a custom migration needs to come AFTER the table migration it depends on (generating
  it first leaves the next `generate` with nothing to do). `0004_localized_slugs` (table changes, hand-reordered; it refuses to run if the
  content tables hold data — reset the database instead) and `0005_localized_slug_integrity` (custom) made every slug per language.
- **Identity:** anything an editor may rename (product, shape, option, post, Fast Print / showcase item) has an immutable
  `uid`; vocabulary (material, trait, unit, spec item, category, post category, UI-copy namespace, media) an immutable key.
  Slugs are attributes owned by `product_slug` / `product_segment` / `post_slug` / `category_slug` (canonical + aliases), **one
  namespace per language**: PKs include `locale`; the same text may exist in two languages, never twice in one.
- **Localized URLs (decided 2026-10-24):** every product, shape, option, post and category has a slug in EACH language; slugs are
  Latin letters, digits and dashes only, in every language, forever (the CHECK stays ASCII kebab-case). Vietnamese keeps today's
  slugs, English is generated from the English name, zh/ja/ko start as a copy of English; today's shared slug stays valid in every
  language as a 308 alias. The fixed words (`products`, `blog`, `fast-print`) and the category segment are localized too
  (proposed: vi `san-pham` / `bai-viet` / `in-nhanh`, en as today, zh/ja/ko = English) — put in `i18n/routing.ts` `pathnames` in
  **Phase 4**, together with a redirect rule for every old Vietnamese URL and a language switcher that maps to the other
  language's URL. Switch all URLs in ONE step at cutover: the Vietnamese move is the largest SEO risk of the project.
- **Master languages:** Vietnamese AND English must be complete (document schemas require both; the database requires only `vi`).
  zh/ja/ko follow English: slugs are copies, text that exists is kept, and the gaps are filled with AI-suggested translations
  (`scripts/seed/suggested-translations.ts`, applied as revision 2 with the comment «Bản dịch đề xuất (AI) — cần người bản ngữ duyệt»;
  revision 1 keeps the original) that need a native reader.
- **Rules that live in the database, not in code:** non-blank Unicode-aware text, one canonical slug per product / shape /
  option / post / category **in every language of the `locale` table** (a new language is refused until its slugs exist, in the same
  transaction) and a default-language (`vi`) translation for every translated entity (all checked at COMMIT), frozen
  slug owners (and languages), `TRUNCATE` refused on the namespace/revision tables, photo slots accept images only. Never `TRUNCATE` them in
  code; a migration that must disables the guard trigger explicitly. The app role has no TRUNCATE or DDL anyway.
- **Documents** (`lib/content/schemas/`): zod schemas for the whole-entity documents that drafts, revisions and publishes carry
  (`snapshot_schema` = `DOCUMENT_SCHEMA` = 2, unchanged by the move to per-language `slugs` because no document was ever stored
  outside throwaway databases): product, menu (one per category), post, category, material, trait, unit, spec
  item, Fast Print / showcase item, post category, site message. Strict objects, Vietnamese messages for editors; slugs are
  `slugs: { vi, en, zh, ja, ko }` (all five required).
  `DOCUMENT_SCHEMAS`, `parseDocument()` and `documentIdentity()` are the entry points.
- **Column registry** (`lib/content/column-registry.ts`): every content column is either carried by a document path or
  system-owned. `lib/db/column-registry.int.test.ts` fails when the database and the registry disagree, and
  `lib/content/column-registry.test.ts` when a path is not in the zod schema. **A new column is not done until it is
  registered**, carried by the document schema, and (Phase 3d) has an editor control.
- **Icons:** `lib/icons.ts` is the one name → component registry (the DB stores names); public components draw a stored name with
  `<NamedIcon name={…} />` (`components/ui/named-icon.tsx`) — not `const Icon = resolveIcon(name)`, which the React compiler lint rejects
  as «component created during render». The old per-component maps are gone from the catalog pages, the navbar and the flashcard.
- **Site-wide facts** (business, address, social links, default OG image, JSON-LD Organization) go in the reserved
  `site_message` namespaces `seo` and `business`.
- **Seed (3b):** `pnpm seed [--dry-run] [--report <path>]` (`scripts/seed-cli.ts`, logic in `scripts/seed/`) loads the site's own
  data — read from the source modules, `messages/*.json`, `public/` and the three literals lifted from `subgroups-catalog.ts` /
  `FastPrintClient.tsx` — into an EMPTY content database in one transaction, writes revision 1 of every entity (author NULL; no
  fake user; one `content.seeded` audit row) and the 41 `legacy_import` archive rows, and writes the Vietnamese owner-review
  report (default `docs/seed-report.md`, gitignored). **Seed-if-empty, never merge:** editors change content afterwards, so a
  second run does nothing (advisory lock; two at once seed once). Re-seeding means dropping the database and migrating.
  The seed only READS the site's sources; Phase 4 deletes some of them (`lib/product-sizes.ts`, `lib/product-specs.ts`, the
  menus…), so the seed is a pre-Phase-4 tool — production gets the owner-approved content by restoring a full `pg_dump` of a
  seeded database at cutover (decided; nothing is built for it). After seeding it applies the suggested zh/ja/ko translations (revision 2
  of 12 traits and the Tet flyer product). Pitfalls found while porting it: 13 `ProductOption` objects
  are shared between products, so option lookups are per product (`optionRecordFor`), never a global identity map; `pg`
  returns `bigint` as a string in raw SQL, so test code must `Number()` ids before using them as map keys.
- **Compose** (`lib/content/compose/`): rows → the zod documents (`composeEntity(db, type, id)`, `listEntities`); the read side
  that revision 1, 3c's publish and Phase 4's queries share. `lib/content/revision.ts` writes a `content_revision` row.
  `lib/db/types.ts` has `Db` / `Tx` / `DbExecutor` — code that only reads and writes rows takes `DbExecutor`.
- **Drafts, publish, restore, delete (Phase 3c: all twelve entity types).** A live entity
  changes ONLY by publishing a draft: a whole-entity document in `content_draft`, saved as often as the editor likes and however
  incomplete (`GET` advice comes from `validateSnapshot`: zod + references; publish enforces it). Services in `lib/content/` take a
  `Db` and throw `Conflict` (409, with a `code`: `STALE_BASE` carries a field-level `changes` diff live → draft, `DRAFT_CHANGED`,
  `ALREADY_EXISTS`, `GONE`, `DRAFT_EXISTS`), `Invalid` (422, `issues: {path, message}[]`, Vietnamese) or `NotFound` (404):
  `drafts.ts` (open / resume, create, save, discard, rebase, `draftChanges`), `publish.ts`, `restore.ts` (revisions; restore =
  open a revision as a draft, `note = "restore:N"`), `aliases.ts` (`releaseAlias`), `used-by.ts`, `validate.ts`, `references.ts`,
  `diff.ts`, `humanize.ts`, `identity.ts` (URL type names, `spec_item` key `kind.key` in paths), `cache-tags.ts`, `delete.ts`,
  `summaries.ts` (the admin list rows: live entities + drafts of entities not published yet), `apply/`.
  - **Publish = ONE transaction:** lock the draft (`FOR UPDATE`) → check `draft_version` (what was previewed is what is published)
    → zod → lock the live row (`FOR NO KEY UPDATE`) → check `base_version` → `checkReferences` → apply → write the revision with the
    STORED document (it contains the aliases kept automatically) → delete the draft. Any failure rolls back and the draft survives.
    No silent merge: a stale base is a 409 with the diff; `rebaseDraft` is the explicit "keep my draft, overwrite live".
  - **Appliers** (`apply/`, one per type, all twelve; `applierFor`) upsert children BY UID so shape / option database ids survive every publish
    (menus point at them), and replace what has no identity (translations, bullets, photos, sizes, specs). **URLs are never lost:**
    per language a publish keeps canonical + the aliases the document names + every alias already held + the previous canonical
    (`planProductSlugs`, `planSegments`); only `releaseAlias` (per language, never a canonical URL) lets one go. Shapes, options and
    their aliases share one namespace per product per language; priority: canonical, explicit aliases, held.
  - **Versions:** `ApplyContext.startVersion` — a new entity starts at 1, but revisions outlive the entity (unique per entity and
    version), so a re-created key or the restore of a deleted entity continues after its last revision (`latestRevisionVersion`).
    A `site_message` document is one namespace in every language: its version is the highest row version and a publish moves every
    language it contains to the next one; a language missing from the document is removed (the site falls back to `messages/*.json`).
  - **Delete** (`delete.ts`, admin-only once 3c-3 wires `content:delete`): categories and menus are never deleted (a menu belongs to its
    category); products, posts and Fast Print items are archived first (a normal publish with `status: "archived"`, revision action
    `archive`); a record that something still uses is refused — live rows and open drafts (`used-by.ts` covers material, unit, trait,
    spec item and blog category; a product still in a menu also blocks); an entity with an open draft is refused. The deletion is a
    revision (`delete`) holding the last document, so `startRestore` can bring it back. Conflicts: `NOT_ARCHIVED`, `IN_USE`, `DRAFT_EXISTS`.
  - A canonical slug cannot also be an alias in the document (zod), so a product moved into a category where it already has an
    alias of the same slug must drop that alias in the same edit — the 3d editor should do it for the editor.
  - `cacheTags` takes `Affected` entries (a type without an `id` = every entity of it): a category change touches its menu and all
    products, a trait / material / unit / spec item the products (and Fast Print for units) that show it, a blog category the posts.
  - A product move out of a category takes it out of that category's mega-menu and bumps BOTH `menu_version`s (categories are locked
    in id order), so an older menu draft is refused. `affectedBy` / `cacheTags` name what to `revalidateTag(tag, { expire: 0 })`
    (a product publish also touches the menus it left and joined); the HTTP layer (3c-3) calls them after COMMIT.
  - `used-by` counts live rows (`USAGES`, checked against the foreign keys in the catalog by a test) plus open drafts
    (`draft_reference`, rewritten on every autosave by the tolerant `collectReferences`): the foreign keys cannot see drafts.
  - Database errors are mapped to editor-readable `Invalid` by `humanize` (it unwraps Drizzle's `cause`; deferred constraints fail at
    COMMIT, so wrap the whole transaction). Unmapped errors pass through untouched.
- **HTTP API** (`app/api/admin/content/[type]/[id]/…`, contract in `docs/admin-api.md`, local): thin handlers — `requireApiUser` first,
  then `handle(async () => …)` from `lib/content/http.ts`, which turns `NotFound` / `Invalid` / `Conflict` / `HttpError` into
  404 / 422 / 409 / 4xx with the admin API's error shape `{ error: <Vietnamese message>, code, issues?, changes? }` and anything else into a
  logged 500 without details. Bodies are read by `readJson(request, schema)` (zod, strict, capped at 2 MB → 413; `requests.ts`), never
  `request.json() as T`. Saving and publishing REQUIRE `If-Match: "<draftVersion>"` (428 when missing). Permissions: `content:edit` for
  drafts and reads, `content:publish` for publish / release-alias, new `content:delete` (admin only) for deleting. After a commit,
  `effects.ts` revalidates `cacheTags(result.affected)` and writes the audit row (`content.published | restored | discarded | deleted |
  alias_released`; autosave is not audited); a failure there is logged, never thrown. **Caddy still blocks all of `/api/admin/*` in
  production**: 3d adds the paths together with the editors. Entity types in URLs are kebab-case (`spec-item`), a spec item's key
  `technique/offset` is `technique.offset` in a path.
- **Editors (Phase 3d complete: an editor for all twelve entity types — 3d-1 foundation + the seven simple ones, 3d-2 the product,
  3d-3 post, category, menu and UI copy).** `app/admin/(console)/content/[type]/page.tsx` lists a type
  (`listSummaries`), `…/[id]/page.tsx` loads the live document, the open draft, the vocabularies and the author names and renders the
  client `components/admin/content/entity-editor.tsx` (remounted by a `key` of `live version : draft?` after a publish; a discard
  resets the session locally because the server props do not change when the draft was opened in the browser). **Everything an editor
  does is the `/api/admin/content` API** (`lib/content/editor/api.ts`, never throws). Pure, unit-tested logic lives in
  `lib/content/editor/`: `paths.ts` (immutable get/set by `a.b[2].c`; `setText` turns blank into "not provided" and drops a language
  row left empty so it falls back to English), `session.ts` (the draft state machine — saves never overlap; typing during a save is
  not lost; `DRAFT_CHANGED`/`GONE` = conflict), `completeness.ts` (texts vi/en have that a language lacks), `templates.ts` (the
  "Tạo mới" request), `entity-meta.ts` (labels, `editable`, vocabularies), `vocabulary.ts`. `use-draft-session.ts` runs the effects
  (1.2 s debounced autosave, retry after 5 s, `beforeunload` guard). Controls are bound to a PATH through `EditorContext`
  (`TextField`, `NumberField`, `SwitchField`, `SelectField`, `MediaField`, `IconField`; a `*` in a path = the language tab being
  edited) and draw `data-field` (registry path) / `data-path` (concrete path).
  **The field registry** (`lib/content/field-registry.ts`) gives every editable leaf of every document schema a Vietnamese label and a
  control; `field-registry.test.ts` ties it to the zod schemas (`documentLeafPaths`) and `components/admin/content/forms/forms.test.ts`
  renders each editor on a full document and requires a `data-field` for every registered path — **a field cannot exist without
  an editor control**. To add an editor: a form in `components/admin/content/forms/`, register it in `FORMS`, set
  `ENTITY_META[type].editable`, add a sample document to `forms.test.ts`, give it a nav look in `admin-nav.ts`.
  `client-bundle.test.ts` fails if the browser code reaches a server-only module through its imports. Media: `GET
  /api/admin/content/media` (read-only; uploads are Phase 5, files are served at `/<storage_key>`). zod messages reach the editor in
  Vietnamese (`parseOptions`, passed per parse — never `z.config`, which would change env validation too). No Preview button until
  Phase 4 (the public pages cannot render a draft yet): the publish dialog's field-level diff is the feedback. There is no DOM test
  library: interaction is covered by the reducers' tests and a browser smoke (see docs/verification), rendering by server-side
  rendering in tests.
  **The product editor (3d-2)** is one draft edited in six tabs (`components/admin/content/forms/product/`: general, URLs & SEO, shapes,
  options, sizes, specs; only the open tab is drawn, a tab shows its problem count, and "go to this problem" opens the tab, the language
  and the card that hold the field — `use-open-cards.ts`; a card the editor just added opens itself). List edits are pure functions on the
  typed document (`lib/content/editor/product-ops.ts`: add / remove / move / scope for shapes, options, bullets, sizes, specs; `lists.ts`
  renumbers `position` by array order per group; an option that changes scope goes to the END of the array so it ends its new group).
  URLs: `slugs.ts` suggests a slug per language (vi from the Vietnamese name, en from English, zh/ja/ko copy English), a NEW shape/option
  slug follows its name while it is the placeholder or the old name's slug (a published URL never changes by itself), typed slugs are
  cleaned as typed; **moving a product to another category drops the alias that would equal the new canonical URL in the same edit**
  (`moveToCategory`); old URLs are listed read-only and released («Gỡ») only from the live view with no draft open. The create dialog asks
  for category + vi/en name (`templates.ts`), and the product list shows a «Danh mục» column (`Summary.group`, also for never-published
  drafts). `fieldLabel` names a container or a whole row in words («Tên hình thức (en) · hình thức 4», «Dòng nội dung»;
  `LIST_ELEMENT_NOUNS`, a test requires every list in the registry to have one). **The publish diff is `publishChanges`, not
  `diffDocuments`:** an old URL missing from a draft (a restored old version lacks the aliases made since) is not listed as removed,
  because a publish keeps every alias it holds. Browser-smoke findings kept in mind: restoring an old version after a category move
  and publishing it keeps every URL (19 rows for one product, none lost).
  **Post, category, menu and UI copy (3d-3).** A **post** (`forms/post-form.tsx`): text per language (the content box is tall; format
  `plain` | `markdown`, no preview until Phase 4), category from the post categories, a `DateField`, read time, cover, slug + SEO. A post that was
  never published follows its titles for its slugs (`slug-ops.ts`: `setRootSlug`, `followRootNames`, the same rules as a product's); a
  published post's URL never changes by typing. The create dialog dates a new post in Vietnam (`vietnamToday`) and files it under a post
  category (`ENTITY_META.group` drives the list column and the dialog's select for products and posts alike). A **category**
  (`forms/category-form.tsx`): renaming a slug warns that it moves the address of every product in the category in that language (old
  addresses keep working). **Structure is edited, never deleted:** `ENTITY_META.deletable` is false for category, menu and site_message
  (no danger card). A **menu** (`forms/menu/`, pure ops in `lib/content/editor/menu-ops.ts`): columns → groups (one per product) → items
  (a shape or an option); column numbers are the place in the list and are renumbered after every edit; a group's product is chosen among the
  category's published products not already in the menu, an item's target among that product's **published** shapes and options (the server
  resolves targets from live rows) — the pickers come from `loadVocabulary(db, kinds, { category })` (`VocabOption.group` = the product uid);
  **a column with no group is refused by the schema** (a column is stored only on its groups, so it would silently vanish at publish). Group
  cards open by identity (`use-open-keys.ts`, shared with the product cards), not by index, so reordering keeps them open; the language tabs of a
  menu show no «% translated» (`ENTITY_META.noCoverage`: its texts are overrides). A diff reads a menu column's number as its identity
  (`fieldLabel(type, path, keyed)`) and names products/shapes/options by id from the vocabulary (`DiffView names`). **UI copy**
  (`forms/site-message-form.tsx`, pure parts in `lib/content/editor/message-tree.ts`): one box per text the namespace already has, drawn for
  the language tab with the Vietnamese text and the `{variables}` to keep underneath; the structure is the site's (nothing added or
  removed, `leafPaths` = the union over languages). **A blank text is stored as `""`, never by removing the key** (18 of the 297 texts are
  plain list items; removing one would shift the list); `""` means «not translated, use English» and only zh/ja/ko may have it — an empty vi/en
  text is an issue. **Schema rule (`siteMessageDocumentSchema`, `lib/content/icu.ts`):** braces must balance and a `{variable}` must exist in the
  Vietnamese text of the same line (a wrong one makes next-intl throw at render time in Phase 4); no master-language *requirement* (a namespace
  may hold one language, the site then falls back to `messages/*.json`). The 30 namespaces have Vietnamese names in
  `site-message-labels.ts` (a test keeps them equal to the keys of `messages/vi.json`). A missing required text reads «Bắt buộc phải nhập.»
  (`MESSAGES.required`), not zod's default. Known gaps: aliases of posts and categories are listed but cannot be released (the service only
  releases product URLs); the reserved `seo` / `business` namespaces cannot be created from the UI (site_message is not creatable).
- **Public read layer (Phase 4: M1 foundation, M2 catalog pages + navigation — landed).** `lib/content/read/`: `catalog.ts` / `menus.ts` /
  `selectors.ts` / `urls.ts` / `messages.ts` are PURE functions from the documents (`composeEntity`, proven lossless) to the public site's view
  models (`types.ts`: `CategoryView`, `ProductView` with shapes / options / sizes / specs, `MenuView`, traits, materials); `load.ts` has the
  database loaders (`loadCatalog`, `loadMenus`, `loadPublishedMessages`, any executor — the tests use a seeded scratch database) and the cached
  reads the pages will call (`getCatalog`, `getMenus`, `getPublishedMessages`), wrapped by `cache.ts` (`unstable_cache` + tags, logs
  «content read rebuilt» on a miss). **View models hold one object for all languages** (`Localized` = a text per language that has one; `pickText`
  falls back requested → en → vi, per bullet for lists) — a deliberate refinement of "keep the old `xVi/xEn` shapes": the old suffix fields are not
  rebuilt. **Cache tags:** a read carries `readTags(...)` (`lib/content/cache-tags.ts`), never `cacheTags`, because every publish revalidates the root
  `content` tag; verified in a real Next runtime that a publish rebuilds exactly the reads it touches (a product publish → catalog + menus, a UI-copy
  publish → only that language's messages) and a direct database edit does not show (cached). The catalog is one entry (~590 KB; the data cache limits
  an entry to 2 MB — a test fails at 1.5 MB). **Rules:** shape-scoped options/sizes/specs REPLACE the product's for that shape (`selectors.ts`); an
  archived product is not in the catalog (404, not in menus); `resolveUrl(catalog, locale, parts)` answers `ok`, `redirect` (an alias, or a slug of
  another language, to the canonical URL of the page's language) or `notFound`, and every internal link is built by `categoryPath` / `productPath` /
  `segmentPath` (the fixed word `products` is `PRODUCTS_SEGMENT`, localized in the routing milestone); UI copy = `mergeMessages(file defaults,
  published)`: the files own the structure, `""` leaves the default. **Equivalence:** `lib/content/read/catalog.int.test.ts` compares the views with the old
  static files on a seeded database — titles, descriptions, 110 options (names, card headings, bullets, traits, photos, prices), sizes and specs
  (the 510 canonical contexts and the owner-decision measure, 4,045 renders / 2,163 differ), the four menus, and every candidate URL segment and
  `/products/…` link in every language; 11 mutations are caught. `scripts/parity/` (`pnpm parity:capture`) keeps the old site's prerendered pages
  (1,867, text + links) in `.parity/legacy.json` (gitignored) for the page-text comparison after each page milestone. Files meant for the browser
  (`text.ts`, `types.ts`, `selectors.ts`, `urls.ts`) are guarded by `lib/content/read/client-bundle.test.ts` (`tests/helpers/import-graph.ts`).
  **M2 — page models and chrome.** Pure, language-resolved models on top of the views: `navigation.ts` (`navigationOf`: categories, product `cards`, the
  mega-menu as columns → groups → items with ready hrefs; `cardsOf` words a card as the PRODUCT — title, description, cover — never as the menu
  group, `referenceImageOf` = the gallery picture), `card.ts` (`cardOf`: everything one flashcard draws — heading, tagline, features with trait icon
  names, photos, sizes `{id,label,dims}`, technique / material / finishing lists, `consultName`; `TIER_LABELS` = the seed's `BASE_LABEL`, a test keeps
  them equal), `pages.ts` (`categoryPageOf`, `productPageOf` → `shapes` | `detail` | `shape` | `material`, `glossaryOf`; metadata titles
  `… | Viet Dragon`), `site.ts` (`getNavigation(locale)`), `resolve-page.ts` (`peekPage` for metadata, `resolvePage`: `resolveUrl` →
  `notFound()` / `permanentRedirect` to the canonical / the page). Hash anchors are DOM-level: a card has `id=<canonical slug in the page's language>`
  and `data-aliases="<every other slug or alias in any language>"` (`anchorOf`); `findHashTarget` (`lib/hash-navigation.ts`) falls back to
  `[data-aliases~=…]`, `useCurrentHash` reports the canonical id, the shapes grid rewrites an alias hash to the canonical one — there is no
  alias dictionary any more. Client chrome (`Navbar`, `Footer`, `Shop`, `ShopCategories`) reads `useSiteData()` (`components/providers/site-data-provider.tsx`,
  mounted by the locale layout); ONE `MegaMenuDesktop` + `MegaMenuMobile` replace the eight per-category submenus (the desktop backdrop defaults to
  the first group's picture — a test pins the four old pictures); `ProductDetailView` draws the three material pages (product without shapes, a shape,
  a material) and `SubgroupShapesView` the shapes grid, both from the models; `MaterialFlashcard` / `MaterialGlossaryFab` take `CardView` /
  `GlossaryTrait[]` as props. **Equivalence:** `lib/content/read/pages.int.test.ts` (navigation vs the four old menus — all 100 links equal, 8
  material links now name the canonical slug and 1 shape anchor its own id, each proven to redirect / still scroll; cards, shapes grid, shape and
  material pages vs the old page logic, 77 shape pages); `pnpm parity:compare [--base http://localhost:3105]` (`scripts/parity/compare.ts`) requests
  every URL of `.parity/legacy.json` from a running server and classifies it: on the scratch database 1,865 pages = 361 identical + 1,491 that differ
  only in the cards' sizes / specs form (owner decision 1, measured) + 13 explained (Tet category cards worded as the products; the
  title-precedence pages; AI-suggested translations of one Tet option) + 0 unexplained. **Known small changes:** the glossary lists traits by key
  (traits have no stored order; the old popover used the authored order); a size's tier names (Lớn / Vừa / Nhỏ …) and the form titles are interface
  words kept in code until M3.
- **Tests:** `app/api/admin/content/content-api.int.test.ts` (who may call what, preconditions, error shapes, cache tags, audit rows —
  with the app's own database pointed at a seeded scratch one by setting `DATABASE_URL` before the first `getDb()`),
  `lib/content/http.test.ts`; `lib/content/entities.int.test.ts` (all 198 seeded entities publish unchanged; each of the nine creatable types is created,
  edited, archived, deleted and brought back; URL renames; site-message versions; lists) and `delete.int.test.ts` (every refusal next to
  the deletions that must work); `lib/content/{product,draft,menu}-lifecycle.int.test.ts` run the prototype's lifecycle (docs/spike) through the shipped
  services on the seeded scratch database (all 25 products and 4 menus round-trip losslessly with every id preserved; renames, swaps,
  category moves; stale / invalid / concurrent publishes; restore after renames; every document field survives a publish);
  `tests/helpers/content-lifecycle.ts` is the open → edit → save → publish cycle. Pure logic has unit tests beside it.
- **Schema tests:** `lib/db/content-schema*.int.test.ts` (173 constraint cases, each naming the rule that must fire),
  `tests/helpers/content-db.ts` (one fixture; every test rolls back after `SET CONSTRAINTS ALL IMMEDIATE`, which runs the
  COMMIT-time checks) and `tests/helpers/db.ts` (`createScratchDatabase`, for suites that need their own database). On
  PostgreSQL a RESTRICT violation reports SQLSTATE 23503 like any foreign key (23001 only on the PGlite prototype), so the
  tests read `confdeltype` from the catalog instead.

### Rules for admin / CMS code
- **Server-side access control only.** Every admin page and every `/api/admin/*` handler
  must authenticate on the server; a client-side redirect is not access control.
  Pages call `requireUser()`, Route Handlers `requireApiUser()` (both in `lib/dal.ts`);
  `app/api/admin/route-guards.test.ts` fails if a handler under `app/api/admin` does not call it first.
- **Validate every write body** with zod; never `await request.json() as SomeType`.
- **No secrets or default credentials in source.** Read config through `lib/env.ts`
  (never `process.env` directly) and fail fast when it is missing.
- **Mutations must invalidate the public site** — `revalidateTag(tag, { expire: 0 })`
  (two-argument form) from a Route Handler.
- **Don't import `lib/content-store.ts` from public pages**; it is deleted by Phase 4.
- **Never write content to the filesystem at runtime** in new code — content goes to the
  database (Phase 3), uploads to the uploads volume (Phase 5), never into `public/`.
- **No product attribute in code.** Names, text, sizes, spec lists, icons, prices and menu
  placement belong in the database and must have an editor control (a registry test enforces
  it). Don't add new `if (name.includes(...))` heuristics, inline per-locale dictionaries, or
  `xVi`/`x`/`xZh` suffix fields — new text goes in a `*_i18n` table or `messages/`.
- Admin text is Vietnamese-only and the admin stays outside `app/[locale]`.

### Authentication (Phase 2 — complete)
**Landed (M1–M5):** Better Auth core (`lib/auth.ts`), schema + migrations, roles (`lib/permissions.ts`), `/api/auth/*`,
the security hooks (`lib/auth/hooks.ts`), the DAL (`lib/dal.ts`), the `proxy.ts` admin branch, and the admin UI (login,
forced password change, account/sessions, users, audit), the `/api/admin/*` guards (M4) and the admin CLI (M5).
- **Admin CLI** (`scripts/admin-cli.ts`, logic in `scripts/admin/`): `pnpm admin:create` makes an `admin` (the first one, or
  recovery when every admin is locked out) and `pnpm admin:reset-password <email>` sets a new password. Shell access to the
  server IS the authorization, so neither needs a session. Passwords are typed twice at a hidden raw-mode prompt and are never
  accepted from arguments, the environment or a pipe (no TTY → refuses). `create` goes through Better Auth's session-less
  `createUser`, so the policy hook and the `user.created` audit row (actor `cli`) apply and the new admin is NOT forced to
  change the password. `reset-password` cannot use `setUserPassword` (it needs a session), so it works on the auth context
  directly and repeats what the admin-UI reset does: forced change, all sessions ended, lockout lifted, `user.password_reset`
  audit row (actor `cli`); a deactivated account stays deactivated. In Docker:
  `docker compose --env-file <env> run --rm admin-cli create` (never `-T`); it connects as the DML-only app role.
- **Admin UI conventions:** sign-in and every account/user action go through the browser client `lib/auth-client.ts`
  (HTTP `/api/auth/*`, so rate limit + hooks + audit apply). Error codes become Vietnamese text in
  `lib/auth/error-messages.ts` — unknown codes get a generic line, never the server's English message. A
  `SESSION_NOT_FRESH` failure shows `FailureNotice`'s "Đăng nhập lại", which calls `reauthenticate()` (sign out →
  `/admin/login?next=…&reason=fresh`). Temporary passwords are generated in the admin's browser
  (`lib/auth/temp-password.ts`), shown once in a dialog that cannot be dismissed by accident, and never stored. The shell
  gets its colours from `dark:` variants (the inline script in `app/admin/layout.tsx` sets `dark` on `<html>` before paint),
  not from React state — state-driven colours flash light on every full load.
- **Access control lives in the DAL, close to the data** — never only in a layout (it does not re-render on client
  navigation) or the proxy (it sees cookie presence, nothing more). Every admin page calls `requireUser({ permission? })`;
  every `/api/admin/*` handler calls `requireApiUser(request, permission?, { contentType? })` and returns `auth.response` when
  `!auth.ok`. On mutations it also enforces a same-origin `Origin` (or Fetch Metadata) and the declared body type.
- **Lockout** (`lib/auth/lockout.ts`): 5 consecutive credential failures lock an address — one with no account too, so
  it never reveals which addresses exist — for 5 min, doubling per further lock up to 24 h; the quiet period that resets the
  ladder (24 h) runs from the lock's END. Validation errors and bans are not counted. A visitor can lock any address by
  failing on purpose; that is the accepted cost, bounded by the per-IP rate limit.
- **Proxy redirects must be absolute URLs built from `SITE_URL`**: Next rejects a relative `Location` in `proxy.ts`, and behind
  Caddy `request.url` is `http://`, which would downgrade the redirect.
- Better Auth skips its origin check when `NODE_ENV=test`; `lib/auth.ts` pins `disableOriginCheck`/`disableCSRFCheck` to
  `false` so the protection is identical everywhere.
- **Tests:** `pnpm test` (unit, no database) and `pnpm test:int` (needs `docker compose -f compose.dev.yaml up -d`; it
  creates and drops a throwaway database per run). `audit_log` is append-only, so integration tests use unique emails/IPs
  (`tests/helpers/auth.ts`) instead of cleaning up. Run both before committing auth changes.
- Accounts are **invite-only** (`disableSignUp`); the first admin comes from `pnpm admin:create`, never from a default.
  New accounts get a temporary password and `mustChangePassword` (forced change at first login).
- Roles: `admin` (users, audit, media delete, content) and `editor` (content, media upload). **Deactivate (ban), never
  delete** — `audit_log` and the content tables foreign-key `app_user`. Impersonation and `user:delete` exist in no role.
- `audit_log` is append-only (triggers bind every role; the app role also lacks UPDATE/DELETE/TRUNCATE). Don't work around it.
- Better Auth does **not** enforce `freshAge` and `createUser` skips the password minimum — our before-hooks do
  (`lib/auth/hooks.ts`: sensitive actions need a session < 15 min old; `SESSION_NOT_FRESH` means "sign in again").
  `admin:update-user` is removed from every role (it could rewrite `role`/`banned` around those guards); an admin cannot
  change their own role or ban themselves. Session tokens are stored in plaintext, which is why the database must stay on
  the internal network.
- After changing a Better Auth plugin/option that affects the schema: `pnpm auth:schema`, then `pnpm db:generate`;
  never edit `lib/db/auth-schema.ts` by hand. Migrations run as the schema owner (`pnpm db:migrate`), never as the app role.

---

## Environment variables
All config goes through `lib/env.ts` (zod) — never read `process.env` directly in new code. It has
five independently validated groups, each behind its own lazy accessor so one group's problem never
breaks an unrelated consumer: `getDatabaseEnv()`, `getMailEnv()`, `getLogEnv()`, `getSiteEnv()`, `getAuthEnv()`.
`assertEnv()` validates all four at once at server start (`instrumentation.ts` →
`instrumentation-node.ts`) and **exits with code 1** on a bad config, printing variable names, never
values. It is skipped during `next build`, so the Docker build stage needs no secrets.

| Variable | Group | Notes |
|---|---|---|
| `DATABASE_URL` | database | `postgres://` URL, required; in production its password must be ≥ 12 characters |
| `BETTER_AUTH_SECRET` | auth | ≥ 32 characters, required in **every** environment (no dev default): `openssl rand -hex 32`. Signs session cookies; rotating it signs everyone out |
| `SITE_URL` | site | Public origin, no path. Required in production (dev default `http://localhost:3000`). **Needed at build time too** — pages are prerendered, so it is baked in (docker build arg) |
| `LOG_LEVEL` | logging | `fatal` … `trace` / `silent`; default `info` in production, `debug` in dev, `silent` under test |
| `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` | mail | **Required in production.** Elsewhere, if any is unset a consult lead is only logged (phone masked) and never emailed |
| `SMTP_PORT` (587), `SMTP_SECURE`, `SMTP_FROM`, `CONSULT_RECEIVER_EMAIL` | mail | Optional; the receiver defaults to `CONTACT_EMAIL` in `lib/contact.ts` |
| `POSTGRES_PASSWORD`, `APP_DB_PASSWORD`, `SITE_ADDRESS`, `HTTP_PORT`, `HTTPS_PORT`, `APP_TAG` | compose only | Interpolated by `compose.yaml` / `compose.dev.yaml`; the app never reads them. See `.env.example` |

`.env*` is gitignored except `.env.example` — never commit real values. `pnpm dev` needs
`DATABASE_URL` (and `SITE_URL` for `pnpm build`) in the local `.env` and exits at start-up without
`DATABASE_URL`; the database container itself is optional (`/api/health` reports `db: "down"`).
The local `.env` may still hold `PAYLOAD_SECRET` / `DATABASE_URI` from the abandoned Payload
branch; nothing reads them.

### Logging
Server code logs with `getLogger("scope")` from `lib/logger.ts` (pino, JSON lines on stdout) —
no `console.*` on the server (client components may use `console.error`). Pass errors as
`{ err }`. Values under keys named `password`, `token`, `secret`, `authorization` or `cookie` are
censored to depth 2, but still never log request bodies or headers wholesale; mask phone numbers
with `maskPhone()`. `instrumentation.ts` logs uncaught request errors through `onRequestError`
(method, path without query string, route, error — no headers).

---

## Docker & deployment
Production target: Docker Compose on a single VPS. Files: `Dockerfile` (stages `deps` → `build` →
`runner`, plus `tools` for the migrate job and the admin CLI), `compose.yaml` (`caddy` → `app` → `db`, plus a one-shot
`migrate` and the on-demand `admin-cli` under profile `tools`), `deploy/Caddyfile`, `deploy/db-init/` (creates the DML-only `vietdragon_app` role on
first init), `.env.example`. `compose.dev.yaml` is Postgres only, on `127.0.0.1:5432`, for `pnpm dev`.
Runbook and rationale: `docs/deployment.md`.
- The app connects as `vietdragon_app` (SELECT/INSERT/UPDATE/DELETE only — no DDL, no TRUNCATE);
  `migrate` runs as the owner. Never point the app at the owner role.
- App container: non-root, read-only root FS (writable: `/tmp` and the `.next/cache` volume),
  `cap_drop: ALL`, no published ports. `db` sits on an `internal` network. **One app instance only.**
- Building needs internet (`next/font/google`) and `--build-arg SITE_URL=…` — nothing else.
- `deploy/Caddyfile` is fail-closed for the admin: under `/admin` only `login`, `account`, `users`, `audit` and
  `content` are reachable, and under `/api/admin` only `content`; every other `/admin*` path and `/api/admin/*` route (the
  legacy editors and their API, which write to the source tree) 404 until Phase 4 deletes them — **a new admin page or API
  path must be added to the `not path` list**. `/api/auth/*` is
  open (sign-in). It also 404s `/api/health` (internal healthcheck only) and overwrites `X-Real-IP` with the TCP peer.
- `output: "standalone"` does not copy `public/` or `.next/static`; the runner stage does.
  `next.config.ts` still carries the Vercel-era `outputFileTracingExcludes` workaround for `public/`,
  removed in Phase 4. The image is ~1.1 GB mostly because ~1,700 prerendered pages ship in
  `.next/server/app`; request-time rendering (Phase 4) shrinks it.

---

## Code quality conventions
No SonarQube/SonarCloud instance is wired into this repo yet — these are the "Sonar way"
style rules to hand-follow regardless, so a future `sonar-project.properties` finds a
codebase that already passes clean. Run `pnpm lint` before every PR; it should report
zero warnings.

- **No `any`** — `tsconfig.json` has `strict: true`; keep it that way, type properly or use
  generics instead of widening to `any`.
- **Cognitive complexity** — if a function/component needs more than ~3 levels of nested
  conditionals or branches on more than ~10 distinct paths, extract a helper or sub-component.
- **No duplicated blocks** — the same JSX/logic repeated 3+ times belongs in a shared
  component/hook/util (see **Reusable UI primitives** above for the existing extraction bar).
- **No dead code** — no unused imports/vars/exports, no commented-out blocks left behind;
  delete, don't comment out.
- **Naming** — `PascalCase` for components/types, `camelCase` for functions/variables/hooks
  (`useXyz`), `SCREAMING_SNAKE_CASE` for module-level constants.
- **Prop types** — destructure component props as `Readonly<Props>` (e.g.
  `function Foo({ x }: Readonly<FooProps>)`) — improves accessibility/immutability lint
  compliance; every component in `components/` already follows this.
- **No magic numbers/strings** for values used more than once — extract a named constant.
- **No stray `console.log`** in committed code — fine while debugging locally, strip before
  opening a PR.
- **`===`/`!==` only**, and prefer optional chaining (`?.`) / nullish coalescing (`??`) over
  manual null checks.
- **File/function size** — split a component file once it passes ~250-300 lines, or a
  function once it passes ~50 lines.
- Any `TODO`/`FIXME` left in a PR must reference a tracked issue, not stand alone.

---

## Component map
```
app/
  [locale]/                 public site — layout mounts SiteDataProvider, SmoothScroll, QuoteModalProvider, FloatingContact, LanguageDetectorToast; products/[category]/[product]/[segment] are dynamic routes
  admin/                    CMS UI — own root layout, Vietnamese only, outside next-intl (see Admin CMS); login/, account/password/ standalone; (console)/ = shell + account, users, audit + legacy editors
  [locale]/not-found.tsx    localized 404 (Navbar + Footer); reached via the [locale]/[...rest] catch-all
  api/consult/              public lead endpoint (nodemailer)
  api/health/               liveness for the Docker healthcheck (always 200; db state in the body)
  api/admin/                CMS API: blog, media, products, translations, translate (route-guards.test.ts + legacy-routes.int.test.ts enforce the guard)
  robots.ts                 robots.txt (no sitemap yet)
  zalo-reply/               client page: copy a prepared reply, open Zalo
instrumentation.ts          register(): env fail-fast (Node runtime only, skipped at build) · onRequestError → lib/logger
instrumentation-node.ts     validateEnvOrExit() — Node-only, imported dynamically so the Edge bundle stays clean
drizzle.config.ts, drizzle/ drizzle-kit config (loads .env via @next/env) · migrations 0000–0003 (auth, audit_log append-only, content tables, content integrity)
Dockerfile, compose.yaml, compose.dev.yaml, .env.example, .dockerignore, deploy/   see Docker & deployment
i18n/
  routing.ts               defineRouting({ locales: [vi, en, zh, ja, ko], defaultLocale: vi })
  navigation.ts             Locale-aware Link/usePathname/useRouter/redirect/permanentRedirect — import from here, not next/*
  request.ts                getRequestConfig — loads messages/<locale>.json (build-time dynamic import)
messages/
  vi, en, zh, ja, ko .json  UI copy, namespaced per section — keep all five key sets in sync
proxy.ts                    Next 16 "proxy" (not middleware.ts): `/admin/*` → optimistic session-cookie check (lib/admin-access.ts); everything else → next-intl createMiddleware; the intl matcher still skips api/admin/zalo-reply
vitest.config.mts, vitest.int.config.mts, tests/   unit config · integration config (throwaway DB via tests/db-setup.ts + tests/migrate.ts) · shared helpers (auth, db, content-db) and document fixtures; `*.test.ts` live beside the code, `*.int.test.ts` need the dev DB
hooks/
  use-section-in-view.ts    Shared useRef + useInView(once, margin -80px)
  use-current-hash.ts, use-hash-pulse.ts   Current-hash tracking (reports a card's canonical id for an alias hash) and hash-target pulse highlight
lib/
  env.ts                    zod-validated config: getDatabaseEnv/getMailEnv/getLogEnv/getSiteEnv/getAuthEnv + assertEnv (relative imports: drizzle.config.ts loads it outside Next)
  auth.ts                   createAuth() / lazy getAuth() — Better Auth config (argon2id, 12 h DB sessions, `vd` strict cookies, DB rate limit, admin plugin). Importing it reads no env
  auth.cli.ts               eager `auth` export for the Better Auth CLI only (`pnpm auth:schema` regenerates lib/db/auth-schema.ts)
  auth/constants.ts, password.ts   cookie prefix + session/lockout/rate-limit tuning (import-free) · hashPassword/verifyPassword (argon2id), password policy
  auth/hooks.ts             Better Auth before/after hooks: lockout, session freshness, password policy, self-action rule, audit trail
  auth/lockout.ts, audit.ts per-account lock state machine (pure `applyFailure` + transactional persistence) · `recordAudit` + `AUDIT_ACTIONS`/`AUDIT_ACTION_LABELS` (append-only audit_log, never throws)
  auth/error-messages.ts, temp-password.ts   auth error code → Vietnamese text (+ Retry-After parsing) · browser-side temporary password generator — both client-safe
  auth-client.ts            browser Better Auth client (`adminClient({ ac, roles })`) + `reauthenticate()`
  audit-query.ts            read side of audit_log for /admin/audit: `parseAuditFilters`, `queryAuditLog` (filters, paging, resolves the target's email), `auditPageHref`
  format-date.ts, user-agent.ts, search-params.ts   Asia/Ho_Chi_Minh date formatting (same output on server and client) · "Chrome trên macOS" device label · `firstParam()` for `searchParams`
  dal.ts                    the authorization point: getSessionUser, requireUser (pages), requireApiUser (Route Handlers: 401/403/415, same-origin check)
  admin-access.ts           pure /admin routing decision for proxy.ts + `safeAdminNextPath` (open-redirect guard) + the shared admin paths — import-free
  permissions.ts            access control: roles `admin` / `editor`, `can()` / `hasPermission()`, Vietnamese `ROLE_LABELS` — one source of truth for DAL, UI and the admin plugin
  db/schema.ts, auth-schema.ts   Drizzle schema: auth-schema.ts is GENERATED (never hand-edit); schema.ts adds login_attempt + audit_log (append-only) and re-exports db/content/*
  db/types.ts               Db / Tx / DbExecutor (types only)
  content/compose/, revision.ts   rows → zod documents for every entity type · writes a content_revision row
  content/drafts.ts, publish.ts, restore.ts, aliases.ts, used-by.ts   the write side (3c): drafts, publish, revisions + restore, releasing old URLs, "used by"
  content/validate.ts, references.ts, diff.ts, humanize.ts, identity.ts, errors.ts, cache-tags.ts   advice + checks, what a document points at, field-level diff, DB error → Vietnamese, URL type names / ids, Conflict / Invalid / NotFound, cache tags
  content/delete.ts, summaries.ts   delete / archive-first rules (+ the "delete" revision) · admin list rows
  content/editor/           the editors' client-safe logic: paths, session reducer, API client, completeness, create templates, entity meta, vocabulary, product ops / menu ops / lists / slugs / slug ops / message tree / sections / uid (no server imports — client-bundle.test.ts)
  content/read/             the PUBLIC site's reads (Phase 4): pure document → view-model builders (catalog, menus, selectors, urls, messages), language-resolved page models (navigation, card, pages), the loaders and cached reads (load.ts, cache.ts, site.ts) and resolve-page.ts — pages call the `get*` ones
  content/field-registry.ts, entity-types.ts, slugify.ts, media-library.ts, authors.ts, vocabulary.ts   every editable leaf → label + control · the 12 entity types (database-free) · URL slugs · media picker data · account names for the history · picker lists
  content/http.ts, requests.ts, effects.ts   the HTTP layer of app/api/admin/content: URL / If-Match / capped JSON body / error mapping · zod request bodies · cache tags + audit after commit
  content/apply/            one applier per entity type (all twelve): document → live rows, plus the per-language slug planning (`planSegments` also serves posts and categories)
  db/content/*.ts           the CMS content model: foundations, library, catalog, shapes-options, sizes-specs, menus, merchandising, blog, site-message, drafts (+ columns.ts, seo.ts builders)
  content/schemas/          zod document schemas (product, menu, post, library entities) + DOCUMENT_SCHEMAS / parseDocument / documentIdentity
  content/column-registry.ts, schema-paths.ts   every content column → the document path that carries it (or system-owned) · resolver that checks the paths against the zod schemas
  icons.ts                  the icon registry: stored name → lucide component (ICONS, ICON_NAMES, resolveIcon); draw with components/ui/named-icon.tsx
  logger.ts                 getLogger(scope) (pino, redaction), maskPhone(), logRequestError()
  db/index.ts               lazy pg Pool + drizzle handle (getPool/getDb/pingDatabase)
  locale.ts                 pickLocale(locale, vi, en, zh?, ja?, ko?) for data/*.ts fields
  contact.ts                Phone / Zalo / email constants
  motion.ts                 imageWipeReveal Motion variant (clip-path wipe-down reveal)
  utils.ts                  cn()
  hash-navigation.ts, menu-active.ts   Safe hash navigation (aliases through `data-aliases`), active-menu detection (plain comparison of canonical links)
  shape-aliases.ts          the old shape-id dictionary — seed only (public code must not import it)
  product-sizes.ts, product-specs.ts   the old name-matching size / spec heuristics — seed only
  content-store.ts          admin-only: local-filesystem persistence — to be replaced (see Admin CMS)
data/
  subgroups-catalog.ts      MAIN_CATEGORIES (4) + SUBGROUPS_CATALOG (25) — the seed's input (the public site reads the database)
  categories.ts             ProductCategory/ProductItem/ProductOption types (seed / legacy admin)
  showcase.ts               showcaseImages (the /products gallery; moves to the database in M3)
  translations.ts           zh/ja/ko text for showcase labels, categories, items, shapes (seed; /products showcase captions until M3)
  posts.ts                  BlogPost type, blogPosts (from content/posts.json) + categoryColors
  marketing-menu.ts, office-menu.ts, packaging-menu.ts, tet-menu.ts   the old mega-menu columns (seed input)
  material-traits.ts        the old MaterialTrait icon glossary (seed input)
  content/                  JSON written by the current admin (only posts.json is read by the site)
scripts/
  admin-cli.ts, admin/      `pnpm admin:create` / `admin:reset-password` — entry + prompt.ts (hidden raw-mode input), commands.ts (testable logic), rules.ts, errors.ts
  parity/                   `pnpm parity:capture` / `parity:compare` — page text + links of the old site vs the new (classify.ts, compare.ts, text.ts, capture.ts)
  seed-cli.ts, seed/        `pnpm seed` — entry · index.ts (seed-if-empty, dry run) · run.ts (the order of the steps) · sources.ts · steps/* · measures.ts · report/* (Vietnamese owner report) · *.int.test.ts (counts, parity with the source, URLs, menus)
  optimize-images.mjs       sharp-based image optimization script (run by hand)
components/
  providers/
    SmoothScroll.tsx        Lenis init (desktop only, ≥1024px) — no GSAP, no pinning
    quote-modal-provider.tsx  Context that opens the QuoteModal from anywhere
    site-data-provider.tsx  SiteDataProvider / useSiteData(): the language's navigation (categories, cards, menus) for the client chrome
  admin/                    admin-shell (+ admin-nav.ts role-filtered sidebar, admin-theme.tsx), auth-card-shell, password-field, notice, failure-notice, modal, page-parts (PageHeader, AdminCard, button/input classes)
    content/                the content editors: entity-editor, entity-list, create-dialog, editor-context, field primitives (fields, media-field, icon-field, field-shell), language-tabs, publish-dialog, history-panel, danger-card, diff-view, issue-list, use-draft-session; forms/ = one form per entity type (forms/product/ = the six-tab product editor, forms/menu/ = the menu editor, post-form, category-form, site-message-form) + forms.test.ts (coverage of all twelve); list-card, slug-field, alias-list, media-list-field, use-open-keys = the building blocks of the nested editors
    account/, users/, audit/   sessions panel · users manager (cards, create / confirm / one-time-password dialogs, user-actions.ts) · audit filter form + table
    donut-chart, media-card, media-delete-modal, media-picker-modal   legacy editors' pieces
  sections/                 all "use client"; landing page order = page.tsx import order
    Navbar.tsx              Fixed top nav, mobile hamburger drawer, 5-locale flag switcher (reads useSiteData)
    MegaMenuDesktop.tsx, MegaMenuMobile.tsx, fast-print-tags.ts   the ONE mega-menu pair, driven by a category's NavMenu
    SubgroupShapesView.tsx  Shapes grid of a product (ShapesPageModel)
    ProductDetailView.tsx   Server component: product without shapes / one shape / one material page (DetailPageModel | ShapePageModel | MaterialPageModel)
    PartnerLogos.tsx        Partner logo strip (between CTA and Footer)
    Hero.tsx                Swiper fade-effect autoplay carousel, per-slide gradient bg
    ShopCategories.tsx      Horizontal category rail (scroll-snap on mobile)
    ShopBanner.tsx          2-up promo banner
    About.tsx               Looping video + stat card, checklist, CTA
    Services.tsx            4 free-service cards
    Shop.tsx                 Tabbed product grid by category
    CtaBanner.tsx            Full-bleed image banner, 2 CTAs
    Portfolio.tsx            Asymmetric project mosaic (desktop) / 2×3 grid (mobile)
    Testimonials.tsx         Swiper autoplay carousel, dot-nav pagination
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
    floating-contact.tsx      Global Zalo/phone floating buttons (root layout)
    quote-modal.tsx, consult-bottom-sheet.tsx   Lead-capture UIs; both POST to /api/consult
    language-detector-toast.tsx, auto-scroll-to-target.tsx, zalo-icon.tsx   Locale suggestion toast, hash auto-scroll helper, Zalo glyph
    named-icon.tsx            <NamedIcon name> — draws an icon the database names (lib/icons.ts)
    material-flashcard.tsx    Per-option flip card (takes a CardView): images, traits, sizes / specs form, copy-to-Zalo consult flow
    material-glossary-fab.tsx Bottom-left icon-legend popover (takes GlossaryTrait[])
```
