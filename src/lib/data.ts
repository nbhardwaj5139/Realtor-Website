import neighbourhoodsJson from '@/data/neighbourhoods.json';
import listingsJson from '@/data/listings.json';
import testimonialsJson from '@/data/testimonials.json';
import marketStatsJson from '@/data/market-stats.json';
import type {
  Listing,
  MarketStats,
  Neighbourhood,
  Persona,
  Testimonial,
} from './types';

export const neighbourhoods = neighbourhoodsJson as Neighbourhood[];
export const listings = listingsJson as Listing[];
export const testimonials = testimonialsJson as Testimonial[];
export const marketStats = marketStatsJson as MarketStats;

export function getNeighbourhood(id: string) {
  return neighbourhoods.find((n) => n.id === id);
}

export function getListing(id: string) {
  return listings.find((l) => l.id === id);
}

export const featuredListings = listings.filter((l) => l.featured);

/**
 * Kept in sync with the personas actually present in neighbourhoods.json —
 * a filter with no matches renders an empty state and looks broken.
 */
export const PERSONA_FILTERS: { value: Persona | 'all'; label: string; blurb: string }[] = [
  { value: 'all', label: 'All communities', blurb: 'Every community we cover across the region' },
  { value: 'families', label: 'Families', blurb: 'Top WRDSB & WCDSB catchments, parks, green space' },
  { value: 'commuters', label: 'Toronto commuters', blurb: 'Fast 401 and GO access to Union' },
  { value: 'tech', label: 'Tech & UW', blurb: 'Near Google KW, the R&D Park and campus' },
  { value: 'first-time', label: 'First-time buyers', blurb: 'The most attainable entry points' },
  { value: 'value', label: 'Best value', blurb: 'More house per dollar than the regional median' },
  { value: 'move-up', label: 'Move-up buyers', blurb: 'Space to grow without leaving the region' },
  { value: 'luxury', label: 'Luxury', blurb: 'Estate lots, ravine settings and golf-course addresses' },
];

export const PROPERTY_TYPES = [
  'Single Family',
  'Semi-Detached',
  'Townhouse',
  'Condo',
] as const;

export const RENOVATIONS = [
  { id: 'kitchen', label: 'Renovated kitchen (last 5 yrs)', lift: 0.045 },
  { id: 'bathrooms', label: 'Renovated bathrooms', lift: 0.028 },
  { id: 'basement', label: 'Finished basement', lift: 0.035 },
  { id: 'pool', label: 'Inground pool', lift: 0.022 },
  { id: 'windows', label: 'New windows / roof', lift: 0.018 },
  { id: 'garage', label: 'Double garage', lift: 0.026 },
  { id: 'adu', label: 'Legal secondary suite', lift: 0.062 },
  { id: 'none', label: 'Original / needs updating', lift: -0.055 },
] as const;

export const SELLING_TIMELINES = [
  'ASAP — within 30 days',
  '1–3 months',
  '3–6 months',
  '6–12 months',
  'Just curious about my value',
] as const;
