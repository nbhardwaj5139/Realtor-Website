'use client';

import { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { EdImage } from './ed-image';
import { listings, neighbourhoods } from '@/lib/data';
import { siteConfig } from '@/config/site';
import { formatCurrency } from '@/lib/utils';

const STATUS_LABEL: Record<string, string> = {
  active: 'For sale',
  pending: 'Pending',
  'sold-above': 'Sold',
};

export function EdListings({
  minPrice,
  maxPrice,
  onClearFilter,
}: {
  minPrice: number;
  maxPrice: number;
  onClearFilter: () => void;
}) {
  const filtered = useMemo(
    () =>
      listings.filter((l) => {
        const price = l.soldPrice ?? l.price;
        return price >= minPrice && price <= maxPrice;
      }),
    [minPrice, maxPrice],
  );

  const filtering = minPrice > 0 || Number.isFinite(maxPrice);

  return (
    <section id="listings" className="bg-ed-paperWarm py-24 md:py-32">
      <div className="container">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-ed-accent">
              Properties
            </p>
            <h2 className="mt-5 font-serif text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.02] tracking-[-0.025em] text-ed-ink">
              Currently on
              <span className="italic text-ed-muted"> the market.</span>
            </h2>
          </div>

          <AnimatePresence>
            {filtering && (
              <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                onClick={onClearFilter}
                className="inline-flex items-center gap-2 self-start border border-ed-ink px-4 py-2.5 text-[12px] uppercase tracking-[0.14em] text-ed-ink transition-colors hover:bg-ed-ink hover:text-ed-paper"
              >
                <X className="h-3.5 w-3.5" />
                Clear price filter
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-16 grid gap-x-7 gap-y-14 md:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {filtered.map((l, i) => {
              const hood = neighbourhoods.find((n) => n.id === l.neighbourhoodId);
              const price = l.soldPrice ?? l.price;
              return (
                <motion.a
                  key={l.id}
                  href="#contact"
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.6, delay: (i % 2) * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  className="group block"
                >
                  <div className="relative aspect-[16/11] overflow-hidden">
                    <EdImage
                      src={l.image}
                      alt={`${l.address}, ${l.city}`}
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <span className="absolute left-5 top-5 bg-ed-paper/95 px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-ed-ink">
                      {STATUS_LABEL[l.status] ?? l.status}
                    </span>
                    {siteConfig.content.demoMode && (
                      <span className="absolute right-5 top-5 bg-ed-ink/70 px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-white backdrop-blur-sm">
                        Sample
                      </span>
                    )}
                  </div>

                  <div className="mt-6 flex items-baseline justify-between gap-6 border-b border-ed-line pb-5">
                    <h3 className="font-serif text-[1.6rem] leading-tight tracking-[-0.015em] text-ed-ink">
                      {l.address}
                    </h3>
                    <p className="shrink-0 text-[1.15rem] tabular-nums text-ed-ink">
                      {formatCurrency(price)}
                    </p>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-ed-muted">
                    <span className="uppercase tracking-[0.14em] text-ed-inkSoft">
                      {hood?.name ?? l.city}
                    </span>
                    <span>{l.beds} bed</span>
                    <span>{l.baths} bath</span>
                    <span>{l.sqft.toLocaleString()} sq ft</span>
                    <span>{l.propertyType}</span>
                  </div>

                  <p className="mt-4 max-w-lg text-[14px] leading-relaxed text-ed-inkSoft">
                    {l.headline}
                  </p>
                </motion.a>
              );
            })}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && (
          <div className="mt-16 border border-ed-line bg-ed-paper p-14 text-center">
            <p className="font-serif text-2xl text-ed-ink">Nothing in that range right now.</p>
            <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-ed-inkSoft">
              Inventory moves quickly here. Tell us what you&apos;re looking for and we&apos;ll
              send matches before they reach the public board.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <button
                onClick={onClearFilter}
                className="border border-ed-ink px-6 py-3 text-[12px] uppercase tracking-[0.14em] text-ed-ink transition-colors hover:bg-ed-ink hover:text-ed-paper"
              >
                Clear filter
              </button>
              <a
                href="#contact"
                className="bg-ed-ink px-6 py-3 text-[12px] uppercase tracking-[0.14em] text-ed-paper transition-colors hover:bg-ed-accent"
              >
                Set up an alert
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
