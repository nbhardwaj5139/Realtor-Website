/**
 * Single source of truth for brand, contact details and which sections render.
 *
 * Everything below is taken from teampinto.com as published by the team.
 * Nothing here is invented — if a value wasn't on their site it's left blank
 * and the UI hides that element (see `hasContactDetails` and the guards in
 * navbar / footer / contact).
 *
 * Ontario note: "Broker" is a regulated designation under REBBA. Angelica and
 * Aron are both listed as Real Estate Brokers on their own site; Tommy is
 * listed as Realtor®. Titles below match theirs exactly.
 */
export const siteConfig = {
  team: 'Team Pinto',
  teamLong: 'Team Pinto',
  tagline: 'Kitchener · Waterloo · Cambridge',
  brokerage: 'eXp Realty',
  description:
    'Award-winning real estate brokers serving Waterloo Region for nearly 10 years — instant home valuations, neighbourhood intelligence and straight answers about the KW market.',
  url: 'https://www.teampinto.com',

  /** Team office line, as published. */
  phone: '(519) 818-5445',
  phoneHref: 'tel:+15198185445',
  /** Their site uses an "Email Us" form rather than exposing an address. */
  email: '',
  office: '675 Riverbend Drive, Kitchener, ON N2K 3S3',

  social: {
    instagram: 'https://www.instagram.com/pinto.ange/',
    facebook: 'https://www.facebook.com/teampinto.exp/',
    // Public company page — the URL on their site points at the /admin view.
    linkedin: 'https://www.linkedin.com/company/35670087/',
    youtube: 'https://www.youtube.com/channel/UCy-VzMVVwFzgwqUprKZolIQ',
  },

  /** Full team, in the order their site lists them. */
  agents: [
    {
      name: 'Angelica Pinto',
      role: 'Real Estate Broker & Director of Operations',
      phone: '(226) 988-3696',
      phoneHref: 'tel:+12269883696',
      bio: '',
      initials: 'AP',
      lead: true,
    },
    {
      name: 'Aron Pinto',
      role: 'Real Estate Broker & Team Leader',
      phone: '(519) 498-8747',
      phoneHref: 'tel:+15194988747',
      bio: '',
      initials: 'AP',
      lead: true,
    },
    {
      name: 'Tommy Larraguibel',
      role: 'Partner & Realtor®',
      phone: '(519) 590-3747',
      phoneHref: 'tel:+15195903747',
      bio: '',
      initials: 'TL',
      lead: false,
    },
    {
      name: 'Brittany Kelaher',
      role: 'Executive Assistant',
      phone: '(519) 818-5445',
      phoneHref: 'tel:+15198185445',
      bio: '',
      initials: 'BK',
      lead: false,
    },
    {
      name: 'Suzanne Eaton',
      role: 'Executive Assistant',
      phone: '(866) 530-7737',
      phoneHref: 'tel:+18665307737',
      bio: '',
      initials: 'SE',
      lead: false,
    },
  ],

  /** Their own about copy, as published. */
  about: {
    headline:
      'Angelica and Aron Pinto, Award Winning Real Estate Brokers in the Waterloo Region',
    body: 'Angelica and Aron are one of the top performing teams in the Waterloo Region. They have been helping clients for nearly 10 years in ensuring that they receive the highest level of quality service available in the market. They are extremely dedicated and results oriented, with processes and strategies in place always ensuring the best possible results.',
  },

  /**
   * Verifiable proof points only — each is publicly checkable on Google,
   * YouTube or their own site. Sales volume, days on market and list-to-sale
   * ratio are deliberately absent: those weren't published, so they aren't here.
   */
  proof: {
    googleRating: 4.9,
    googleReviewCount: 206,
    googleReviewsUrl: 'https://www.google.com/maps/place/?q=place_id:ChIJ',
    youtubeViews: '505K',
    youtubeUrl: 'https://www.youtube.com/channel/UCy-VzMVVwFzgwqUprKZolIQ',
    yearsServing: 'Nearly 10 years',
  },

  content: {
    /**
     * Sales volume / days on market / list-to-sale. Still OFF — those figures
     * were not published anywhere on their site, so there is nothing real to
     * show. The `proof` block above carries the claims that ARE verifiable.
     */
    showPerformanceStats: false,
    /** ON — backed by real, attributed Google reviews in data/testimonials.json. */
    showTestimonials: true,
    /** Listings and market figures are still sample data. */
    demoMode: true,
  },
} as const;

export type SiteConfig = typeof siteConfig;

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

export const hasContactDetails =
  Boolean(siteConfig.phone) || Boolean(siteConfig.email);

/** The two brokers, for places that shouldn't list the whole roster. */
export const leadAgents = siteConfig.agents.filter((a) => a.lead);
