# Auro

[![CI](https://github.com/anusirkas/shopping-cart/actions/workflows/ci.yml/badge.svg)](https://github.com/anusirkas/shopping-cart/actions/workflows/ci.yml)

A full-stack fashion store built as a portfolio project by [Anu Sirkas](https://portfolio-anu-sirkas-projects.vercel.app), a software engineer with ten years in garment technology and textile design.

**Live demo:** https://auro-studio.vercel.app · payments run in Stripe test mode, use card `4242 4242 4242 4242` · [back office](https://auro-studio.vercel.app/admin) open to visitors

![Auro shop with technical flats](docs/screenshots/shop.webp)

Auro started as a React storefront inspired by Acne Studios, Prada and Celine. It is now a Next.js application that treats fashion domain knowledge as product features:

- **Digital product passports.** Every product has a passport with fibre composition and origin, each step of its supply chain, certifications, care, repair and end-of-life guidance, plus an illustrative footprint. A QR code links each passport, as it would from a care label. The EU is phasing in digital product passports for textiles, so this is a real direction for fashion e-commerce.
- **A measurement-based fit finder.** It recommends a size by comparing body measurements with the garment's finished measurements and its designed *ease* (how much room a relaxed or slim fit is meant to have), allowing stretch knits to go below zero ease and rigid wovens not. That's how a garment technologist checks a fit sample.
- **A 3D fabric view.** Next to each technical flat, a React Three Fiber swatch hangs from a rail and drapes into folds. Its yarn texture is generated per construction (stockinette loops, rib, twill diagonals, over-under weave, satin floats, canvas), wool gets a soft sheen, and the colour follows the selected colourway. It loads only when opened, so the product page stays light.
- **Technical flats instead of product photos.** Products are drawn as the line drawings sent to factories (15 silhouettes in SVG), recoloured per colourway, with fabric texture by construction: knit, rib, twill, plain weave, satin or canvas.

## Screens

| Fit finder | Product passport |
|---|---|
| ![Fit finder recommending size S for a slim cashmere turtleneck](docs/screenshots/product-fit-finder.webp) | ![Passport for the Põhja Coat with QR code, composition and supply chain](docs/screenshots/passport.webp) |
| **3D fabric view** | **Admin** |
| ![Camel twill swatch hanging from a rail in the 3D fabric view](docs/screenshots/product-3d-fabric.webp) | ![Admin with orders, sales figures and the inventory grid](docs/screenshots/admin.webp) |
| **Front page** | **Stores** |
| ![Front page with the Auro wordmark over editorial photography](docs/screenshots/home.webp) | ![Store locator on a monochrome map of Paris](docs/screenshots/stores.webp) |

Screenshots are generated from the live site with `npx tsx scripts/screenshots.ts`.

## Stack

| | |
|---|---|
| App | Next.js 16 (App Router, Server Components, Server Actions), React 19, TypeScript |
| 3D | three.js with React Three Fiber, procedural canvas textures |
| Data | PostgreSQL on Neon, Drizzle ORM. Falls back to the bundled seed catalogue when no database is configured, so the demo never goes down |
| Payments | Stripe Checkout in test mode; a signed webhook marks orders paid and decrements stock (verified end to end on the live site) |
| Maps | Leaflet with OpenStreetMap tiles |
| Quality | Vitest unit tests, Playwright end-to-end tests (desktop and mobile), ESLint, type-checking and a production build on every push (GitHub Actions) |
| Hosting | Vercel |

Everything runs on free tiers.

## Architecture

```
Browser ──► Next.js on Vercel (Server Components, Route Handlers, Server Actions)
              │
              ├─ catalogue pages ──► repository ──► Neon Postgres (Drizzle)
              │                          └─ bundled seed catalogue if the DB is unset or unreachable
              ├─ POST /api/checkout ──► re-price + stock check against live DB ──► Stripe Checkout session
              │                                                                   + pending order row
Stripe ──────►├─ POST /api/stripe/webhook (signature verified)
              │      └─ order → paid, stock -= qty where stock >= qty, revalidate product pages
              ├─ /admin (Server Actions, signed session cookie)
Vercel cron ─►└─ GET /api/cron/reset-demo  (nightly: stock = seed − paid sales)
```

Product and passport pages are statically generated; product pages are revalidated on demand when stock changes (webhook, admin, nightly reset) and the home page on a five-minute timer. The shop, bag and admin render per request.

## Fit-finder algorithm

For each size and each measuring point that matters for the silhouette (chest for tops, chest and hip for dresses, waist and hip for bottoms):

```
ease    = garment circumference − body circumference
target  = designed ease for the fit (e.g. chest: slim 4, regular 10, relaxed 18, oversized 28 cm) + preference shift
floor   = −8 cm × fabric stretch            # knits may sit below zero ease, wovens may not
miss    = ease − target
score  += weight × (miss < 0 ? 1.6·|miss| : miss)   # too small is worse than too big
score  += 1000 if ease < floor                       # physically too tight
```

The lowest score wins; the gap to the runner-up sets the confidence, and a close runner-up is offered as "between sizes". See `src/lib/fit.ts` and its tests.

## Admin

`/admin` is open to visitors: paid and pending orders, test-mode revenue, units sold and the full inventory grid with sold-out and low-stock sizes highlighted. Customer emails are never shown.

- **Try the back office** starts a demo session with one click, no password. Demo admins can edit stock (capped at 50 per size) through Server Actions that re-check the signed, http-only session cookie.
- **Nightly reset.** A Vercel cron job restores every size to its seeded stock *minus what paid orders have sold*, so visitors' experiments disappear overnight while real (test-mode) sales stay reflected. It's one `UPDATE … FROM (VALUES …)` statement joined to the paid order lines.
- The owner signs in separately with `ADMIN_PASSWORD`, without the demo cap.

## Engineering notes

- **Faceted search with shareable URLs.** All filter state (category, size, colour, fibre, price, stock, sort) lives in the URL. Each facet is counted with every filter applied *except its own*, so options don't vanish while you choose. See `src/lib/catalogue-query.ts`.
- **The server never trusts the bag.** Checkout re-prices every line from the catalogue and re-checks stock (`src/lib/checkout.ts`). If stock changed while an item sat in the bag, the API returns what is available and the bag corrects itself.
- **Race-safe stock.** The webhook decrements stock with `UPDATE … WHERE stock >= quantity` and ignores duplicate deliveries, so two buyers can't oversell the last item.
- **Browsing survives a database blip.** If Neon is cold or unreachable, catalogue pages fall back to the bundled data and log the error. Checkout reads live stock separately and returns 503 rather than trusting the fallback.
- **Small catalogue, deliberate trade-off.** ~30 products load in one relational query and are filtered in memory. At a few thousand SKUs, filtering would move into SQL with indexes on category, fibre and colour.
- **Cart without hydration mismatches.** The bag is a tiny external store over `localStorage` read through `useSyncExternalStore`, synced across tabs.

## Data model

`products` → `colorways`, `variants` (SKU × colourway × size, with stock) and one `passports` row → `passport_fibres`, `supply_stages`. `orders` store priced lines as JSON. Schema: `src/lib/db/schema.ts`.

## Project structure

```
src/
  app/                  routes: shop, product/[slug], passport, bag, stores, admin, api/*
  components/           FlatSketch (SVG flats), FabricViewer (3D), FitFinder, Filters, cart
  data/                 seed catalogue, garment size specs, stores and journal
  lib/
    catalogue-query.ts  filtering, facets, sorting, URL (de)serialisation
    fit.ts              fit-finder algorithm
    checkout.ts         server-side bag validation
    repository.ts       data access with DB fallback
    db/schema.ts        Drizzle schema
e2e/                    Playwright tests
scripts/                seed and screenshot scripts
```

## Trade-offs and known limitations

Deliberate choices for a demo, and what a production store would do instead:

- **No stock reservation during checkout.** Stock is checked when the Stripe session is created and decremented when payment succeeds. If the last item sells to someone else in between, the conditional update leaves stock untouched but the order is still marked paid. A real store would reserve stock for the session's lifetime or refund automatically when the decrement affects no rows.
- **In-memory filtering.** Fine for ~30 products; at scale, filters and facet counts move to SQL (or a search index) with indexes on category, fibre and colour.
- **Demo-grade admin auth.** One owner password and an HMAC-signed cookie, no user accounts or roles beyond owner/demo. Production would use a proper identity provider.
- **Illustrative passport data.** Supply chains and footprints are modelled realistically but invented; real passports would come from suppliers via a standard such as GS1 Digital Link.
- **Cart in `localStorage`.** No server-side carts or customer accounts, so a bag doesn't follow you between devices.

## Run locally

```bash
npm install
npm run dev
```

The store works without any configuration. To use a real database and payments, copy `.env.example` to `.env.local` and add:

```bash
DATABASE_URL=...            # Neon connection string
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
ADMIN_PASSWORD=...          # optional, owner sign-in for /admin
ADMIN_SESSION_SECRET=...    # optional, signs admin cookies (falls back to other server secrets)
CRON_SECRET=...             # optional, restricts the nightly reset to Vercel's signed cron call
```

then create and fill the tables:

```bash
npm run db:push
npm run db:seed
```

## Tests

```bash
npm test           # unit tests (Vitest)
npm run test:e2e   # end-to-end tests (Playwright)
```

**22 unit tests** cover catalogue querying and faceting, the fit-finder algorithm and server-side checkout validation.

**15 end-to-end tests** build the app and drive it in Chromium: URL-driven filters and shareable views, search, the fit finder selecting a size, the bag (add, change quantity, survive a reload, remove), the 3D fabric view loading on demand, checkout API validation, the webhook rejecting unsigned calls, passports, store search, the admin and its demo session, and the mobile menu. They run with database and Stripe keys blanked, so they never touch real services and always see the same catalogue.

---

Auro is a fictional brand. Footprint figures are illustrative estimates, not audited data. Editorial photography from the original Auro project; black coat and red suit editorials by Malicki M Beser and Marjan Taghipour on Unsplash.
