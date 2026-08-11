'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Search } from 'lucide-react';
import { EdImage } from './ed-image';
import { siteConfig } from '@/config/site';
import { formatCompactCurrency } from '@/lib/utils';

const PRICE_STEPS = [400_000, 600_000, 800_000, 1_000_000, 1_250_000, 1_500_000, 2_000_000];

/**
 * Full-bleed opening.
 *
 * Their current site opens on a price-range search, which is the right primary
 * action for a team whose main asset is IDX inventory — so that stays. What
 * changes is everything around it: one photograph, one sentence, and the search
 * sitting on top of it rather than in a grey utility bar.
 */
export function EdHero({ onSearch }: { onSearch: (min: number, max: number) => void }) {
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(0);
  const [mounted, setMounted] = useState(false);
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();

  const imageY = useTransform(scrollY, [0, 900], [0, reduce ? 0 : 160]);
  const textY = useTransform(scrollY, [0, 900], [0, reduce ? 0 : -60]);
  const overlay = useTransform(scrollY, [0, 600], [0.55, 0.8]);

  useEffect(() => setMounted(true), []);

  return (
    <section className="relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden bg-ed-night">
      <motion.div style={{ y: imageY }} className="absolute inset-x-0 -top-24 bottom-0 -z-10">
        <EdImage
          src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=2400&q=80"
          alt="Waterloo Region streetscape"
          sizes="100vw"
          priority
          zoom={false}
          fallbackTone="dark"
        />
      </motion.div>
      <motion.div
        style={{ opacity: overlay }}
        className="absolute inset-0 -z-10 bg-gradient-to-t from-ed-night via-ed-night/70 to-ed-night/40"
      />
      {/* Constant floor so headline contrast never depends on the photo loading. */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ed-night/85 via-ed-night/30 to-ed-night/45" />

      <motion.div style={{ y: textY }} className="container pb-14 pt-40 md:pb-20">
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-[11px] font-medium uppercase tracking-[0.34em] text-white/55"
        >
          Kitchener · Waterloo · Cambridge
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 max-w-4xl font-serif text-[clamp(2.6rem,7vw,5.5rem)] font-normal leading-[0.98] tracking-[-0.03em] text-white"
        >
          The people who know
          <span className="block italic text-white/80">this region best.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mt-7 max-w-lg text-[17px] leading-relaxed text-white/65"
        >
          Nearly ten years and {siteConfig.proof.googleReviewCount} five-star reviews across
          Waterloo Region. Start with the search — or find out what your own home is worth.
        </motion.p>

        {/* Search — their primary action, given the room it deserves */}
        <motion.form
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
          onSubmit={(e) => {
            e.preventDefault();
            onSearch(min, max || Infinity);
            document.getElementById('listings')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="mt-11 flex w-full max-w-2xl flex-col gap-px overflow-hidden bg-white/15 backdrop-blur-md sm:flex-row"
        >
          <label className="flex-1 bg-white/10 px-5 py-4">
            <span className="block text-[10px] uppercase tracking-[0.2em] text-white/50">
              Min price
            </span>
            <select
              value={min}
              onChange={(e) => setMin(Number(e.target.value))}
              className="mt-1 w-full cursor-pointer border-0 bg-transparent p-0 text-[15px] text-white outline-none [&>option]:text-ed-ink"
            >
              <option value={0}>No minimum</option>
              {PRICE_STEPS.map((p) => (
                <option key={p} value={p}>
                  {formatCompactCurrency(p)}
                </option>
              ))}
            </select>
          </label>

          <label className="flex-1 bg-white/10 px-5 py-4">
            <span className="block text-[10px] uppercase tracking-[0.2em] text-white/50">
              Max price
            </span>
            <select
              value={max}
              onChange={(e) => setMax(Number(e.target.value))}
              className="mt-1 w-full cursor-pointer border-0 bg-transparent p-0 text-[15px] text-white outline-none [&>option]:text-ed-ink"
            >
              <option value={0}>No maximum</option>
              {PRICE_STEPS.map((p) => (
                <option key={p} value={p}>
                  {formatCompactCurrency(p)}
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            className="flex items-center justify-center gap-2.5 bg-white px-8 py-5 text-[12px] uppercase tracking-[0.16em] text-ed-ink transition-colors hover:bg-ed-accent hover:text-white sm:py-0"
          >
            <Search className="h-4 w-4" strokeWidth={1.75} />
            Search
          </button>
        </motion.form>

        <motion.a
          href="#value"
          initial={{ opacity: 0 }}
          animate={{ opacity: mounted ? 1 : 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-6 inline-flex items-center gap-2 text-[13px] text-white/60 transition-colors hover:text-white"
        >
          Or find out what your home is worth
          <ArrowRight className="h-3.5 w-3.5" />
        </motion.a>
      </motion.div>
    </section>
  );
}
