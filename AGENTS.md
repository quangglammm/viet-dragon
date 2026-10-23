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
| Drizzle ORM · drizzle-kit · `pg` | 0.45.x · 0.31.x · 8.x | PostgreSQL access (`lib/db`) and migrations (`drizzle.config.ts`); schema so far = auth + audit tables only (content tables arrive in Phase 3a) |
| Better Auth · `@better-auth/drizzle-adapter` · `auth` CLI | 1.7.12 (exact, keep all three in lockstep) | Invite-only accounts, DB sessions, admin plugin (roles). `@node-rs/argon2` hashes passwords. See **Authentication** below |

GSAP/ScrollTrigger and the old pin/cover scroll rig (`PanelContainer.tsx`) were removed —
do not reintroduce them or look for that file; see **Scroll & entrance animation** below
for the current architecture.

---

## Package manager
This project uses **pnpm** (pinned via `packageManager` in `package.json`) — not npm or yarn.
- Install deps: `pnpm install` — never `npm install`/`yarn install`. Running the wrong tool
  regenerates `package-lock.json`/`yarn.lock` as a second, conflicting lockfile.
- Add a dependency: `pnpm add <pkg>` · dev dependency: `pnpm add -D <pkg>`
- Run scripts: `pnpm dev`, `pnpm build` (runs `next build --webpack`), `pnpm start`, `pnpm lint`, `pnpm test`, `pnpm test:int`
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
  (bottom-left icon-legend popover, product detail page only, when the product has
  `optionGroups`). Shared phone/Zalo constants live in `lib/contact.ts` — reuse those
  instead of re-hardcoding the number. `app/[locale]/layout.tsx` also mounts
  `QuoteModalProvider` (the quote modal) and `LanguageDetectorToast`.
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
| `/[locale]/products` | Server async | `await params`; showcase gallery + the 4 `MAIN_CATEGORIES` cards |
| `/[locale]/products/fast-print` | Server + client | "In nhanh lấy liền" page; interactive part in `FastPrintClient.tsx` |
| `/[locale]/products/[categoryId]` | Server async | `await params`; `generateStaticParams` pre-generates the 4 categories (locales handled by the parent layout) |
| `/[locale]/products/[categoryId]/[productId]` | Server async | `await params`; `generateStaticParams`; product = a subgroup from `data/subgroups-catalog.ts`; renders `MaterialFlashcard` per option and, when the product has `optionGroups`, `MaterialGlossaryFab` |
| `/[locale]/products/[categoryId]/[productId]/[shapeId]` | Server async | `await params`; per-shape page with its own `generateStaticParams`; shape ids go through `lib/shape-aliases.ts` |
| `/[locale]/blog` | Server async | `await params` for `{ locale }` |
| `/[locale]/blog/[slug]` | Server async | `await params`; `generateStaticParams` pre-generates every post in `blogPosts` (6 today) |
| `/[locale]/[...rest]` | Server | Catch-all that only calls `notFound()`, so unknown URLs (and every other `notFound()` under `[locale]`) render `[locale]/not-found.tsx` — a localized 404 (namespace `notFound`, Navbar + Footer). Without it `[locale]` as the top-level segment never reaches that file |

Routes **outside** `[locale]` (excluded from the next-intl `proxy.ts` matcher):

| Route | Notes |
|---|---|
| `/admin/*` | CMS UI — own root layout, Vietnamese only. See **Admin CMS** |
| `/api/admin/*` | CMS API (auth, blog, media, products, translations, translate) |
| `/api/auth/*` | Better Auth (`app/api/auth/[...all]/route.ts`): sign-in/out, session, password change, admin-plugin user management. Sign-in must use this HTTP surface — only HTTP requests are rate limited, not `auth.api.*` calls |
| `/api/consult` | Public. Receives quote/consult leads from `QuoteModal` / `ConsultBottomSheet`, emails them |
| `/zalo-reply` | Client page that copies a prepared reply message and opens Zalo (`noindex`) |
| `/api/health` | Liveness for the Docker healthcheck: always 200 while the process serves, body `{ status, db: "ok" \| "down" }` — a database outage must not mark the app unhealthy |
| `/robots.txt` | `app/robots.ts` — disallows `/admin`, `/api/`, `/zalo-reply`; no `sitemap` entry until Phase 4 |

`/products` and `/blog` have their own `layout.tsx` that wraps Navbar + Footer
(the `[categoryId]/[productId]` detail pages nest under the `/products` layout).
Root `app/[locale]/layout.tsx` calls `generateStaticParams` for all five locales and
`setRequestLocale` — today every nested page/layout under it is statically generated per
locale (this changes when content moves to the database — see **Admin CMS**).

**SEO today:** per-page `title` + `description` only (5 languages), `metadataBase` from `SITE_URL`,
`noindex` on `/admin` and `/zalo-reply`. Canonical, `hreflang` (+ `x-default`), Open Graph, JSON-LD
and `sitemap.xml` are Phase 4 (`lib/seo`); the SEO fields (`seo_title`, `seo_description`,
`og_media_id`) go into the Phase 3a schema — see `docs/data-model.md` §11.5a.

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
- `data/subgroups-catalog.ts` (≈9,200 lines) — **source of truth for products as the public site
  renders them today**: `MAIN_CATEGORIES` (4: Tiếp thị/Marketing, Văn phòng/Office, Bao bì/Packaging,
  Ấn phẩm Tết/Tet Publications) and `SUBGROUPS_CATALOG` (25 subgroups — 7 marketing, 6 office,
  4 packaging, 8 tet — with 77 shapes and 101 materials in total); lookups via
  `getSubgroupById()` / `getSubgroupsByCategory()`. Product and category pages import from here.
- `data/categories.ts` — the **types** (`ProductCategory`, `ProductItem`, `ProductOption`,
  `ProductOptionGroup`) plus `showcaseImages`. Every name/description field is split `xVi`/`x`
  (English) with optional `xZh`/`xJa`/`xKo` — read with `pickLocale()`, never several at once.
- `data/translations.ts` — extra zh/ja/ko text kept **outside** the records
  (`SHOWCASE_LABELS`, `CATEGORY_NAMES`, `CATEGORY_DESCS`, `ITEM_NAMES`, `ITEM_DESCS`,
  `SHAPE_DESCS`, keyed by id). Product pages read it directly.
- `data/posts.ts` — `BlogPost` type, `blogPosts` (6 posts, **imported from
  `data/content/posts.json`** at build time) and `categoryColors`. Same `xVi`/`x` split,
  including full article bodies (`content` / `contentEn` / `contentZh` / …).
- `data/marketing-menu.ts`, `office-menu.ts`, `packaging-menu.ts`, `tet-menu.ts` — Navbar
  mega-menu column definitions, consumed by the `*DesktopSubmenu` / `*MobileSubmenu` components.
- `data/content/*.json` — files written by the current admin (`posts.json`, `products.json`,
  `subgroups.json`). Only `posts.json` is read by the site (via `data/posts.ts`); `products.json`
  and `subgroups.json` are **not read by any public page**.
- `data/material-traits.ts` — `Record<MaterialTraitKey, MaterialTrait>` icon glossary for
  `ProductOption.descriptionTraits` bullets (in `data/categories.ts`); consumed by
  `MaterialFlashcard` (per-bullet icon) and `MaterialGlossaryFab` (full legend popover).
- `coverImage` / `image` fields are real local paths (`/images/category/...`,
  `/images/product/...`, `/images/blog/...`) served straight from `public/` — no
  `unoptimized` prop needed on those `<Image>`s. The one picsum reference in the
  codebase is the testimonial avatar seeds in `Testimonials.tsx` (not a `data/*.ts` field —
  those live inline in the component, zipped with `messages/*.json` `t.raw("items")`).
- **`data/*.ts` vs `messages/*.json`**: structured records with a stable shape (categories,
  products, blog posts, material traits) live in `data/` with `xVi`/`x` field pairs. Pure UI
  copy (headings, buttons, FAQ, checklists) lives in `messages/<locale>.json` (all five) —
  see Internationalization below. Don't move one into the other's convention.

---

## Internationalization
`next-intl` with `/[locale]` App Router segment routing. Locales: `vi` (default/unprefixed:
`/`, `/products`), `en`, `zh`, `ja`, `ko` (prefixed: `/en`, `/zh/products`, …) —
`localePrefix: "as-needed"` and `localeDetection: false` in `i18n/routing.ts`.

- **Always import `Link`, `usePathname`, `useRouter` from `@/i18n/navigation`** for internal
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
- UI: `app/admin/{site-content,products,blog,media,translations,login}`; shell in
  `components/admin/admin-shell.tsx`. The admin has its own root layout
  (`app/admin/layout.tsx`, Vietnamese-only UI) and sits **outside** `app/[locale]` and
  outside next-intl.
- API: `app/api/admin/{auth,blog,media,products,translations,translate}`. Persistence is
  `lib/content-store.ts`, which reads and writes `data/content/*.json`, `messages/*.json`
  and `public/uploads/` on the **local filesystem**.
- Auth: `lib/admin-auth.ts` — one shared password, a hardcoded fallback password and
  session secret, and a base64 cookie that anyone with the source can forge. **Not safe
  to deploy; do not copy this pattern.** Page access is only checked client-side
  (`AdminShell` → `/api/admin/auth/me`); each API route checks `getAdminSession()`.
- **The public site does not see admin edits at runtime**: products come from static
  `data/subgroups-catalog.ts`, blog posts from `data/posts.ts` (bundles
  `data/content/posts.json` at build time), UI copy from `messages/*.json` (bundled at
  build time by `i18n/request.ts`). Edits only show in `next dev` or after a rebuild —
  and `products.json` / `subgroups.json` are never read at all.
- `/api/admin/translate` is a stub (returns the input unchanged unless it is one of six
  hardcoded nav labels). The admin sidebar's counts ("20 sản phẩm · 8 danh mục") are
  hardcoded and wrong (the catalog has 25 subgroups in 4 categories).

### Target **(planned — see the phases in `docs/admin-architecture.md`)**
PostgreSQL + Drizzle ORM · Better Auth with invite-only named accounts and `admin` /
`editor` roles · public pages reading content through `lib/content/*` (tag-cached, with a
static-seed fallback) · validated media pipeline served from a volume · Docker Compose +
Caddy on one VPS. **The customer must be able to edit every product attribute in all 5
languages**, and edits are **drafts until published** (draft → preview → publish, every publish a
restorable revision). The relational schema (validated against the real data), the draft/publish
design, the seed rules and the owner-review list are in `docs/data-model.md` (+ `docs/data-model.sql`).

### Rules for admin / CMS code
- **Server-side access control only.** Every admin page and every `/api/admin/*` handler
  must authenticate on the server; a client-side redirect is not access control.
  (Today: `getAdminSession()`. From Phase 2: `requireUser()` / `requireApiUser()` in `lib/dal.ts`.)
- **Validate every write body** with zod; never `await request.json() as SomeType`.
- **No secrets or default credentials in source.** Read config through `lib/env.ts`
  (never `process.env` directly) and fail fast when it is missing.
- **Mutations must invalidate the public site** — `revalidateTag(tag, { expire: 0 })`
  (two-argument form) from a Route Handler.
- **Don't import `lib/content-store.ts` or `lib/admin-auth.ts` from public pages**; both
  are deleted by Phase 4 / Phase 2 respectively.
- **Never write content to the filesystem at runtime** in new code — content goes to the
  database (Phase 3), uploads to the uploads volume (Phase 5), never into `public/`.
- **No product attribute in code.** Names, text, sizes, spec lists, icons, prices and menu
  placement belong in the database and must have an editor control (a registry test enforces
  it). Don't add new `if (name.includes(...))` heuristics, inline per-locale dictionaries, or
  `xVi`/`x`/`xZh` suffix fields — new text goes in a `*_i18n` table or `messages/`.
- Admin text is Vietnamese-only and the admin stays outside `app/[locale]`.

### Authentication (Phase 2 — in progress)
**Landed (M1–M2):** Better Auth core (`lib/auth.ts`), schema + migrations, roles (`lib/permissions.ts`), `/api/auth/*`,
the security hooks (`lib/auth/hooks.ts`), the DAL (`lib/dal.ts`) and the `proxy.ts` admin branch. **Not wired yet:** the
admin UI (M3) and the `/api/admin/*` routes (M4) still use the legacy `lib/admin-auth.ts`. **Until M3 the legacy admin is
unreachable by design:** the proxy redirects every `/admin/*` request without a `vd.session_token` cookie to `/admin/login`,
and the legacy login only sets the old cookie.
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
- Accounts are **invite-only** (`disableSignUp`); the first admin comes from `pnpm admin:create` (M5), never from a default.
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
| `ADMIN_USERNAME`, `ADMIN_PASSWORD` | legacy | `lib/admin-auth.ts` only; insecure fallbacks, removed in Phase 2 |

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
`runner`, plus `tools` for the migrate job), `compose.yaml` (`caddy` → `app` → `db`, plus a one-shot
`migrate`), `deploy/Caddyfile`, `deploy/db-init/` (creates the DML-only `vietdragon_app` role on
first init), `.env.example`. `compose.dev.yaml` is Postgres only, on `127.0.0.1:5432`, for `pnpm dev`.
Runbook and rationale: `docs/deployment.md`.
- The app connects as `vietdragon_app` (SELECT/INSERT/UPDATE/DELETE only — no DDL, no TRUNCATE);
  `migrate` runs as the owner. Never point the app at the owner role.
- App container: non-root, read-only root FS (writable: `/tmp` and the `.next/cache` volume),
  `cap_drop: ALL`, no published ports. `db` sits on an `internal` network. **One app instance only.**
- Building needs internet (`next/font/google`) and `--build-arg SITE_URL=…` — nothing else.
- `deploy/Caddyfile` 404s `/admin*` and `/api/admin/*` (the legacy admin is unsafe and writes to the
  source tree — **remove those blocks when Phase 2 lands**) and `/api/health` (internal healthcheck only).
  It overwrites `X-Real-IP` with the TCP peer.
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
  [locale]/                 public site — layout mounts SmoothScroll, QuoteModalProvider, FloatingContact, LanguageDetectorToast
  admin/                    CMS UI — own root layout, Vietnamese only, outside next-intl (see Admin CMS)
  [locale]/not-found.tsx    localized 404 (Navbar + Footer); reached via the [locale]/[...rest] catch-all
  api/consult/              public lead endpoint (nodemailer)
  api/health/               liveness for the Docker healthcheck (always 200; db state in the body)
  api/admin/                CMS API: auth, blog, media, products, translations, translate
  robots.ts                 robots.txt (no sitemap yet)
  zalo-reply/               client page: copy a prepared reply, open Zalo
instrumentation.ts          register(): env fail-fast (Node runtime only, skipped at build) · onRequestError → lib/logger
instrumentation-node.ts     validateEnvOrExit() — Node-only, imported dynamically so the Edge bundle stays clean
drizzle.config.ts, drizzle/ drizzle-kit config (loads .env via @next/env) · migrations — empty journal until Phase 3a
Dockerfile, compose.yaml, compose.dev.yaml, .env.example, .dockerignore, deploy/   see Docker & deployment
i18n/
  routing.ts               defineRouting({ locales: [vi, en, zh, ja, ko], defaultLocale: vi })
  navigation.ts             Locale-aware Link/usePathname/useRouter/redirect — import from here, not next/*
  request.ts                getRequestConfig — loads messages/<locale>.json (build-time dynamic import)
messages/
  vi, en, zh, ja, ko .json  UI copy, namespaced per section — keep all five key sets in sync
proxy.ts                    Next 16 "proxy" (not middleware.ts): `/admin/*` → optimistic session-cookie check (lib/admin-access.ts); everything else → next-intl createMiddleware; the intl matcher still skips api/admin/zalo-reply
vitest.config.mts, vitest.int.config.mts, tests/   unit config · integration config (throwaway DB via tests/db-setup.ts) · shared helpers; `*.test.ts` live beside the code, `*.int.test.ts` need the dev DB
hooks/
  use-section-in-view.ts    Shared useRef + useInView(once, margin -80px)
  use-current-hash.ts, use-hash-pulse.ts   Current-hash tracking and hash-target pulse highlight
lib/
  env.ts                    zod-validated config: getDatabaseEnv/getMailEnv/getLogEnv/getSiteEnv/getAuthEnv + assertEnv (relative imports: drizzle.config.ts loads it outside Next)
  auth.ts                   createAuth() / lazy getAuth() — Better Auth config (argon2id, 12 h DB sessions, `vd` strict cookies, DB rate limit, admin plugin). Importing it reads no env
  auth.cli.ts               eager `auth` export for the Better Auth CLI only (`pnpm auth:schema` regenerates lib/db/auth-schema.ts)
  auth/constants.ts, password.ts   cookie prefix + session/lockout/rate-limit tuning (import-free) · hashPassword/verifyPassword (argon2id), password policy
  auth/hooks.ts             Better Auth before/after hooks: lockout, session freshness, password policy, self-action rule, audit trail
  auth/lockout.ts, audit.ts per-account lock state machine (pure `applyFailure` + transactional persistence) · `recordAudit` (append-only audit_log, never throws)
  dal.ts                    the authorization point: getSessionUser, requireUser (pages), requireApiUser (Route Handlers: 401/403/415, same-origin check)
  admin-access.ts           pure /admin routing decision for proxy.ts + `safeAdminNextPath` (open-redirect guard) — import-free
  permissions.ts            access control: roles `admin` / `editor`, `can()` / `hasPermission()` — one source of truth for DAL, UI and the admin plugin
  db/schema.ts, auth-schema.ts   Drizzle schema: auth-schema.ts is GENERATED (never hand-edit); schema.ts adds login_attempt + audit_log (append-only)
  logger.ts                 getLogger(scope) (pino, redaction), maskPhone(), logRequestError()
  db/index.ts               lazy pg Pool + drizzle handle (getPool/getDb/pingDatabase); schema arrives in Phase 3a
  locale.ts                 pickLocale(locale, vi, en, zh?, ja?, ko?) for data/*.ts fields
  contact.ts                Phone / Zalo / email constants
  motion.ts                 imageWipeReveal Motion variant (clip-path wipe-down reveal)
  utils.ts                  cn()
  hash-navigation.ts, menu-active.ts, shape-aliases.ts   Safe hash navigation, active-menu detection, shape-id aliasing
  image-check.ts            Sanitizes option image paths (deliberately avoids node:fs so NFT does not trace public/)
  product-sizes.ts, product-specs.ts   Standard print sizes / material specs per category · subgroup · shape
  content-store.ts          admin-only: local-filesystem persistence — to be replaced (see Admin CMS)
  admin-auth.ts             admin-only: shared-password session — to be replaced (see Admin CMS)
data/
  subgroups-catalog.ts      MAIN_CATEGORIES (4) + SUBGROUPS_CATALOG (25) — what product pages render
  categories.ts             ProductCategory/ProductItem/ProductOption types + showcaseImages
  translations.ts           zh/ja/ko text for showcase labels, categories, items, shapes
  posts.ts                  BlogPost type, blogPosts (from content/posts.json) + categoryColors
  marketing-menu.ts, office-menu.ts, packaging-menu.ts, tet-menu.ts   Navbar mega-menu columns
  material-traits.ts        MaterialTrait icon glossary for product-option bullets
  content/                  JSON written by the current admin (only posts.json is read by the site)
scripts/
  optimize-images.mjs       sharp-based image optimization script (run by hand)
components/
  providers/
    SmoothScroll.tsx        Lenis init (desktop only, ≥1024px) — no GSAP, no pinning
    quote-modal-provider.tsx  Context that opens the QuoteModal from anywhere
  admin/                    admin-shell, donut-chart, media-card, media-delete-modal, media-picker-modal
  sections/                 all "use client"; landing page order = page.tsx import order
    Navbar.tsx              Fixed top nav, mobile hamburger drawer, 5-locale flag switcher
    *DesktopSubmenu.tsx, *MobileSubmenu.tsx   Mega-menu panels for Marketing / Office / Packaging / Tet
    SubgroupShapesView.tsx  Shapes view for a product subgroup
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
    material-flashcard.tsx    Per-option flip card on product detail — image/traits, foil &
                               double-sided checkboxes, copy-to-Zalo consult flow
    material-glossary-fab.tsx Bottom-left icon-legend popover for material-flashcard traits
```
