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

### Public site (`/`)

| Section | What it does |
|---|---|
| **Hero + valuation wizard** | Four-step lead magnet — address & neighbourhood → property type → beds/baths/upgrades → contact gate. The estimate is visible-but-blurred behind the gate, then reveals a range, the factors that moved it, comparable sales and a market note. |
| **Neighbourhood explorer** | Twelve KW neighbourhoods filtered by buyer persona (tech, families, Toronto commuters, ION transit, first-time, luxury). Each opens a modal with commute times to Google KW / the R&D Park / the nearest ION stop / the GO station / the 401, school ratings by board, a five-year median chart and an embedded map. |
| **Featured listings** | Filter by status, property type and price band. Video-tour modal, and a "Schedule a private tour" booking modal. |
| **Selling with us** | Interactive five-step listing process timeline, plus a draggable before/after staging slider. |
| **Calculators** | Mortgage payment (Canadian semi-annual compounding, CMHC premiums, accelerated bi-weekly) and Ontario land transfer tax with the first-time buyer rebate — including what the same purchase would cost in Toronto. |
| **Market snapshot** | Regional Waterloo Region figures. Team track record and testimonials are built but switched **off** by default — see Content flags. |
| **Contact** | Direct enquiry form wired to the same lead pipeline. |

### Admin dashboard (`/admin`)

- **Lead inbox** — every valuation, tour request and enquiry in one table, with
  status workflow (new → contacted → nurturing → won → archived), full request
  detail, and a one-click **Send instant CMA** email.
- **Listing kit generator** — enter a listing once and get an MLS description,
  an Instagram caption with KW hashtags, an email blast, and a print-ready open
  house flyer (previewed inline, downloadable as HTML → print to PDF).

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

## Branding & what still needs filling in

All branding lives in `src/config/site.ts`. The team name and agent names are
set; **the fields below are deliberately blank** and the UI hides each element
until a real value is supplied — nothing is invented:

| Field | Notes |
|---|---|
| `brokerage` | Required in Ontario real estate advertising. |
| `phone` / `phoneHref` | Nav, footer and contact block hide the row while blank. |
| `email`, `office` | Same. Team lead alerts are skipped until an inbox exists. |
| `agents[].role` | **"Broker", "Broker of Record" and "Salesperson" are regulated designations under REBBA** — use each agent's actual registration title, don't guess. |
| `agents[].bio` | Hidden while blank. |
| `social.*` | Icons render only for URLs that are set. |

Colours and type are in `tailwind.config.ts` and `src/app/globals.css`.

### Content flags

`siteConfig.content` controls what renders:

| Flag | Default | Effect |
|---|---|---|
| `showPerformanceStats` | `false` | Team track record (sales volume, days on market, list-to-sale). **Off because publishing a record that wasn't supplied would be fabricating claims under a real agent's name.** Turn on only with real, verifiable figures. |
| `showTestimonials` | `false` | Client testimonial carousel. Off for the same reason; also drops the Reviews nav link. |
| `demoMode` | `true` | Shows a dismissible "demo build · sample data" badge, labels sample listings, and adds a sample-data line to the footer disclaimer. |

---

## About the data

**Everything in `src/data/` is sample data.** Listings, addresses, sale prices,
neighbourhood medians and regional statistics are placeholders for layout — they
are not real properties or transactions. The neighbourhood geography, commute
structure and school boards reflect real Waterloo Region, but the numbers are
illustrative.

Before this is anything other than a demo:

1. **Listings and market stats** — swap the JSON files for an MLS/DDF or CREA feed.
2. **The valuation model** — `src/lib/valuation.ts` is a transparent,
   deterministic estimator over the sample dataset, **not an AVM and not an
   appraisal**. It exists to give a visitor a defensible-looking range and start
   a conversation. Point `estimateValue()` at a real AVM when you have one; the
   UI depends only on the shape of the result.
3. **Turn off `demoMode`** once 1 and 2 are done.

The Ontario land transfer tax brackets, first-time buyer rebate, CMHC premium
tiers and minimum down payment rules in `src/lib/ontario-tax.ts` and
`src/lib/mortgage.ts` are real and current as of the 2025 tax year — but they do
change. Verify against ontario.ca before relying on them.

---

## Compliance notes

The public site describes properties rather than buyers, and the Claude prompt
in `src/lib/listing-kit.ts` is instructed against Ontario Human Rights Code
violations and guaranteed-return claims. That is a guardrail, not a substitute
for review — have the brokerage approve copy before it goes on MLS, and confirm
RECO/CREA advertising requirements (brokerage name, registrant titles) are met
in `src/config/site.ts`.

---

## Scripts

```bash
npm run dev        # development server
npm run build      # production build
npm run start      # serve the production build
npm run typecheck  # tsc --noEmit
```
