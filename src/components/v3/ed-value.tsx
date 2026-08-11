'use client';

import { motion } from 'framer-motion';
import { ValuationWizard } from '@/components/site/valuation-wizard';
import { siteConfig } from '@/config/site';

/**
 * Home valuation.
 *
 * Their current site sends this to a separate "free market analysis" page
 * behind a form. Here the tool itself is on the page and answers before it
 * asks — the contact step only gates the comparable sales.
 */
export function EdValue() {
  return (
    <section id="value" className="relative overflow-hidden bg-ed-paper py-24 md:py-32">
      <div className="container">
        <div className="grid items-start gap-14 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="lg:sticky lg:top-28"
          >
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-ed-accent">
              Sellers
            </p>
            <h2 className="mt-5 font-serif text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.02] tracking-[-0.025em] text-ed-ink">
              What is your home
              <span className="block italic text-ed-muted">worth today?</span>
            </h2>
            <p className="mt-7 max-w-md text-[16px] leading-relaxed text-ed-inkSoft">
              Four questions, about forty seconds, and you see a range before anyone asks
              for your details. No account, no phone call first.
            </p>

            <dl className="mt-10 space-y-5 border-t border-ed-line pt-8">
              {[
                ['Reviews', `${siteConfig.proof.googleRating} from ${siteConfig.proof.googleReviewCount} on Google`],
                ['Experience', `${siteConfig.proof.yearsServing} in Waterloo Region`],
                ['Brokerage', siteConfig.brokerage],
              ].map(([label, value]) => (
                <div key={label} className="flex items-baseline justify-between gap-6">
                  <dt className="text-[11px] uppercase tracking-[0.18em] text-ed-muted">{label}</dt>
                  <dd className="text-right text-[15px] text-ed-ink">{value}</dd>
                </div>
              ))}
            </dl>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <ValuationWizard />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
