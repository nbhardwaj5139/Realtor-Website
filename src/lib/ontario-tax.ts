/**
 * Ontario Land Transfer Tax (LTT) calculations.
 *
 * Provincial marginal brackets (single/two family residential):
 *   0.5%  on the first            $55,000
 *   1.0%  on  $55,000 – $250,000
 *   1.5%  on $250,000 – $400,000
 *   2.0%  on $400,000 – $2,000,000
 *   2.5%  above $2,000,000        (residential w/ 1–2 single family residences)
 *
 * First-time home buyer refund: up to $4,000 provincially (fully offsets the LTT
 * on a purchase up to $368,333).
 *
 * Waterloo Region (Kitchener / Waterloo / Cambridge) has NO municipal land
 * transfer tax — only Toronto levies one. The Toronto figures here exist purely
 * to power the "what you save by buying in KW" comparison and are simplified to
 * the residential MLTT brackets.
 *
 * Rates current as of the 2025 tax year. Verify against ontario.ca before
 * relying on these numbers for a real transaction.
 */

export type Bracket = { upTo: number; rate: number };

export const ONTARIO_BRACKETS: Bracket[] = [
  { upTo: 55_000, rate: 0.005 },
  { upTo: 250_000, rate: 0.01 },
  { upTo: 400_000, rate: 0.015 },
  { upTo: 2_000_000, rate: 0.02 },
  { upTo: Infinity, rate: 0.025 },
];

/** Toronto Municipal LTT — residential, including the 2024 luxury tiers. */
export const TORONTO_BRACKETS: Bracket[] = [
  { upTo: 55_000, rate: 0.005 },
  { upTo: 250_000, rate: 0.01 },
  { upTo: 400_000, rate: 0.015 },
  { upTo: 2_000_000, rate: 0.02 },
  { upTo: 3_000_000, rate: 0.025 },
  { upTo: 4_000_000, rate: 0.035 },
  { upTo: 5_000_000, rate: 0.045 },
  { upTo: 10_000_000, rate: 0.055 },
  { upTo: 20_000_000, rate: 0.065 },
  { upTo: Infinity, rate: 0.075 },
];

export const PROVINCIAL_FTB_MAX_REFUND = 4_000;
export const TORONTO_FTB_MAX_REFUND = 4_475;

function applyBrackets(price: number, brackets: Bracket[]) {
  if (price <= 0) return 0;
  let tax = 0;
  let lower = 0;
  for (const { upTo, rate } of brackets) {
    if (price <= lower) break;
    const taxableInBand = Math.min(price, upTo) - lower;
    tax += taxableInBand * rate;
    lower = upTo;
  }
  return tax;
}

export type LttInput = {
  price: number;
  firstTimeBuyer: boolean;
  /** Include Toronto's municipal LTT — used for the KW-vs-Toronto comparison. */
  includeToronto?: boolean;
};

export type LttResult = {
  provincialTax: number;
  municipalTax: number;
  provincialRebate: number;
  municipalRebate: number;
  totalBeforeRebate: number;
  totalRebate: number;
  total: number;
  /** What the same purchase would cost in Toronto (net of rebates). */
  torontoComparisonTotal: number;
  savingsVsToronto: number;
};

export function calculateLandTransferTax({
  price,
  firstTimeBuyer,
  includeToronto = false,
}: LttInput): LttResult {
  const provincialTax = applyBrackets(price, ONTARIO_BRACKETS);
  const municipalTax = includeToronto ? applyBrackets(price, TORONTO_BRACKETS) : 0;

  const provincialRebate = firstTimeBuyer
    ? Math.min(provincialTax, PROVINCIAL_FTB_MAX_REFUND)
    : 0;
  const municipalRebate =
    firstTimeBuyer && includeToronto ? Math.min(municipalTax, TORONTO_FTB_MAX_REFUND) : 0;

  const totalBeforeRebate = provincialTax + municipalTax;
  const totalRebate = provincialRebate + municipalRebate;

  // Always compute the Toronto scenario so the comparison card can render.
  const torontoMunicipal = applyBrackets(price, TORONTO_BRACKETS);
  const torontoMunicipalRebate = firstTimeBuyer
    ? Math.min(torontoMunicipal, TORONTO_FTB_MAX_REFUND)
    : 0;
  const torontoComparisonTotal =
    provincialTax + torontoMunicipal - provincialRebate - torontoMunicipalRebate;

  const total = Math.max(0, totalBeforeRebate - totalRebate);

  return {
    provincialTax,
    municipalTax,
    provincialRebate,
    municipalRebate,
    totalBeforeRebate,
    totalRebate,
    total,
    torontoComparisonTotal,
    savingsVsToronto: Math.max(0, torontoComparisonTotal - total),
  };
}

/**
 * Minimum down payment under Canadian federal rules (effective Dec 15, 2024):
 *   5%  on the first $500,000
 *   10% on the portion from $500,000 to $1,500,000
 *   20% on any purchase above $1,500,000 (no insured mortgage available)
 */
export function minimumDownPayment(price: number) {
  if (price <= 0) return 0;
  if (price > 1_500_000) return price * 0.2;
  if (price <= 500_000) return price * 0.05;
  return 25_000 + (price - 500_000) * 0.1;
}
