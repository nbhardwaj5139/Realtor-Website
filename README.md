# KW Modern Real Estate Platform

A production-shaped real estate platform for a two-agent team in the
Kitchener–Waterloo region of Ontario. Built to replace a static realtor site
with something that delivers value on the first visit, captures high-intent
leads, and automates the marketing busywork behind a listing.

```bash
npm install
npm run dev     # http://localhost:3000  ·  dashboard at /admin
```

**It runs with zero configuration.** No API keys, no database, no `.env` — leads
save to a local JSON file, emails are logged instead of sent, and the listing
copy generator uses built-in templates. Add keys when you want the real thing.

---

## What's here

Three design directions on the same engine, so they can be compared live.
All share `src/lib`, `src/data`, `src/config/site.ts` and the lead pipeline.

| Route | Direction | Best for |
|---|---|---|
| **`/v3`** | **Editorial** — full-bleed photography, large serif display, price search in the hero. Mirrors the information architecture of the current Sierra site, executed with real art direction. | **The one to send.** Closest to what he has, visibly better. |
| `/v2` | **Move Guide** — light, tool-first. Question-led hero, sortable community comparison table, affordability calculator, closing-cost breakdown. | Pitching the tools rather than the brand. |
| `/` | **Luxury agency** — dark navy and gold, four-step valuation wizard, listing process timeline, staging slider. | A more traditional high-end agency look. |

### Shared tools

- **Home valuation** — four-step wizard (`/`) or single-screen live-updating form (`/v2`, `/v3`). Same model, same API, contact gate only on the comparables.
- **Neighbourhood intelligence** — nine communities with commute times to Google KW, the R&D Park, ION, the GO station and the 401, plus school catchments and price history.
- **Calculators** — mortgage (Canadian semi-annual compounding, CMHC premiums, accelerated bi-weekly), Ontario land transfer tax with the first-time buyer rebate and a Toronto comparison, and affordability against the federal stress test.
- **Reviews** — the team's real Google reviews, credited by name.

### Admin dashboard (`/admin`)

- **Lead inbox** — every valuation, tour request and enquiry in one table, with a
  status workflow and a one-click **Send instant CMA** email.
- **Listing kit generator** — MLS description, Instagram caption with KW
  hashtags, email blast and a print-ready open house flyer. Uses Claude when
  `ANTHROPIC_API_KEY` is set, deterministic templates otherwise.

---

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS · shadcn/ui-style
components on Radix · Framer Motion · React Hook Form + Zod · Lucide icons.

```
src/
  app/            routes, API handlers, /admin
  components/
    ui/           reusable primitives (button, card, dialog, select, …)
    site/         marketing sections
    admin/        dashboard
  config/site.ts  ← all branding and contact details live here
  data/           mock JSON: neighbourhoods, listings, testimonials, stats
  lib/            valuation model, mortgage & Ontario tax math, lead store,
                  auth, notifications, listing-kit generator
```

---

## Configuration

Everything is optional — copy `.env.example` to `.env.local` and fill in what
you need.

| Variable | Effect when set |
|---|---|
| `ADMIN_PASSWORD` | Replaces the demo `/admin` password (`kw-demo-2026`). |
| `ADMIN_SESSION_SECRET` | Signs the admin session cookie. Use a long random string. |
| `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` | Stores leads in Postgres instead of `.data/leads.json`. Schema in `supabase/schema.sql`. |
| `RESEND_API_KEY` *or* `SENDGRID_API_KEY` | Sends the team alert and the visitor auto-responder for real. |
| `NOTIFY_FROM_EMAIL` / `NOTIFY_TO_EMAIL` | Verified sender, and where lead alerts land. |
| `CRM_WEBHOOK_URL` | POSTs each lead to Follow Up Boss / Zapier / Make. |
| `ANTHROPIC_API_KEY` | Listing copy is written by Claude instead of templates. |
| `NEXT_PUBLIC_BOOKING_URL` | Embeds Calendly/Cal.com in the tour modal instead of the built-in form. |

Lead storage degrades gracefully: Supabase if configured → local JSON file →
in-memory (read-only filesystems like Vercel). Email and CRM failures are logged
and never block a visitor from seeing their result.

---

## Branding

Real details from teampinto.com, all in `src/config/site.ts`:

- **Team Pinto**, brokered by **eXp Realty**, 675 Riverbend Drive, Kitchener ON N2K 3S3
- Five team members with their actual titles — Angelica Pinto and Aron Pinto are
  both Real Estate Brokers, Tommy Larraguibel is Partner & Realtor®, plus two
  executive assistants. **Titles are regulated under REBBA — don't edit these
  without checking RECO registration.**
- Office line, per-agent direct lines, and the four real social profiles

**Still blank:** `email`. Their site uses an "Email Us" form rather than
publishing an address, so there was nothing to copy. The UI hides the row and
new-lead alerts are skipped until one is set (`NOTIFY_TO_EMAIL` also works).

### Content flags — `siteConfig.content`

| Flag | Default | Why |
|---|---|---|
| `showTestimonials` | **`true`** | Backed by 9 real, attributed Google reviews in `data/testimonials.json`, quoted as written. |
| `showPerformanceStats` | `false` | Sales volume, days on market and list-to-sale ratio are **not published anywhere by the team**, so there is nothing real to show. `siteConfig.proof` carries the claims that *are* verifiable — 4.9★ from 206 Google reviews, ~10 years, 505K YouTube views. |
| `demoMode` | `true` | Listings and market figures are still sample data. Shows the "sample data" badge and labels listing cards. |

---

## About the data

Split by provenance:

**Real** — team, brokerage, office, agent names/titles/phones, socials, about
copy, the 9 Google reviews, the 4.9/206 rating, and the nine **communities Team
Pinto actually features** (Doon, Huron, Kiwanis, Vista Hills, Laurelwood,
Conservation Meadows, Hidden Valley, Carriage Crossing, Deer Ridge).

**Sample** — every *number* attached to those communities (medians, days on
market, price history, school ratings), all listings, and the regional market
snapshot. Geography and character descriptions are accurate; the figures are
placeholders.

Before this is more than a demo:

1. **Listings and market stats** — swap the JSON for an MLS/DDF or CREA feed.
   Note eXp Realty's IDX/DDF terms govern what can be displayed.
2. **The valuation model** — `src/lib/valuation.ts` is a transparent,
   deterministic estimator over the sample dataset, **not an AVM and not an
   appraisal**. Point `estimateValue()` at a real AVM; the UI only depends on
   the shape of the result.
3. **School ratings** — currently placeholders. Source them or drop the column.
4. **Turn off `demoMode`** once 1–3 are done.

Ontario land transfer tax brackets, the first-time buyer rebate, CMHC premium
tiers and minimum down payment rules in `src/lib/ontario-tax.ts` and
`src/lib/mortgage.ts` are real and current as of the 2025 tax year — verify
against ontario.ca before relying on them.

---

## Compliance notes

The site describes properties rather than buyers, and the Claude prompt in
`src/lib/listing-kit.ts` is instructed against Ontario Human Rights Code
violations and guaranteed-return claims. Guardrails, not a substitute for
review — have eXp approve copy before it goes on MLS, and confirm RECO/CREA
advertising requirements are met (brokerage name and registrant titles are
already wired into the footer and contact block).

Reviews are reproduced from the team's public Google profile, credited by name.
If any reviewer objects, remove their entry from `data/testimonials.json`.

---

## Scripts

```bash
npm run dev        # development server
npm run build      # production build
npm run start      # serve the production build
npm run typecheck  # tsc --noEmit
```
