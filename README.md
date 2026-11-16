# Mybet Web (Next.js 16)

Mybet sportsbook & casino frontend, built from the Mybet homepage design, the
Mybet Design System and the sitemap templates.

## ඉක්මන් ආරම්භය (Windows / PowerShell)

1. **Node.js 20.9 හෝ ඊට අලුත්** install කරලා තියෙන්න ඕනේ. Check කරන්න: `node -v`
2. Project folder එකට යන්න, packages install කරන්න:
   ```powershell
   cd mybet-web
   npm install
   ```
3. Environment file එක හදන්න:
   ```powershell
   copy .env.example .env.local
   ```
   `API_BASE_URL` හිස්ව තිබ්බොත් site එක **demo data** වලින් වැඩ කරනවා.
4. Development server එක run කරන්න: `npm run dev` → http://localhost:3000
5. Production build: `npm run build` ඊට පස්සේ `npm start`

**Demo mode:**
- ඕනෑම phone / e-mail එකක් සහ අකුරු 8+ password එකකින් login වෙන්න පුළුවන්.
- Registration code එක `123456`.
- Bets සැබෑ මුදල් නෙවෙයි.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` / `npm start` | Production build / server |
| `npm run lint` | ESLint (Next core-web-vitals + TypeScript) |
| `npm run typecheck` | `tsc --noEmit` (route types from `next typegen`) |
| `npm test` | Vitest unit + component tests |
| `npm run test:e2e` | Playwright (desktop 1920 + Pixel 7). First run: `npx playwright install chromium` |

## Stack

Next.js 16.4 (App Router, Turbopack, **Cache Components + Partial Prefetching**),
React 19, TypeScript, Tailwind CSS 4 (Mybet tokens in `src/app/globals.css`),
zod 4, Font Awesome Free icons (inline SVG), Inter (self-hosted via Fontsource).

## Routes (sitemap → template)

| Route | Template | File |
|---|---|---|
| `/` | Home (as drawn) | `src/app/(sports)/page.tsx` |
| `/line` | Sports | `(sports)/line/page.tsx` |
| `/line/[sport]` | Sport | `(sports)/line/[sport]/page.tsx` |
| `/line/[sport]/[league]` | League | `…/[league]/page.tsx` |
| `/line/[sport]/[league]/[match]` | Match (all markets) | `…/[match]/page.tsx` |
| `/live` | Live | `(sports)/live/page.tsx` |
| `/cyber/esports` | Esports | `(sports)/cyber/esports/page.tsx` |
| `/allgamesentrance` · `/[game]` | Mybet Games lobby · game | `(casino)/allgamesentrance/…` |
| `/casino` · `/casino/brand?game=&product=` | Slots / live casino lobby · casino game | `(casino)/casino/…` |
| `/bonus` · `/bonus/rules/[slug]` · `/bonus/casino/tournaments/[id]` | Promotions · rules · tournament | `(promo)/bonus/…` |
| `/information/[page]` | About, terms, privacy, contacts, payments … | `(info)/information/[page]/page.tsx` |
| `/sitemap.xml`, `/robots.txt` | Generated from the same data | `src/app/sitemap.ts`, `robots.ts` |

Route groups give each section its own left sidebar: `(sports)`, `(casino)`, `(promo)`, `(info)`.
Login and Registration are dialogs (`components/auth/AuthDialog.tsx`), opened from anywhere.

URL state: `?tab=`, `?q=` (search), `?streams=1`, `?provider=` – shareable and work without JavaScript.

## Project structure

```
src/
  app/                    routes, layouts, API route handlers (api/auth/*, api/bets)
  components/
    layout/               Header, MainNav, PageGrid (250 | fill | 250), sidebars, Footer
    sports/               TabsBar, SportFilter, LeagueHeader, MatchRow, MatchesSection, MatchDetail
    casino/               GameTile, GameGrid, HeroBanner, GameStage, GameLobby
    promo/                PromoCard, DataTable, PromoAction
    betslip/              OddsButton, BetSlipCard, SaveLoadCard
    auth/                 AuthDialog, LoginForm, RegisterForm, session
    ui/                   Icon, Button, Card/Section/Breadcrumbs, Artwork, Logo
  lib/
    schemas.ts            zod schemas = TypeScript types = API contract
    data.ts               server-only data access (Laravel API or mock)
    mock/                 demo data (sports, casino, content)
    betslip.ts            bet slip rules & money maths (pure, tested)
    validation.ts         auth / bet request schemas (shared client + server)
    filters.ts, format.ts, site.ts, icons.ts, selection.ts
    client/               external stores (bet slip, session, dialogs, layout), fetch helper
    server/http.ts        CSRF origin check, bounded JSON parsing, API proxy
tests/unit, tests/e2e
```

## Connecting the Laravel API

Set `API_BASE_URL` (server-side only, never exposed to the browser). Every response
is validated with the zod schemas in `src/lib/schemas.ts`; a wrong shape fails loudly
instead of rendering broken data.

**Read endpoints** (`src/lib/data.ts`, cached with `"use cache"` + `cacheLife`):

| Endpoint | Returns | Cache |
|---|---|---|
| `GET /sports` | `Sport[]` | hours |
| `GET /sports/totals` | `{ all, withStreams }` | minutes |
| `GET /leagues`, `GET /sports/{sport}/leagues` | `League[]` | hours |
| `GET /matches?sport=&league=&status=&esport=` | `Match[]` | minutes |
| `GET /matches/{id}` | `MatchDetail` (all markets) · 404 → not found | minutes |
| `GET /matches/featured` | `Match` (Top Games card) | minutes |
| `GET /home/leagues`, `GET /home/tiles` | `string[]` (slugs, in display order) | hours |
| `GET /games?kind=&tag=&provider=`, `GET /games/{slug}` | `Game[]`, `Game` | hours |
| `GET /providers` | `Provider[]` | days |
| `GET /promotions`, `GET /tournaments`, `GET /tournaments/{id}` | … | hours / minutes |
| `GET /pages` | `InfoPage[]` | days |

**Write endpoints** go through Next.js route handlers, which check the Origin
(CSRF), limit the body to 16 KB, validate with zod and then proxy to the API
with the browser's cookies (and copy `Set-Cookie` back):

| Browser → Next.js | → Laravel |
|---|---|
| `POST /api/auth/login` | `POST /auth/login` |
| `POST /api/auth/sms` | `POST /auth/register/code` |
| `POST /api/auth/register` | `POST /auth/register` |
| `GET /api/auth/me` | `GET /auth/me` → `{ user: { name } \| null }` |
| `POST /api/auth/logout` | `POST /auth/logout` |
| `POST /api/bets` | `POST /bets` |

Use httpOnly, `Secure`, `SameSite=Lax` session cookies on the API (e.g. Laravel
Sanctum). The backend must **re-price every selection and own the bet decision** –
the frontend only validates shape and limits.

Data changes on the API can refresh pages on demand with `revalidateTag("matches")`
(tags are set in `data.ts`) from a small signed webhook route.

## Bet slip

`src/lib/betslip.ts` rules: one outcome per match (a new pick replaces the old one),
single / accumulator, stake LKR 50 – 1,000,000, max 20 selections, payout cap
LKR 50,000,000, money in integer cents, odds rounded to thousandths before multiplying.
The slip persists in `localStorage`; Save / Load uses a self-contained validated code
(`MB1.…`). For short codes, store slips on the backend instead.

## Images

Add files under `public/images/…` and set the `image` field in the data
(see `public/images/README.md`). Partner logos: `PARTNERS` in `src/lib/site.ts`.
Until then, gradient placeholders keep the layout complete.

## Security

- Security headers in `next.config.ts`: CSP, `X-Frame-Options: DENY`, `nosniff`,
  `Referrer-Policy`, `Permissions-Policy`, COOP, HSTS (production).
  Add your CDN / API / game-provider origins to `img-src`, `connect-src`, `frame-src`.
  For a nonce-based CSP (no `'unsafe-inline'` scripts) move the header into `src/proxy.ts`.
- Same-origin check on every state-changing route handler (CSRF).
- zod validation on every input and every API response; untrusted slip codes are validated before loading.
- No secrets in client code; `API_BASE_URL` is server-only. `poweredByHeader` is off.
- Rate limiting and account lockout belong on the API / edge (Cloudflare, Nginx).
- Login errors don't reveal whether an account exists.

## Responsive behaviour

1920 design grid: 250 | fill | 250 with 8 px gutters. Below 1280 px the right
sidebar becomes a drawer (floating **Bet slip** button); below 1024 px the left
sidebar becomes a drawer (☰ in the nav). Match rows use container queries: odds
groups 2–3 hide on narrow columns and rows stack on phones.

## Known next steps

- Sinhala UI strings (the SI/EN switch stores the choice; add `next-intl` for translations).
- Live odds over WebSocket, favourites, account pages, deposit/withdrawal requests via agents.
- Real artwork and the SVG logo from the design system.

Icons: Font Awesome Free by Fonticons, Inc. (icons CC BY 4.0).
