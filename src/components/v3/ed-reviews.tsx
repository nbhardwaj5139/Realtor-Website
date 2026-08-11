'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { testimonials } from '@/lib/data';

const INITIAL = 4;

/** Real, attributed Google reviews — art-directed for the editorial layout. */
export function EdReviews() {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? testimonials : testimonials.slice(0, INITIAL);
  const { googleRating, googleReviewCount } = siteConfig.proof;

  return (
    <section id="reviews" className="bg-ed-paper py-24 md:py-32">
      <div className="container">
        <div className="flex flex-col items-start gap-10 border-b border-ed-line pb-12 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-ed-accent">
              Reviews
            </p>
            <h2 className="mt-5 font-serif text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.02] tracking-[-0.025em] text-ed-ink">
              {googleRating} out of five,
              <span className="block italic text-ed-muted">
                across {googleReviewCount} reviews.
              </span>
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-serif text-[3.5rem] leading-none text-ed-ink">
              {googleRating}
            </span>
            <div>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-ed-accent text-ed-accent" />
                ))}
              </div>
              <p className="mt-1.5 text-[12px] uppercase tracking-[0.14em] text-ed-muted">
                {googleReviewCount} Google reviews
              </p>
            </div>
          </div>
        </div>

        <div className="mt-14 grid gap-x-10 gap-y-14 md:grid-cols-2">
          {shown.map((t, i) => (
            <motion.figure
              key={t.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: (i % 2) * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <blockquote className="font-serif text-[1.3rem] leading-[1.5] tracking-[-0.01em] text-ed-ink">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-ed-line pt-5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ed-paperWarm text-[11px] font-medium text-ed-inkSoft">
                  {t.initials}
                </span>
                <span>
                  <span className="block text-[14px] text-ed-ink">{t.name}</span>
                  <span className="block text-[12px] text-ed-muted">
                    {t.source} · {t.when}
                  </span>
                </span>
              </figcaption>
            </motion.figure>
          ))}
        </div>

        {testimonials.length > INITIAL && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="mt-14 border border-ed-ink px-7 py-3.5 text-[12px] uppercase tracking-[0.14em] text-ed-ink transition-colors hover:bg-ed-ink hover:text-ed-paper"
          >
            {expanded ? 'Show fewer' : `Read all ${testimonials.length}`}
          </button>
        )}

        <p className="mt-8 text-[12px] text-ed-muted">
          Published on Google and reproduced as written, credited by name.
        </p>
      </div>
    </section>
  );
}
