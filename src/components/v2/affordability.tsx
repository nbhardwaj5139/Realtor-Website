'use client';

import { useMemo, useState } from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import { affordabilityFromIncome, calculateMortgage } from '@/lib/mortgage';
import { minimumDownPayment } from '@/lib/ontario-tax';
import { neighbourhoods } from '@/lib/data';
import { cn, formatCurrency } from '@/lib/utils';

/**
 * "What can I actually afford" — the question buyers ask before price.
 *
 * Uses the same 39% GDS guideline and stress test lenders apply, then maps the
 * result onto the neighbourhood dataset so the answer is "here's where that
 * buys" rather than an abstract number.
 */
export function Affordability() {
  const [income, setIncome] = useState(165_000);
  const [debts, setDebts] = useState(650);
  const [down, setDown] = useState(120_000);
  const [rate, setRate] = useState(4.59);
  const [amortization, setAmortization] = useState(25);

  const maxPrice = useMemo(
    () => affordabilityFromIncome(income, debts, rate, down, amortization),
    [income, debts, rate, down, amortization],
  );

  const stressRate = Math.max(rate + 2, 5.25);
  const minDown = minimumDownPayment(maxPrice);
  const downShortfall = maxPrice > 0 && down < minDown;

  // What the payment actually looks like at that price, at the contract rate.
  const payment = useMemo(
    () =>
      calculateMortgage({
        price: maxPrice,
        downPayment: Math.min(down, maxPrice),
        interestRate: rate,
        amortization,
        paymentFrequency: 'monthly',
      }),
    [maxPrice, down, rate, amortization],
  );

  const reachable = neighbourhoods
    .filter((n) => n.medianPrice <= maxPrice)
    .sort((a, b) => b.medianPrice - a.medianPrice);
  const stretch = neighbourhoods
    .filter((n) => n.medianPrice > maxPrice && n.medianPrice <= maxPrice * 1.15)
    .sort((a, b) => a.medianPrice - b.medianPrice);

  return (
    <section id="afford" className="border-b border-guide-line bg-guide-paperDark/50 py-16 md:py-24">
      <div className="container">
        <div className="max-w-2xl">
          <p className="text-[13px] font-medium uppercase tracking-[0.14em] text-guide-forest">
            Affordability
          </p>
          <h2 className="mt-4 text-[2rem] font-semibold leading-tight tracking-[-0.02em] text-guide-ink sm:text-[2.5rem]">
            What a lender will actually approve.
          </h2>
          <p className="mt-4 text-[17px] leading-relaxed text-guide-inkSoft">
            Not what you&apos;d like to spend — what passes the federal stress test at{' '}
            {stressRate.toFixed(2)}%, using the 39% gross debt service limit lenders apply.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
          <div className="rounded-2xl border border-guide-line bg-white p-6 sm:p-7">
            <Field
              label="Household income"
              value={income}
              display={formatCurrency(income)}
              min={40_000}
              max={500_000}
              step={5_000}
              onChange={setIncome}
            />
            <Field
              label="Monthly debt payments"
              hint="Car loans, credit cards, student loans, lines of credit"
              value={debts}
              display={`${formatCurrency(debts)}/mo`}
              min={0}
              max={5_000}
              step={50}
              onChange={setDebts}
            />
            <Field
              label="Down payment saved"
              value={down}
              display={formatCurrency(down)}
              min={0}
              max={600_000}
              step={5_000}
              onChange={setDown}
            />
            <Field
              label="Interest rate"
              value={rate}
              display={`${rate.toFixed(2)}%`}
              min={1}
              max={9}
              step={0.01}
              onChange={setRate}
            />

            <div className="mt-6">
              <p className="text-[14px] font-medium text-guide-ink">Amortization</p>
              <div className="mt-2.5 flex gap-2">
                {[20, 25, 30].map((y) => (
                  <button
                    key={y}
                    onClick={() => setAmortization(y)}
                    className={cn(
                      'flex-1 rounded-lg border py-2.5 text-[14px] transition-colors',
                      amortization === y
                        ? 'border-guide-forest bg-guide-forest text-white'
                        : 'border-guide-line bg-white text-guide-inkSoft hover:border-guide-forest/40',
                    )}
                  >
                    {y} yr
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="rounded-2xl bg-guide-ink p-7 text-white sm:p-9">
              <p className="text-[13px] uppercase tracking-[0.14em] text-white/50">
                Approximate maximum purchase price
              </p>
              <p className="mt-3 text-[2.75rem] font-semibold leading-none tracking-[-0.03em] sm:text-[3.5rem]">
                {formatCurrency(maxPrice)}
              </p>
              {maxPrice > 0 && (
                <p className="mt-4 text-[15px] leading-relaxed text-white/60">
                  About {formatCurrency(payment.payment)}/month in principal and interest at{' '}
                  {rate.toFixed(2)}%, before property tax and heat.
                </p>
              )}
            </div>

            {downShortfall && (
              <div className="mt-4 flex items-start gap-3 rounded-xl border border-guide-clay/30 bg-guide-clay/10 p-4">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-guide-clay" />
                <p className="text-[14px] leading-relaxed text-guide-inkSoft">
                  At {formatCurrency(maxPrice)} the federal minimum down payment is{' '}
                  <strong className="font-medium">{formatCurrency(minDown)}</strong> — about{' '}
                  {formatCurrency(minDown - down)} more than you&apos;ve entered. Your real ceiling
                  is set by the down payment, not the income.
                </p>
              </div>
            )}

            <div className="mt-6 rounded-2xl border border-guide-line bg-white p-6 sm:p-7">
              <h3 className="text-[15px] font-semibold text-guide-ink">
                Where that buys in Waterloo Region
              </h3>
              <p className="mt-1.5 text-[13px] text-guide-muted">
                Based on each neighbourhood&apos;s median price.
              </p>

              {reachable.length === 0 && stretch.length === 0 && (
                <p className="mt-5 text-[15px] text-guide-inkSoft">
                  That budget sits below the median in every neighbourhood we track — which
                  doesn&apos;t mean nothing is available, it means the search is about specific
                  properties rather than areas. That&apos;s a conversation worth having.
                </p>
              )}

              {reachable.length > 0 && (
                <div className="mt-5">
                  <p className="text-[12px] font-medium uppercase tracking-wider text-guide-forest">
                    Comfortably in range
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {reachable.map((n) => (
                      <span
                        key={n.id}
                        className="rounded-lg bg-guide-mint px-3 py-1.5 text-[13px] text-guide-ink"
                      >
                        {n.name}{' '}
                        <span className="text-guide-muted">
                          {formatCurrency(n.medianPrice)}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {stretch.length > 0 && (
                <div className="mt-5">
                  <p className="text-[12px] font-medium uppercase tracking-wider text-guide-clay">
                    Within about 15% — a stretch
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {stretch.map((n) => (
                      <span
                        key={n.id}
                        className="rounded-lg bg-guide-paperDark px-3 py-1.5 text-[13px] text-guide-ink"
                      >
                        {n.name}{' '}
                        <span className="text-guide-muted">
                          {formatCurrency(n.medianPrice)}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <p className="mt-4 flex items-start gap-2 text-[13px] leading-relaxed text-guide-muted">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              An estimate, not a pre-approval. Lenders weigh credit history, employment type and
              the specific property. Get a real pre-approval before you shop.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  hint,
  value,
  display,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  hint?: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="mb-6 last:mb-0">
      <div className="flex items-baseline justify-between gap-4">
        <label className="text-[14px] font-medium text-guide-ink">{label}</label>
        <span className="text-[15px] font-medium tabular-nums text-guide-forest">{display}</span>
      </div>
      {hint && <p className="mt-1 text-[12px] text-guide-muted">{hint}</p>}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="mt-3 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-guide-line accent-guide-forest"
      />
    </div>
  );
}
