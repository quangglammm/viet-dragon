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
| GSAP + ScrollTrigger | 3.15.x | Pin/cover scroll effect |
| Lenis | 1.3.x | Smooth scroll — desktop only (see below) |

---

## Project overview
**Viet Dragon** (vietdragon.vn) — professional printing company, HCM City & Bình Dương.
- All content is **bilingual: Vietnamese (primary) + English (secondary)**
- Primary CTA everywhere: **"Nhận Báo Giá" / "Get a Quote"** → `/#cta`
- Visual direction: white/neutral backgrounds, printed product images take the spotlight
- All images are picsum placeholders (`unoptimized` prop required) — real photos come later

---

## Routes
| Route | Type | Notes |
|---|---|---|
| `/` | Server | 9 scroll-panel sections + Footer |
| `/products` | Server | Editorial gallery + category grid |
| `/products/[categoryId]` | Server async | `await params`; `generateStaticParams` pre-generates all 4 |
| `/blog` | Server | Featured post + grid |
| `/blog/[slug]` | Server async | `await params`; `generateStaticParams` pre-generates all 6 |

Both `/products` and `/blog` have their own `layout.tsx` that wraps Navbar + Footer.

---

## Design system
Defined in `app/globals.css` under `:root` and `@theme inline`:
```css
--brand-red:   oklch(0.45 0.22 20)   /* primary accent, CTAs */
--brand-warm:  oklch(0.97 0.01 80)   /* Portfolio section bg */
--brand-dark:  oklch(0.13 0 0)       /* footer, Trust section */
--brand-cream: oklch(0.985 0.005 80) /* Services, BlogPreview bg */
```
Use as Tailwind classes: `bg-brand-red`, `text-brand-dark`, etc.
Font: **Be Vietnam Pro** via `--font-sans` — subsets: `latin`, `vietnamese`.

---

## Scroll architecture
**Desktop (≥ 1024px):** GSAP pin/cover effect via `PanelContainer.tsx`.
- All landing page sections carry `className="scroll-panel ..."` — GSAP queries `.scroll-panel`
- All panels except the last are pinned with `pin: true, pinSpacing: false`
- Lenis smooth scroll drives GSAP via `lenis.on("scroll", ScrollTrigger.update)` + `gsap.ticker`

**Mobile/tablet (< 1024px):** Both GSAP pinning and Lenis are disabled.
- Pinning: `gsap.matchMedia` only activates pins at `(min-width: 1024px)`
- Lenis: `SmoothScroll.tsx` checks `window.innerWidth < 1024` and returns early
- Native browser scroll is used — IntersectionObserver (whileInView) works correctly

**Section height pattern:**
```tsx
className="scroll-panel relative min-h-screen lg:h-screen w-full bg-white flex items-center overflow-hidden py-20 lg:py-0"
```
`min-h-screen` on mobile lets content overflow naturally. `h-screen` on desktop is required for GSAP pinning.

**Do NOT add siblings after closing `</div>` of the inner grid inside a `flex` section.**
Flex siblings in a row container will compete for width and crush grid cells. Mobile card strip in Hero is placed *inside* the text column div to avoid this.

---

## Animation patterns
- **Entrance animations**: prefer `whileInView` + `viewport={{ once: true, margin: "-80px" }}`
- `useInView` + `animate={inView ? {...} : {}}` also works but less reliable with GSAP pins
- Hero cards: `originX: 0.5, originY: 1` (bottom-center pivot) creates the hand-of-cards fan
- Marquee: `animate={{ x: ["0%", "-50%"] }}` with **2 identical text spans** for seamless loop

---

## Data files
- `data/categories.ts` — `ProductCategory[]` (4 categories × 4 items); exports `showcaseImages`
- `data/posts.ts` — `BlogPost[]` (6 posts); exports `categoryColors`
- All `coverImage` / `image` fields use `https://picsum.photos/seed/<seed>/<w>/<h>`
- Add `unoptimized` to every `<Image>` using picsum — remove when real images are provided

---

## Navigation rules
- Hash links must always be absolute: `/#cta`, `/#services`, `/#vision` — never bare `#cta`
- Bare hashes (e.g. `#cta`) resolve relative to the current URL, breaking navigation from `/products` or `/blog`
- Navbar breakpoint: `lg` (1024px) — hamburger shows on mobile AND tablet; full nav at desktop only

---

## Component map
```
components/
  PanelContainer.tsx      GSAP scroll-panel orchestrator
  providers/
    SmoothScroll.tsx      Lenis init (desktop only, ≥1024px)
  sections/
    Navbar.tsx            Fixed top nav, mobile hamburger drawer
    Hero.tsx              Word-by-word headline + hand-of-cards fan
    Gateway.tsx           Why-choose-us + infinite marquee
    Trust.tsx             Stats (dark bg)
    Vision.tsx            Large display mission text
    Portfolio.tsx         Parallax grid + floating image
    Products.tsx          Category grid with cover images
    Services.tsx          4 free services cards
    BlogPreview.tsx       3-post preview (landing page section)
    CTA.tsx               Full-viewport red CTA (last panel, not pinned)
    Footer.tsx            Dark footer, 4 columns
  ui/                     shadcn/ui primitives
```
