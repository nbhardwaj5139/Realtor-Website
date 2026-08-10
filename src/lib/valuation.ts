import { getNeighbourhood, RENOVATIONS } from './data';
import type { PropertyType } from './types';

/**
 * Demo automated valuation model.
 *
 * This is a transparent, deterministic estimator built on the mock
 * neighbourhood dataset — NOT an appraisal and not connected to MLS. It exists
 * to give a visitor an instant, defensible-looking range and to open the
 * conversation. Swap `estimateValue` for a real AVM/MLS feed when one is
 * available; the shape of the result is what the UI depends on.
 */

const TYPE_MULTIPLIER: Record<PropertyType, number> = {
  'Single Family': 1,
  'Semi-Detached': 0.78,
  Townhouse: 0.71,
  Condo: 0.58,
};

/** Typical square footage by property type, used when sqft is unknown. */
const TYPICAL_SQFT: Record<PropertyType, number> = {
  'Single Family': 2100,
  'Semi-Detached': 1650,
  Townhouse: 1500,
  Condo: 950,
};

export type ValuationInput = {
  neighbourhoodId: string;
  propertyType: PropertyType;
  beds: number;
  baths: number;
  sqft?: number;
  renovations: string[];
};

export type ValuationResult = {
  low: number;
  mid: number;
  high: number;
  confidence: 'low' | 'medium' | 'high';
  neighbourhoodName: string;
  pricePerSqft: number;
  /** Human-readable factors that moved the number, for the results screen. */
  drivers: { label: string; impact: number }[];
  comparables: {
    address: string;
    soldPrice: number;
    beds: number;
    baths: number;
    sqft: number;
    daysOnMarket: number;
  }[];
  marketNote: string;
};

function roundTo(value: number, nearest: number) {
  return Math.round(value / nearest) * nearest;
}

export function estimateValue(input: ValuationInput): ValuationResult {
  const hood = getNeighbourhood(input.neighbourhoodId);
  const base = hood?.medianPrice ?? 812_400;
  const pricePerSqft = hood?.pricePerSqft ?? 415;

  const typeMultiplier = TYPE_MULTIPLIER[input.propertyType] ?? 1;
  const sqft = input.sqft && input.sqft > 250 ? input.sqft : TYPICAL_SQFT[input.propertyType];

  const drivers: { label: string; impact: number }[] = [];

  // Start from the neighbourhood median adjusted for property type.
  let value = base * typeMultiplier;

  // Blend in a per-square-foot view so unusually large/small homes track size.
  const sqftView = sqft * pricePerSqft;
  value = value * 0.55 + sqftView * 0.45;

  // Bedroom / bathroom adjustments relative to a 3-bed, 2-bath baseline.
  const bedDelta = (input.beds - 3) * 0.035;
  const bathDelta = (input.baths - 2) * 0.028;
  if (bedDelta !== 0) drivers.push({ label: `${input.beds} bedrooms`, impact: bedDelta });
  if (bathDelta !== 0) drivers.push({ label: `${input.baths} bathrooms`, impact: bathDelta });
  value *= 1 + bedDelta + bathDelta;

  // Renovation lifts.
  let renoLift = 0;
  for (const id of input.renovations) {
    const reno = RENOVATIONS.find((r) => r.id === id);
    if (!reno) continue;
    renoLift += reno.lift;
    drivers.push({ label: reno.label, impact: reno.lift });
  }
  value *= 1 + renoLift;

  // Momentum from the neighbourhood's YoY appreciation, damped.
  const momentum = ((hood?.yoyAppreciation ?? 4) / 100) * 0.35;
  drivers.push({
    label: `${hood?.name ?? 'Regional'} momentum (${hood?.yoyAppreciation ?? 4}% YoY)`,
    impact: momentum,
  });
  value *= 1 + momentum;

  // Tighter range where the market moves fast (low DOM = confident pricing).
  const dom = hood?.avgDaysOnMarket ?? 24;
  const spread = dom <= 14 ? 0.035 : dom <= 22 ? 0.05 : 0.065;
  const confidence: ValuationResult['confidence'] =
    dom <= 14 ? 'high' : dom <= 22 ? 'medium' : 'low';

  const mid = roundTo(value, 1000);
  const low = roundTo(value * (1 - spread), 1000);
  const high = roundTo(value * (1 + spread), 1000);

  return {
    low,
    mid,
    high,
    confidence,
    neighbourhoodName: hood?.name ?? 'Waterloo Region',
    pricePerSqft: Math.round(mid / sqft),
    drivers: drivers.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact)).slice(0, 5),
    comparables: buildComparables(mid, input, hood?.avgDaysOnMarket ?? 18, hood?.name ?? 'KW'),
    marketNote: hood
      ? `${hood.name} homes are selling in an average of ${hood.avgDaysOnMarket} days at ${hood.listToSaleRatio}% of list price, with ${hood.salesLastQuarter} sales last quarter.`
      : 'Waterloo Region homes are averaging 24 days on market at 99.1% of list price.',
  };
}

/**
 * Synthesises plausible recent comps around the estimate. Replace with real
 * MLS sold data when a feed is connected.
 */
function buildComparables(
  mid: number,
  input: ValuationInput,
  dom: number,
  hoodName: string,
): ValuationResult['comparables'] {
  const streets = ['Maple Grove', 'Chestnut Ridge', 'Glen Forrest', 'Bridle Path', 'Old Post'];
  const offsets = [-0.042, 0.018, -0.011, 0.036];
  const sqft = input.sqft && input.sqft > 250 ? input.sqft : TYPICAL_SQFT[input.propertyType];

  return offsets.map((offset, i) => ({
    address: `${120 + i * 37} ${streets[i % streets.length]} ${i % 2 === 0 ? 'Drive' : 'Crescent'}, ${hoodName}`,
    soldPrice: roundTo(mid * (1 + offset), 500),
    beds: Math.max(1, input.beds + (i % 3 === 0 ? -1 : 0)),
    baths: Math.max(1, input.baths + (i % 4 === 0 ? 1 : 0)),
    sqft: Math.round(sqft * (1 + offset * 0.8)),
    daysOnMarket: Math.max(2, Math.round(dom + (i % 2 === 0 ? -4 : 6))),
  }));
}
