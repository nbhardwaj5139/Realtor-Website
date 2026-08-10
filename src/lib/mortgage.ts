import { minimumDownPayment } from './ontario-tax';

/**
 * CMHC mortgage default insurance premiums, as a % of the loan amount,
 * by loan-to-value ratio. Applies only to insured (high-ratio) mortgages,
 * i.e. down payments under 20% on homes priced up to $1.5M.
 */
const CMHC_PREMIUMS: { maxLtv: number; premium: number }[] = [
  { maxLtv: 0.8, premium: 0 },
  { maxLtv: 0.85, premium: 0.028 },
  { maxLtv: 0.9, premium: 0.031 },
  { maxLtv: 0.95, premium: 0.04 },
];

export type MortgageInput = {
  price: number;
  downPayment: number;
  /** Annual nominal rate as a percentage, e.g. 4.79 */
  interestRate: number;
  /** Amortization in years */
  amortization: number;
  paymentFrequency: PaymentFrequency;
  /** Annual property tax estimate in dollars */
  propertyTaxAnnual?: number;
  /** Monthly condo / maintenance fee */
  condoFeeMonthly?: number;
  /** Monthly heat + home insurance estimate */
  otherMonthly?: number;
};

export type PaymentFrequency = 'monthly' | 'biweekly' | 'accelerated-biweekly';

export const PAYMENT_FREQUENCIES: { value: PaymentFrequency; label: string }[] = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'accelerated-biweekly', label: 'Accelerated bi-weekly' },
];

export type MortgageResult = {
  downPaymentPercent: number;
  meetsMinimumDown: boolean;
  minimumDown: number;
  insurancePremium: number;
  insured: boolean;
  principal: number;
  /** Payment for the selected frequency */
  payment: number;
  paymentLabel: string;
  paymentsPerYear: number;
  monthlyEquivalent: number;
  totalMonthlyCarrying: number;
  totalInterest: number;
  totalPaid: number;
  /** Years saved vs. a plain monthly schedule (accelerated payments only) */
  amortizationYears: number;
};

function cmhcPremiumRate(ltv: number) {
  for (const tier of CMHC_PREMIUMS) {
    if (ltv <= tier.maxLtv) return tier.premium;
  }
  return 0;
}

/**
 * Canadian mortgages are compounded semi-annually, not monthly. Convert the
 * nominal annual rate into the effective periodic rate for `periodsPerYear`.
 */
function periodicRate(annualRatePercent: number, periodsPerYear: number) {
  const semiAnnual = annualRatePercent / 100 / 2;
  return Math.pow(1 + semiAnnual, 2 / periodsPerYear) - 1;
}

function amortizedPayment(principal: number, rate: number, periods: number) {
  if (principal <= 0) return 0;
  if (rate === 0) return principal / periods;
  return (principal * rate) / (1 - Math.pow(1 + rate, -periods));
}

/** Walk the amortization schedule to find total interest for a given payment. */
function scheduleTotals(principal: number, rate: number, payment: number) {
  let balance = principal;
  let totalInterest = 0;
  let periods = 0;
  const maxPeriods = 100 * 52; // hard stop so a too-small payment can't loop forever

  while (balance > 0.01 && periods < maxPeriods) {
    const interest = balance * rate;
    const principalPortion = payment - interest;
    if (principalPortion <= 0) return { totalInterest: Infinity, periods: Infinity };
    balance -= principalPortion;
    totalInterest += interest;
    periods += 1;
  }
  // Refund the final overshoot
  if (balance < 0) totalInterest += balance;
  return { totalInterest, periods };
}

export function calculateMortgage({
  price,
  downPayment,
  interestRate,
  amortization,
  paymentFrequency,
  propertyTaxAnnual = 0,
  condoFeeMonthly = 0,
  otherMonthly = 0,
}: MortgageInput): MortgageResult {
  const safePrice = Math.max(0, price);
  const safeDown = Math.min(Math.max(0, downPayment), safePrice);
  const downPaymentPercent = safePrice > 0 ? (safeDown / safePrice) * 100 : 0;
  const minimumDown = minimumDownPayment(safePrice);
  const meetsMinimumDown = safeDown >= Math.floor(minimumDown);

  const baseLoan = safePrice - safeDown;
  const ltv = safePrice > 0 ? baseLoan / safePrice : 0;

  // Insurance is unavailable above $1.5M or on 25+ year amortizations at <20% down.
  const insurable = ltv > 0.8 && safePrice <= 1_500_000;
  const insurancePremium = insurable ? baseLoan * cmhcPremiumRate(ltv) : 0;
  const principal = baseLoan + insurancePremium;

  const periodsPerYear =
    paymentFrequency === 'monthly' ? 12 : paymentFrequency === 'biweekly' ? 26 : 26;

  let payment: number;
  if (paymentFrequency === 'accelerated-biweekly') {
    // Accelerated bi-weekly = the monthly payment cut in half, paid 26x/year.
    const monthlyRate = periodicRate(interestRate, 12);
    const monthly = amortizedPayment(principal, monthlyRate, amortization * 12);
    payment = monthly / 2;
  } else {
    const rate = periodicRate(interestRate, periodsPerYear);
    payment = amortizedPayment(principal, rate, amortization * periodsPerYear);
  }

  const rate = periodicRate(interestRate, periodsPerYear);
  const { totalInterest, periods } = scheduleTotals(principal, rate, payment);

  const monthlyEquivalent = (payment * periodsPerYear) / 12;
  const totalMonthlyCarrying =
    monthlyEquivalent + propertyTaxAnnual / 12 + condoFeeMonthly + otherMonthly;

  return {
    downPaymentPercent,
    meetsMinimumDown,
    minimumDown,
    insurancePremium,
    insured: insurancePremium > 0,
    principal,
    payment,
    paymentLabel:
      PAYMENT_FREQUENCIES.find((f) => f.value === paymentFrequency)?.label ?? 'Monthly',
    paymentsPerYear: periodsPerYear,
    monthlyEquivalent,
    totalMonthlyCarrying,
    totalInterest: Number.isFinite(totalInterest) ? totalInterest : 0,
    totalPaid: principal + (Number.isFinite(totalInterest) ? totalInterest : 0),
    amortizationYears: Number.isFinite(periods) ? periods / periodsPerYear : amortization,
  };
}

/**
 * Rough "what can I afford" figure using the 39% GDS guideline lenders apply,
 * stress-tested at the greater of contract rate + 2% or 5.25%.
 */
export function affordabilityFromIncome(
  householdIncome: number,
  monthlyDebts: number,
  interestRate: number,
  downPayment: number,
  amortization = 25,
) {
  const stressRate = Math.max(interestRate + 2, 5.25);
  const maxMonthlyHousing = (householdIncome / 12) * 0.39 - monthlyDebts;
  if (maxMonthlyHousing <= 0) return 0;

  // Reserve ~20% of the budget for taxes, heat and fees.
  const availableForPrincipalAndInterest = maxMonthlyHousing * 0.8;
  const rate = periodicRate(stressRate, 12);
  const periods = amortization * 12;
  const maxLoan =
    rate === 0
      ? availableForPrincipalAndInterest * periods
      : (availableForPrincipalAndInterest * (1 - Math.pow(1 + rate, -periods))) / rate;

  return Math.max(0, Math.round((maxLoan + downPayment) / 1000) * 1000);
}
