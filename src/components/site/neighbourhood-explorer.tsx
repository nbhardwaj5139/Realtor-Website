'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Building2,
  Clock,
  GraduationCap,
  Home,
  MapPin,
  Train,
  TrendingUp,
  Footprints,
  ArrowUpRight,
  Car,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SectionHeading } from '@/components/ui/section-heading';
import { neighbourhoods, PERSONA_FILTERS } from '@/lib/data';
import { cn, formatCompactCurrency, formatCurrency } from '@/lib/utils';
import type { Neighbourhood, Persona } from '@/lib/types';

export function NeighbourhoodExplorer() {
  const [filter, setFilter] = useState<Persona | 'all'>('all');
  const [selected, setSelected] = useState<Neighbourhood | null>(null);

  const visible = useMemo(
    () =>
      filter === 'all'
        ? neighbourhoods
        : neighbourhoods.filter((n) => n.personas.includes(filter)),
    [filter],
  );

  const activeFilter = PERSONA_FILTERS.find((f) => f.value === filter);

  return (
    <section id="neighbourhoods" className="section bg-background">
      <div className="container">
        <SectionHeading
          eyebrow="Neighbourhood & commute intelligence"
          title={
            <>
              Pick the pocket that fits your life,
              <br className="hidden sm:block" /> not just your budget.
            </>
          }
          description="Twelve Waterloo Region neighbourhoods, filtered by what actually decides the move — the commute to Google KW, the school catchment, the walk to an ION stop, or the drive to the 401."
        />

        {/* Persona filters */}
        <div className="no-scrollbar mt-10 flex gap-2 overflow-x-auto pb-2">
          {PERSONA_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                'shrink-0 rounded-full border px-5 py-2.5 text-sm font-medium transition-all duration-300',
                filter === f.value
                  ? 'border-slate-ink bg-slate-ink text-white shadow-sm'
                  : 'border-border bg-white text-slate-ink/70 hover:border-gold hover:text-slate-ink',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {activeFilter && filter !== 'all' && (
          <motion.p
            key={filter}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-sm text-muted-foreground"
          >
            {activeFilter.blurb} — {visible.length} neighbourhood
            {visible.length === 1 ? '' : 's'}.
          </motion.p>
        )}

        <motion.div layout className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {visible.map((n, i) => (
              <motion.button
                key={n.id}
                layout
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.45, delay: Math.min(i * 0.04, 0.24), ease: [0.22, 1, 0.36, 1] }}
                onClick={() => setSelected(n)}
                className="card-hover group overflow-hidden rounded-2xl border border-border bg-card text-left shadow-card"
              >
                <div className="relative h-52 overflow-hidden">
                  <Image
                    src={n.image}
                    alt={`${n.name}, ${n.city}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-ink/85 via-slate-ink/20 to-transparent" />
                  <div className="absolute left-4 top-4">
                    <Badge variant="glass">{n.city}</Badge>
                  </div>
                  <div className="absolute inset-x-4 bottom-4">
                    <p className="heading-serif text-xl font-semibold text-white">{n.name}</p>
                    <p className="mt-1 text-xs text-white/70">{n.tagline}</p>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                        Median
                      </p>
                      <p className="heading-serif text-xl font-semibold text-slate-ink">
                        {formatCompactCurrency(n.medianPrice)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="flex items-center justify-end gap-1 text-sm font-semibold text-emerald-600">
                        <TrendingUp className="h-3.5 w-3.5" />+{n.yoyAppreciation}%
                      </p>
                      <p className="text-[11px] text-muted-foreground">{n.avgDaysOnMarket} days on market</p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-4 text-center">
                    <MiniStat icon={Building2} value={`${n.commute.googleKw}m`} label="Google KW" />
                    <MiniStat icon={Train} value={`${n.commute.ionStop.minutes}m`} label="ION stop" />
                    <MiniStat icon={Car} value={`${n.commute.highway401}m`} label="Hwy 401" />
                  </div>

                  <p className="mt-4 flex items-center gap-1.5 text-sm font-medium text-slate-ink transition-colors group-hover:text-gold-bright">
                    View the numbers <ArrowUpRight className="h-4 w-4" />
                  </p>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      <NeighbourhoodDialog
        neighbourhood={selected}
        onOpenChange={(open) => !open && setSelected(null)}
      />
    </section>
  );
}

function MiniStat({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Building2;
  value: string;
  label: string;
}) {
  return (
    <div>
      <Icon className="mx-auto h-3.5 w-3.5 text-gold" />
      <p className="mt-1.5 text-sm font-semibold text-slate-ink">{value}</p>
      <p className="text-[10px] leading-tight text-muted-foreground">{label}</p>
    </div>
  );
}

function NeighbourhoodDialog({
  neighbourhood: n,
  onOpenChange,
}: {
  neighbourhood: Neighbourhood | null;
  onOpenChange: (open: boolean) => void;
}) {
  if (!n) return null;

  const peak = Math.max(...n.priceHistory.map((p) => p.median));
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${n.coords.lng - 0.028}%2C${n.coords.lat - 0.018}%2C${n.coords.lng + 0.028}%2C${n.coords.lat + 0.018}&layer=mapnik&marker=${n.coords.lat}%2C${n.coords.lng}`;

  return (
    <Dialog open={!!n} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0">
        <div className="relative h-48 w-full overflow-hidden rounded-t-2xl sm:h-56">
          <Image src={n.image} alt={n.name} fill sizes="768px" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-ink/90 to-slate-ink/20" />
          <div className="absolute inset-x-6 bottom-5">
            <Badge variant="gold">{n.city}</Badge>
            <h3 className="heading-serif mt-2 text-3xl font-semibold text-white">{n.name}</h3>
          </div>
        </div>

        <div className="px-6 pb-7 sm:px-8">
          <DialogHeader className="sr-only">
            <DialogTitle>{n.name}</DialogTitle>
            <DialogDescription>{n.tagline}</DialogDescription>
          </DialogHeader>

          <p className="text-sm leading-relaxed text-muted-foreground">{n.description}</p>

          {/* Micro-market trends */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile label="Median price" value={formatCurrency(n.medianPrice)} />
            <StatTile label="Price / sq ft" value={`$${n.pricePerSqft}`} />
            <StatTile label="Days on market" value={`${n.avgDaysOnMarket}`} accent />
            <StatTile label="List-to-sale" value={`${n.listToSaleRatio}%`} accent />
          </div>

          {/* Five-year median trend */}
          <div className="mt-7">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
              Five-year median
            </h4>
            <div className="mt-4 flex items-end gap-3">
              {n.priceHistory.map((p) => (
                <div key={p.year} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-[11px] font-medium text-slate-ink">
                    {formatCompactCurrency(p.median)}
                  </span>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(p.median / peak) * 100}px` }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    className={cn(
                      'w-full rounded-t-md',
                      p.year === n.priceHistory[n.priceHistory.length - 1].year
                        ? 'bg-gradient-to-t from-gold to-gold-bright'
                        : 'bg-sand-dark',
                    )}
                  />
                  <span className="text-[10px] text-muted-foreground">{p.year}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-7 grid gap-6 sm:grid-cols-2">
            <div>
              <h4 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
                <Clock className="h-3.5 w-3.5" /> Commute
              </h4>
              <ul className="mt-3 space-y-2.5 text-sm">
                <CommuteRow icon={Building2} label="Google KW / Tech District" value={`${n.commute.googleKw} min`} />
                <CommuteRow icon={GraduationCap} label="David Johnston R&D Park" value={`${n.commute.rdPark} min`} />
                <CommuteRow icon={Train} label={`ION — ${n.commute.ionStop.name}`} value={`${n.commute.ionStop.minutes} min`} />
                <CommuteRow icon={Train} label="Kitchener GO station" value={`${n.commute.goStation} min`} />
                <CommuteRow icon={Car} label="Highway 401" value={`${n.commute.highway401} min`} />
                <CommuteRow icon={Train} label="Union Station via GO" value={`${n.commute.torontoUnionGo} min`} />
                <CommuteRow icon={Footprints} label="Walk Score" value={`${n.walkScore}/100`} />
              </ul>
            </div>

            <div>
              <h4 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
                <GraduationCap className="h-3.5 w-3.5" /> Schools
              </h4>
              <ul className="mt-3 space-y-2.5">
                {n.schools.map((s) => (
                  <li key={s.name} className="flex items-center justify-between gap-3 text-sm">
                    <span className="min-w-0">
                      <span className="block truncate text-slate-ink/85">{s.name}</span>
                      <span className="text-[11px] text-muted-foreground">{s.board}</span>
                    </span>
                    <span className="shrink-0 rounded-md bg-secondary px-2 py-1 text-xs font-semibold text-slate-ink">
                      {s.rating.toFixed(1)}
                    </span>
                  </li>
                ))}
              </ul>

              <h4 className="mt-6 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
                <MapPin className="h-3.5 w-3.5" /> Nearby
              </h4>
              <div className="mt-3 flex flex-wrap gap-2">
                {n.amenities.map((a) => (
                  <span
                    key={a}
                    className="rounded-full bg-secondary px-3 py-1.5 text-xs text-slate-ink/75"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive map */}
          <div className="mt-7 overflow-hidden rounded-xl border border-border">
            <iframe
              title={`Map of ${n.name}`}
              src={mapSrc}
              className="h-64 w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="gold" className="flex-1">
              <a href="#valuation">What&apos;s my {n.name} home worth?</a>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <a href="#contact">Ask us about {n.name}</a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StatTile({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={cn('rounded-xl p-3.5', accent ? 'bg-gold/10' : 'bg-secondary')}>
      <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold text-slate-ink">{value}</p>
    </div>
  );
}

function CommuteRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Home;
  label: string;
  value: string;
}) {
  return (
    <li className="flex items-center justify-between gap-3">
      <span className="flex min-w-0 items-center gap-2 text-slate-ink/75">
        <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <span className="truncate">{label}</span>
      </span>
      <span className="shrink-0 font-semibold text-slate-ink">{value}</span>
    </li>
  );
}
