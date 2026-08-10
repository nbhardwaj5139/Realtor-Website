'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, TrendingDown } from 'lucide-react';
import { calculateLandTransferTax } from '@/lib/ontario-tax';
import { cn, formatCurrency } from '@/lib/utils';

const PRESETS = [650_000, 812_400, 950_000, 1_200_000];

/**
 * Closing-cost breakdown, and the one genuinely local fact worth leading with:
 * Waterloo Region has no municipal land transfer tax. Toronto does.
 */
export function ClosingCosts() {
  const [price, setPrice] = useState(812_400);
  const [firstTime, setFirstTime] = useState(false);

  const ltt = useMemo(
    () => calculateLandTransferTax({ price, firstTimeBuyer: firstTime }),
    [price, firstTime],
  );

  const legal = 2200;
  const title = 450;
  const inspection = 550;
  const adjustments = Math.round(price * 0.001);
  const total = ltt.total + legal + title + inspection + adjustments;

  const lines = [
    { label: 'Ontario land transfer tax', value: ltt.provincialTax, note: 'Provincial, on a sliding scale' },
    ...(firstTime
      ? [{ label: 'First-time buyer rebate', value: -ltt.provincialRebate, note: 'Up to $4,000 off', credit: true }]
      : []),
    { label: 'Municipal land transfer tax', value: 0, note: 'Waterloo Region has none', credit: true },
    { label: 'Lawyer', value: legal, note: 'Typical KW real estate fee' },
    { label: 'Title insurance', value: title, note: 'One-time, at closing' },
    { label: 'Home inspection', value: inspection, note: 'Before your offer goes firm' },
    { label: 'Closing adjustments', value: adjustments, note: 'Prepaid taxes, utilities' },
  ];

  return (
    <section id="closing" className="border-b border-guide-line py-16 md:py-24">
      <div className="container">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)] lg:gap-16">
          <div>
            <p className="text-[13px] font-medium uppercase tracking-[0.14em] text-guide-forest">
              Closing costs
            </p>
            <h2 className="mt-4 text-[2rem] font-semibold leading-tight tracking-[-0.02em] text-guide-ink sm:text-[2.5rem]">
              The bill on closing day.
            </h2>
            <p className="mt-4 max-w-lg text-[17px] leading-relaxed text-guide-inkSoft">
              The number that surprises people isn&apos;t the mortgage — it&apos;s everything due
              the day the keys change hands, on top of the down payment.
            </p>

            <div className="mt-8">
              <p className="text-[14px] font-medium text-guide-ink">Purchase price</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPrice(p)}
                    className={cn(
                      'rounded-lg border px-3.5 py-2 text-[14px] tabular-nums transition-colors',
                      price === p
                        ? 'border-guide-forest bg-guide-forest text-white'
                        : 'border-guide-line bg-white text-guide-inkSoft hover:border-guide-forest/40',
                    )}
                  >
                    {formatCurrency(p)}
                  </button>
                ))}
              </div>
              <input
                type="range"
                min={250_000}
                max={2_500_000}
                step={10_000}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                aria-label="Purchase price"
                className="mt-5 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-guide-line accent-guide-forest"
              />
            </div>

            <button
              onClick={() => setFirstTime((v) => !v)}
              className={cn(
                'mt-7 flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors',
                firstTime
                  ? 'border-guide-forest bg-guide-mint'
                  : 'border-guide-line bg-white hover:border-guide-forest/40',
              )}
            >
              <span
                className={cn(
                  'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors',
                  firstTime ? 'border-guide-forest bg-guide-forest' : 'border-guide-line bg-white',
                )}
              >
                {firstTime && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
              </span>
              <span>
                <span className="block text-[15px] font-medium text-guide-ink">
                  I&apos;m a first-time home buyer
                </span>
                <span className="mt-0.5 block text-[13px] text-guide-muted">
                  Applies the Ontario rebate — up to $4,000 off the land transfer tax.
                </span>
              </span>
            </button>

            <div className="mt-7 flex items-start gap-3 rounded-xl border border-guide-forest/25 bg-guide-mint p-5">
              <TrendingDown className="mt-0.5 h-5 w-5 shrink-0 text-guide-forest" />
              <div>
                <p className="text-[15px] font-medium text-guide-ink">
                  {formatCurrency(ltt.savingsVsToronto)} cheaper to close than Toronto
                </p>
                <p className="mt-1.5 text-[14px] leading-relaxed text-guide-inkSoft">
                  Toronto charges a municipal land transfer tax on top of the provincial one. On
                  this purchase that&apos;s {formatCurrency(ltt.torontoComparisonTotal)} in tax
                  there versus {formatCurrency(ltt.total)} here.
                </p>
              </div>
            </div>
          </div>

          <div>
            <div className="overflow-hidden rounded-2xl border border-guide-line bg-white">
              <div className="border-b border-guide-line px-6 py-5">
                <p className="text-[13px] uppercase tracking-[0.14em] text-guide-muted">
                  Due on closing
                </p>
                <motion.p
                  key={total}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="mt-2 text-[2.5rem] font-semibold leading-none tracking-[-0.03em] text-guide-ink"
                >
                  {formatCurrency(total)}
                </motion.p>
                <p className="mt-2 text-[14px] text-guide-muted">
                  On top of your down payment
                </p>
              </div>

              <ul className="divide-y divide-guide-line/70">
                {lines.map((line) => (
                  <li key={line.label} className="flex items-start justify-between gap-4 px-6 py-3.5">
                    <span className="min-w-0">
                      <span className="block text-[15px] text-guide-ink">{line.label}</span>
                      <span className="block text-[12px] text-guide-muted">{line.note}</span>
                    </span>
                    <span
                      className={cn(
                        'shrink-0 text-[15px] font-medium tabular-nums',
                        line.credit ? 'text-guide-forest' : 'text-guide-ink',
                      )}
                    >
                      {line.value === 0
                        ? '$0'
                        : line.value < 0
                          ? `− ${formatCurrency(Math.abs(line.value))}`
                          : formatCurrency(line.value)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="mt-4 text-[13px] leading-relaxed text-guide-muted">
              Land transfer tax is exact. Lawyer, title, inspection and adjustment figures are
              typical Waterloo Region estimates — your lawyer will give you the real numbers on
              your statement of adjustments.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
