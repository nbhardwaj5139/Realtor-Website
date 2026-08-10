/**
 * Single source of truth for brand + contact details.
 * Swap these values to re-brand the entire site — nothing else needs to change.
 *
 * NOTE: the names, licence numbers and stats below are DEMO placeholders.
 */
export const siteConfig = {
  team: 'Maple & Grand',
  teamLong: 'Maple & Grand Real Estate',
  tagline: 'Kitchener · Waterloo · Cambridge',
  brokerage: 'Demo Realty Brokerage, Independently Owned & Operated',
  description:
    'A modern real estate duo serving Kitchener, Waterloo and Cambridge — instant home valuations, neighbourhood intelligence and a listing process built for the KW market.',
  url: 'https://example.com',
  phone: '(519) 555-0142',
  phoneHref: 'tel:+15195550142',
  email: 'hello@example.com',
  office: '1 King Street West, Kitchener, ON N2G 1A1',
  social: {
    instagram: 'https://instagram.com',
    facebook: 'https://facebook.com',
    linkedin: 'https://linkedin.com',
    youtube: 'https://youtube.com',
  },
  agents: [
    {
      name: 'Elena Marchetti',
      role: 'Broker · Listing Strategy',
      bio: 'Fifteen years pricing homes across Waterloo Region, with a specialty in move-up sellers in Westmount, Beechwood and Laurelwood.',
      initials: 'EM',
    },
    {
      name: 'Devon Clarke',
      role: 'Sales Representative · Buyer Advisory',
      bio: 'Works with the Toronto-to-KW commuter and tech relocation crowd — GO line timing, ION corridor value and new-build negotiation.',
      initials: 'DC',
    },
  ],
  nav: [
    { label: 'Home Value', href: '/#valuation' },
    { label: 'Neighbourhoods', href: '/#neighbourhoods' },
    { label: 'Listings', href: '/#listings' },
    { label: 'Selling', href: '/#selling' },
    { label: 'Calculators', href: '/#calculator' },
    { label: 'Reviews', href: '/#reviews' },
  ],
} as const;

export type SiteConfig = typeof siteConfig;
