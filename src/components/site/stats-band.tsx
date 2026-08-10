'use client';

import { motion } from 'framer-motion';
import { Counter } from '@/components/ui/counter';
import { Reveal } from '@/components/ui/reveal';
import { siteConfig } from '@/config/site';
import { marketStats } from '@/lib/data';
import { formatCurrency, formatPercent } from '@/lib/utils';

/**
 * Two distinct things live here:
 *
 *  1. Regional market context — always shown. Makes no claim about the team.
 *  2. Team track record — gated behind siteConfig.content.showPerformanceStats,
 *     because publishing sales volume or list-to-sale ratios that weren't
 *     supplied would be fabricating a record under a real agent's name.
 */
export function StatsBand() {
  const { headline, region } = marketStats;
  const showTeamStats = siteConfig.content.showPerformanceStats;

  return (
    <section className="border-y border-border bg-white py-16 md:py-20">
      <div className="container">
        {showTeamStats && (
          <div className="mb-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {headline.map((stat, i) => (
              <Reveal key={stat.id} delay={i * 0.08}>
                <div className="text-center sm:text-left">
                  <p className="heading-serif text-4xl font-semibold text-slate-ink lg:text-[2.75rem]">
                    <Counter value={stat.value} format={stat.format} suffix={stat.suffix} />
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-ink">{stat.label}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {stat.caption}
                  </p>

                  {stat.benchmark !== undefined && (
                    <BenchmarkBar
                      ours={stat.value}
                      theirs={stat.benchmark}
                      lowerIsBetter={stat.id === 'dom'}
                    />
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        )}

        <Reveal>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow mb-3">Waterloo Region market</p>
              <h2 className="heading-serif text-2xl font-medium text-slate-ink sm:text-3xl">
                Where the market sits right now.
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              {siteConfig.content.demoMode
                ? 'Sample figures shown for layout. Connect an MLS or CREA feed to publish live regional statistics.'
                : `Updated ${new Date(marketStats.updated).toLocaleDateString('en-CA', { month: 'long', year: 'numeric' })}.`}
            </p>
          </div>

          <div className="mt-8 grid gap-6 rounded-2xl bg-background p-6 sm:grid-cols-2 lg:grid-cols-4 lg:p-8">
            <RegionStat
              label="Regional median"
              value={formatCurrency(region.medianPrice)}
              sub={`${region.medianPriceYoY > 0 ? '+' : ''}${formatPercent(region.medianPriceYoY)} year over year`}
            />
            <RegionStat
              label="Active listings"
              value={region.activeListings.toLocaleString('en-CA')}
              sub={`${region.monthsOfInventory} months of inventory`}
            />
            <RegionStat
              label="Days on market"
              value={`${region.avgDaysOnMarket} days`}
              sub={`Sales ${region.salesYoY > 0 ? 'up' : 'down'} ${formatPercent(Math.abs(region.salesYoY))} YoY`}
            />
            <RegionStat
              label="List-to-sale ratio"
              value={formatPercent(region.listToSaleRatio)}
              sub="Regional average across all property types"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function BenchmarkBar({
  ours,
  theirs,
  lowerIsBetter,
}: {
  ours: number;
  theirs: number;
  lowerIsBetter: boolean;
}) {
  const max = Math.max(ours, theirs);
  const better = lowerIsBetter ? ours < theirs : ours > theirs;

  return (
    <div className="mt-4 space-y-2">
      <Bar width={(ours / max) * 100} label="Us" tone={better ? 'gold' : 'muted'} />
      <Bar width={(theirs / max) * 100} label="KW avg" tone="muted" />
    </div>
  );
}

function Bar({ width, label, tone }: { width: number; label: string; tone: 'gold' | 'muted' }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-12 shrink-0 text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-sand-dark">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${width}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className={
            tone === 'gold'
              ? 'h-full bg-gradient-to-r from-gold to-gold-bright'
              : 'h-full bg-slate-ink/25'
          }
        />
      </div>
    </div>
  );
}

function RegionStat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="heading-serif mt-1.5 text-2xl font-semibold text-slate-ink">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}
