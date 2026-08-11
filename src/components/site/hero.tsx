'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowDown, Clock, MapPin, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/config/site';
import { ValuationWizard } from './valuation-wizard';

/**
 * Publicly verifiable proof points only. Sales volume, days on market and
 * list-to-sale ratio stay off (siteConfig.content.showPerformanceStats) — those
 * figures aren't published anywhere, so there is nothing real to show.
 */
const trustPoints = [
  {
    icon: Star,
    label: `${siteConfig.proof.googleRating} from ${siteConfig.proof.googleReviewCount} Google reviews`,
  },
  { icon: Clock, label: `${siteConfig.proof.yearsServing} in Waterloo Region` },
  { icon: MapPin, label: 'Brokered by eXp Realty' },
];

export function Hero() {
  return (
    <section id="valuation" className="relative isolate min-h-screen overflow-hidden bg-slate-ink">
      {/* Backdrop — Grand River / KW skyline */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=2400&q=75"
          alt="Waterloo Region streetscape at golden hour"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-ink/95 via-slate-ink/80 to-slate-ink/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-ink via-transparent to-slate-ink/60" />
      </div>

      <div className="container grid items-center gap-12 pb-20 pt-32 lg:grid-cols-[1.05fr_minmax(420px,0.95fr)] lg:gap-16 lg:pb-28 lg:pt-36">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-2 backdrop-blur-md"
          >
            <MapPin className="h-3.5 w-3.5 text-gold" />
            <span className="text-xs font-medium text-white/85">
              Kitchener · Waterloo · Cambridge
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="heading-serif mt-7 text-balance text-4xl font-medium leading-[1.06] text-white sm:text-5xl lg:text-[3.75rem]"
          >
            Know what your KW home is worth
            <span className="block text-gold"> before you talk to anyone.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="mt-7 max-w-xl text-lg leading-relaxed text-white/70"
          >
            Real numbers from the communities we work in — Laurelwood, Vista Hills, Doon, Huron,
            Deer Ridge. Get an instant range, then decide whether you want to hear from us.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <Button asChild variant="gold" size="lg">
              <a href="#listings">Browse featured listings</a>
            </Button>
            <Button asChild variant="light" size="lg">
              <a href="#selling">See how we sell</a>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.36 }}
            className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-white/10 pt-8"
          >
            {trustPoints.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2.5">
                <Icon className="h-4 w-4 text-gold" />
                <p className="text-sm text-white/60">{label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <ValuationWizard />
        </motion.div>
      </div>

      <motion.a
        href="#neighbourhoods"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-white/50 transition-colors hover:text-white lg:flex"
        aria-label="Scroll to neighbourhoods"
      >
        <span className="text-[10px] uppercase tracking-[0.24em]">Explore the region</span>
        <ArrowDown className="h-4 w-4 animate-bounce" />
      </motion.a>
    </section>
  );
}
