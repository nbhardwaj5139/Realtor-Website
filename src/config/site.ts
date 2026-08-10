/**
 * Single source of truth for brand, contact details and which sections render.
 *
 * ─────────────────────────────────────────────────────────────────────────
 *  TODO BEFORE SENDING TO A CLIENT — fill in the blanks marked `''` below.
 *  Empty values are intentional: the UI hides the element rather than
 *  showing a placeholder. Nothing here is invented.
 *
 *  In Ontario, "Broker", "Broker of Record" and "Salesperson" are regulated
 *  designations under REBBA. Use each agent's actual registration title —
 *  do not guess. Brokerage name and the registrant's name must appear in
 *  advertising; that's what `brokerage` below is for.
 * ─────────────────────────────────────────────────────────────────────────
 */
export const siteConfig = {
  team: 'Team Pinto',
  teamLong: 'Team Pinto',
  tagline: 'Kitchener · Waterloo · Cambridge',
  brokerage: '', // e.g. "Brokerage Name, Independently Owned & Operated"
  description:
    'Real estate in Kitchener, Waterloo and Cambridge — instant home valuations, neighbourhood intelligence and a listing process built for the KW market.',
  url: 'https://example.com',

  phone: '',
  phoneHref: '',
  email: '',
  office: '',

  social: {
    instagram: 'https://www.instagram.com/aronpinto',
    facebook: '',
    linkedin: '',
    youtube: '',
  },

  agents: [
    { name: 'Aron Pinto', role: '', bio: '', initials: 'AP' },
    { name: 'Angelica Pinto', role: '', bio: '', initials: 'AP' },
  ],

  /**
   * Content flags.
   *
   * Performance stats and testimonials are OFF because publishing a track
   * record or client quotes that weren't supplied would be fabricating
   * claims under a real agent's name. Turn each on only once real,
   * verifiable figures replace the sample data.
   */
  content: {
    /** Team track record: sales volume, days on market, list-to-sale ratio. */
    showPerformanceStats: false,
    /** Client testimonial carousel. */
    showTestimonials: false,
    /** Shows a "demo build · sample data" badge and labels sample listings. */
    demoMode: true,
  },
} as const;

export type SiteConfig = typeof siteConfig;

/** Nav entries, minus anything its content flag has switched off. */
export const siteNav = [
  { label: 'Home Value', href: '/#valuation' },
  { label: 'Neighbourhoods', href: '/#neighbourhoods' },
  { label: 'Listings', href: '/#listings' },
  { label: 'Selling', href: '/#selling' },
  { label: 'Calculators', href: '/#calculator' },
  ...(siteConfig.content.showTestimonials
    ? [{ label: 'Reviews', href: '/#reviews' }]
    : []),
  { label: 'Contact', href: '/#contact' },
];

/** True when there is at least one real contact method to render. */
export const hasContactDetails =
  Boolean(siteConfig.phone) || Boolean(siteConfig.email);
