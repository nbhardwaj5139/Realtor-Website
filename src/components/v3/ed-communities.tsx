'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { EdImage } from './ed-image';
import { neighbourhoods } from '@/lib/data';
import { siteConfig } from '@/config/site';
import { formatCompactCurrency } from '@/lib/utils';

/**
 * Their site lists the same nine communities as plain text links. Same
 * information, given a photograph and a median — the thing a visitor is
 * actually trying to learn when they click a neighbourhood name.
 */
export function EdCommunities() {
  return (
    <section id="communities" className="bg-ed-paper py-24 md:py-32">
      <div className="container">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-ed-accent">
              Where we work
            </p>
            <h2 className="mt-5 font-serif text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.02] tracking-[-0.025em] text-ed-ink">
              Nine communities,
              <span className="block italic text-ed-muted">known street by street.</span>
            </h2>
          </div>
          <p className="max-w-sm text-[15px] leading-relaxed text-ed-inkSoft">
            From the new builds of Vista Hills to the ravine lots of Hidden Valley — the
            areas we sell in most, and what they trade for.
          </p>
        </div>

        <div className="mt-16 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {neighbourhoods.map((n, i) => (
            <motion.a
              key={n.id}
              href="#listings"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="group block"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <EdImage
                  src={n.image}
                  alt={`${n.name}, ${n.city}`}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-ed-night/55 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <span className="absolute right-4 top-4 flex h-9 w-9 translate-y-2 items-center justify-center bg-white/95 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                  <ArrowUpRight className="h-4 w-4 text-ed-ink" />
                </span>
              </div>

              <div className="mt-5 flex items-baseline justify-between gap-4 border-b border-ed-line pb-4">
                <div>
                  <h3 className="font-serif text-[1.45rem] leading-tight tracking-[-0.01em] text-ed-ink">
                    {n.name}
                  </h3>
                  <p className="mt-1 text-[12px] uppercase tracking-[0.16em] text-ed-muted">
                    {n.city}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[15px] tabular-nums text-ed-ink">
                    {formatCompactCurrency(n.medianPrice)}
                  </p>
                  <p className="text-[11px] uppercase tracking-wider text-ed-muted">median</p>
                </div>
              </div>

              <p className="mt-4 text-[14px] leading-relaxed text-ed-inkSoft">{n.tagline}</p>
            </motion.a>
          ))}
        </div>

        {siteConfig.content.demoMode && (
          <p className="mt-14 text-[12px] text-ed-muted">
            Median figures shown are sample data for this demo — connect the MLS feed to
            publish live numbers per community.
          </p>
        )}
      </div>
    </section>
  );
}
