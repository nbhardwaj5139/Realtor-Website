export type Persona =
  | 'tech'
  | 'families'
  | 'commuters'
  | 'transit'
  | 'investors'
  | 'first-time'
  | 'downsizers'
  | 'luxury'
  | 'move-up'
  | 'value';

export type School = {
  name: string;
  board: 'WRDSB' | 'WCDSB' | string;
  rating: number;
};

export type Commute = {
  googleKw: number;
  rdPark: number;
  ionStop: { name: string; minutes: number };
  goStation: number;
  highway401: number;
  torontoUnionGo: number;
};

export type Neighbourhood = {
  id: string;
  name: string;
  city: string;
  tagline: string;
  description: string;
  personas: Persona[];
  medianPrice: number;
  pricePerSqft: number;
  yoyAppreciation: number;
  avgDaysOnMarket: number;
  listToSaleRatio: number;
  salesLastQuarter: number;
  walkScore: number;
  commute: Commute;
  schools: School[];
  amenities: string[];
  priceHistory: { year: number; median: number }[];
  image: string;
  coords: { lat: number; lng: number };
};

export type ListingStatus = 'active' | 'pending' | 'sold-above';

export type PropertyType =
  | 'Single Family'
  | 'Semi-Detached'
  | 'Townhouse'
  | 'Condo';

export type Listing = {
  id: string;
  mlsId: string;
  status: ListingStatus;
  address: string;
  neighbourhoodId: string;
  city: string;
  postalCode: string;
  price: number;
  soldPrice?: number;
  listPrice: number;
  daysOnMarket: number;
  beds: number;
  baths: number;
  sqft: number;
  lotSize: string;
  yearBuilt: number;
  propertyType: PropertyType;
  parking: number;
  taxesAnnual: number;
  condoFeeMonthly: number;
  headline: string;
  description: string;
  features: string[];
  image: string;
  gallery: string[];
  videoTourUrl: string;
  featured: boolean;
};

/**
 * A published client review.
 *
 * Shape mirrors what a real review platform gives you — author, text, rating,
 * recency, source. There is deliberately no "result" field: outcomes like
 * "sold $50k over asking" are claims that must come from the team's own
 * records, not be attached to a review that doesn't state them.
 */
export type Testimonial = {
  id: string;
  name: string;
  quote: string;
  source: string;
  when: string;
  rating: number;
  initials: string;
};

export type ProcessStep = {
  step: number;
  title: string;
  duration: string;
  summary: string;
  details: string[];
  deliverable: string;
};

export type MarketStats = {
  updated: string;
  headline: {
    id: string;
    label: string;
    value: number;
    format: 'currency-compact' | 'number' | 'percent';
    suffix?: string;
    caption: string;
    benchmark?: number;
    benchmarkLabel?: string;
  }[];
  region: {
    medianPrice: number;
    medianPriceYoY: number;
    avgDaysOnMarket: number;
    activeListings: number;
    monthsOfInventory: number;
    salesYoY: number;
    listToSaleRatio: number;
  };
  monthly: { month: string; median: number; sales: number; dom: number }[];
  process: ProcessStep[];
  stagingSlider: { before: string; after: string; caption: string };
};

/* ------------------------------ Leads ------------------------------ */

export type LeadType = 'valuation' | 'tour' | 'inquiry' | 'contact';

export type LeadStatus = 'new' | 'contacted' | 'nurturing' | 'won' | 'archived';

export type Lead = {
  id: string;
  type: LeadType;
  status: LeadStatus;
  createdAt: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  /** Listing or neighbourhood the lead came from */
  source?: string;
  /** Valuation payload — present on `valuation` leads */
  valuation?: {
    address: string;
    neighbourhoodId: string;
    neighbourhoodName: string;
    propertyType: PropertyType;
    beds: number;
    baths: number;
    sqft: number;
    renovations: string[];
    estimateLow: number;
    estimateHigh: number;
    estimateMid: number;
    timeline: string;
  };
  /** Tour payload — present on `tour` leads */
  tour?: {
    listingId: string;
    listingAddress: string;
    preferredDate: string;
    preferredTime: string;
    tourType: 'in-person' | 'virtual';
  };
  notes?: string[];
};
