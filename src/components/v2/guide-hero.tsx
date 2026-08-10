'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Calculator, Home, MapPin, Receipt } from 'lucide-react';

/**
 * Question-led hero.
 *
 * The first design direction leads with the team ("we sell luxury homes").
 * This one leads with the visitor's question and puts the tool that answers it
 * one click away — the whole page is organised as answers, not credentials.
 */
const QUESTIONS = [
  {
    icon: Home,
    question: 'What is my house worth?',
    detail: 'A range for your address in about 40 seconds.',
    href: '#valuation',
    cta: 'Get the range',
  },
  {
    icon: MapPin,
    question: 'Which neighbourhood fits?',
    detail: 'Compare 12 KW pockets on price, commute and schools.',
    href: '#compare',
    cta: 'Compare them',
  },
  {
    icon: Calculator,
    question: 'What can I actually afford?',
    detail: 'Stress-tested against what lenders will approve.',
    href: '#afford',
    cta: 'Run the numbers',
  },
  {
    icon: Receipt,
    question: 'What will closing cost me?',
    detail: 'Ontario land transfer tax, legal, title — all in.',
    href: '#closing',
    cta: 'See the total',
  },
];

export function GuideHero() {
  return (
    <section className="border-b border-guide-line">
      <div className="container pb-16 pt-16 md:pb-20 md:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl"
        >
          <p className="text-[13px] font-medium uppercase tracking-[0.14em] text-guide-forest">
            Kitchener · Waterloo · Cambridge
          </p>
          <h1 className="mt-5 text-balance text-[2.6rem] font-semibold leading-[1.04] tracking-[-0.03em] text-guide-ink sm:text-[3.4rem] lg:text-[4.1rem]">
            Straight answers about
            <br className="hidden sm:block" /> the Waterloo Region market.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-guide-inkSoft">
            Most agent websites are a brochure with a contact form. This one is the
            calculators, comparisons and numbers we&apos;d walk you through anyway — open,
            free, and without talking to anybody first.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-guide-line bg-guide-line sm:grid-cols-2">
          {QUESTIONS.map((q, i) => (
            <motion.a
              key={q.question}
              href={q.href}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.12 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="group flex flex-col justify-between gap-6 bg-guide-paper p-7 transition-colors hover:bg-guide-mint sm:p-8"
            >
              <div>
                <q.icon className="h-5 w-5 text-guide-forest" strokeWidth={1.75} />
                <h2 className="mt-5 text-[1.35rem] font-semibold leading-snug tracking-[-0.01em] text-guide-ink">
                  {q.question}
                </h2>
                <p className="mt-2.5 text-[15px] leading-relaxed text-guide-muted">{q.detail}</p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-[14px] font-medium text-guide-forest">
                {q.cta}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
