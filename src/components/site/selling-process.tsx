'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SectionHeading } from '@/components/ui/section-heading';
import { Reveal } from '@/components/ui/reveal';
import { BeforeAfterSlider } from './before-after-slider';
import { marketStats } from '@/lib/data';
import { cn } from '@/lib/utils';

export function SellingProcess() {
  const [active, setActive] = useState(0);
  const steps = marketStats.process;
  const step = steps[active];

  return (
    <section id="selling" className="section bg-slate-ink text-white">
      <div className="container">
        <SectionHeading
          tone="light"
          eyebrow="The signature listing process"
          title="Five steps between your front door and a firm deal."
          description="Nothing here is optional or upsold. Staging, media, campaigns and offer-day strategy are what we do on every listing, at every price point."
        />

        <div className="mt-14 grid gap-10 lg:grid-cols-[minmax(280px,340px)_1fr] lg:gap-14">
          {/* Timeline rail */}
          <div className="relative">
            <div className="absolute left-[19px] top-3 hidden h-[calc(100%-2rem)] w-px bg-white/10 lg:block" />
            <ol className="no-scrollbar flex gap-3 overflow-x-auto pb-3 lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0">
              {steps.map((s, i) => {
                const isActive = i === active;
                const isDone = i < active;
                return (
                  <li key={s.step} className="shrink-0 lg:w-full">
                    <button
                      onClick={() => setActive(i)}
                      className={cn(
                        'group relative flex w-full items-center gap-4 rounded-xl p-3 text-left transition-colors lg:pr-4',
                        isActive ? 'bg-white/10' : 'hover:bg-white/5',
                      )}
                    >
                      <span
                        className={cn(
                          'relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-all duration-300',
                          isActive
                            ? 'border-gold bg-gold text-slate-ink'
                            : isDone
                              ? 'border-gold/40 bg-slate-ink text-gold'
                              : 'border-white/20 bg-slate-ink text-white/50',
                        )}
                      >
                        {isDone ? <Check className="h-4 w-4" strokeWidth={3} /> : s.step}
                      </span>
                      <span className="min-w-[190px] lg:min-w-0">
                        <span
                          className={cn(
                            'block text-sm font-medium leading-snug transition-colors',
                            isActive ? 'text-white' : 'text-white/60 group-hover:text-white/85',
                          )}
                        >
                          {s.title}
                        </span>
                        <span className="mt-0.5 block text-[11px] uppercase tracking-wider text-gold/70">
                          {s.duration}
                        </span>
                      </span>
                      {isActive && (
                        <ChevronRight className="ml-auto hidden h-4 w-4 text-gold lg:block" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Step detail */}
          <div>
            <AnimatePresence mode="wait">
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur-sm sm:p-9"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="gold">Step {step.step}</Badge>
                  <span className="text-xs uppercase tracking-wider text-white/50">
                    {step.duration}
                  </span>
                </div>

                <h3 className="heading-serif mt-5 text-2xl font-medium text-white sm:text-3xl">
                  {step.title}
                </h3>
                <p className="mt-4 text-base leading-relaxed text-white/65">{step.summary}</p>

                <ul className="mt-7 space-y-3.5">
                  {step.details.map((detail, i) => (
                    <motion.li
                      key={detail}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.08 * i + 0.12, duration: 0.4 }}
                      className="flex items-start gap-3 text-sm leading-relaxed text-white/75"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                      {detail}
                    </motion.li>
                  ))}
                </ul>

                <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">
                      You receive
                    </p>
                    <p className="mt-1 text-sm font-medium text-gold">{step.deliverable}</p>
                  </div>
                  {active < steps.length - 1 && (
                    <Button variant="light" size="sm" onClick={() => setActive(active + 1)}>
                      Next step <ChevronRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Staging proof */}
            <Reveal delay={0.1} className="mt-10">
              <p className="eyebrow mb-4">Staging, in one drag</p>
              <BeforeAfterSlider
                before={marketStats.stagingSlider.before}
                after={marketStats.stagingSlider.after}
                caption={marketStats.stagingSlider.caption}
                className="[&_figcaption]:text-white/50"
              />
            </Reveal>

            <Reveal delay={0.15} className="mt-10">
              <div className="flex flex-col gap-4 rounded-2xl border border-gold/25 bg-gold/10 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="heading-serif text-xl font-medium text-white">
                    Want this run on your house?
                  </p>
                  <p className="mt-1.5 text-sm text-white/60">
                    Start with the number, then decide. No obligation, no drip campaign.
                  </p>
                </div>
                <Button asChild variant="gold" className="shrink-0">
                  <a href="#valuation">Get my home value</a>
                </Button>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
