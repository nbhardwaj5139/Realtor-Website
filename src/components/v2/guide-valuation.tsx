'use client';

import { useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Loader2, Lock } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { neighbourhoods, PROPERTY_TYPES, RENOVATIONS, SELLING_TIMELINES } from '@/lib/data';
import { valuationSchema, type ValuationFormValues } from '@/lib/schemas';
import { estimateValue, type ValuationResult } from '@/lib/valuation';
import { cn, formatCurrency } from '@/lib/utils';

/**
 * Single-screen valuation.
 *
 * v1 uses a four-step wizard. This is the same model and the same API, but every
 * field is visible at once and the estimate updates live as you fill it in —
 * the gate is only on the final reveal, so the visitor sees the tool working
 * before being asked for anything.
 */
export function GuideValuation() {
  const [result, setResult] = useState<ValuationResult | null>(null);
  const [gateOpen, setGateOpen] = useState(false);
  const { toast } = useToast();

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ValuationFormValues>({
    resolver: zodResolver(valuationSchema),
    mode: 'onTouched',
    defaultValues: {
      address: '',
      neighbourhoodId: '',
      propertyType: 'Single Family',
      beds: 3,
      baths: 2,
      renovations: [],
      name: '',
      email: '',
      phone: '',
      timeline: '',
    },
  });

  const v = watch();
  const ready = Boolean(v.neighbourhoodId);

  const preview = useMemo(() => {
    if (!v.neighbourhoodId) return null;
    return estimateValue({
      neighbourhoodId: v.neighbourhoodId,
      propertyType: v.propertyType,
      beds: Number(v.beds) || 3,
      baths: Number(v.baths) || 2,
      sqft: v.sqft ? Number(v.sqft) : undefined,
      renovations: v.renovations ?? [],
    });
  }, [v.neighbourhoodId, v.propertyType, v.beds, v.baths, v.sqft, v.renovations]);

  async function onSubmit(data: ValuationFormValues) {
    try {
      const res = await fetch('/api/valuation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error ?? 'Something went wrong');
      setResult(payload.estimate as ValuationResult);
      toast({ title: 'Report sent', description: `Full breakdown emailed to ${data.email}.` });
    } catch (error) {
      toast({
        variant: 'error',
        title: "That didn't go through",
        description: error instanceof Error ? error.message : undefined,
      });
    }
  }

  const shown = result ?? preview;

  return (
    <section id="valuation" className="border-b border-guide-line py-16 md:py-24">
      <div className="container">
        <div className="max-w-2xl">
          <p className="text-[13px] font-medium uppercase tracking-[0.14em] text-guide-forest">
            Home value
          </p>
          <h2 className="mt-4 text-[2rem] font-semibold leading-tight tracking-[-0.02em] text-guide-ink sm:text-[2.5rem]">
            What your place is worth today.
          </h2>
          <p className="mt-4 text-[17px] leading-relaxed text-guide-inkSoft">
            Fill this in and the estimate moves as you go. We only ask who you are at the end —
            and only if you want the comparable sales and the full breakdown.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:gap-8"
        >
          <div className="rounded-2xl border border-guide-line bg-white p-6 sm:p-8">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="g-address">Street address</Label>
                <input
                  id="g-address"
                  placeholder="312 Laurelwood Drive"
                  className={inputCls}
                  {...register('address')}
                />
                <Err>{errors.address?.message}</Err>
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="g-hood">Neighbourhood</Label>
                <select id="g-hood" className={inputCls} {...register('neighbourhoodId')}>
                  <option value="">Choose your neighbourhood</option>
                  {neighbourhoods.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.name} · {n.city}
                    </option>
                  ))}
                </select>
                <Err>{errors.neighbourhoodId?.message}</Err>
              </div>

              <div className="sm:col-span-2">
                <Label>Property type</Label>
                <Controller
                  control={control}
                  name="propertyType"
                  render={({ field }) => (
                    <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {PROPERTY_TYPES.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => field.onChange(t)}
                          className={cn(
                            'rounded-lg border px-2 py-2.5 text-[13px] transition-colors',
                            field.value === t
                              ? 'border-guide-forest bg-guide-forest text-white'
                              : 'border-guide-line bg-white text-guide-inkSoft hover:border-guide-forest/40',
                          )}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  )}
                />
              </div>

              <div>
                <Label htmlFor="g-beds">Bedrooms</Label>
                <input id="g-beds" type="number" min={1} max={10} className={inputCls} {...register('beds')} />
              </div>
              <div>
                <Label htmlFor="g-baths">Bathrooms</Label>
                <input id="g-baths" type="number" min={1} max={10} className={inputCls} {...register('baths')} />
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="g-sqft">
                  Square footage <span className="font-normal text-guide-muted">(optional)</span>
                </Label>
                <input id="g-sqft" type="number" placeholder="2,100" className={inputCls} {...register('sqft')} />
                <Err>{errors.sqft?.message}</Err>
              </div>

              <div className="sm:col-span-2">
                <Label>Recent upgrades</Label>
                <Controller
                  control={control}
                  name="renovations"
                  render={({ field }) => (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {RENOVATIONS.map((r) => {
                        const on = field.value?.includes(r.id);
                        return (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => {
                              const set = new Set(field.value ?? []);
                              if (on) set.delete(r.id);
                              else {
                                if (r.id === 'none') set.clear();
                                else set.delete('none');
                                set.add(r.id);
                              }
                              field.onChange([...set]);
                            }}
                            className={cn(
                              'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[13px] transition-colors',
                              on
                                ? 'border-guide-forest bg-guide-mint text-guide-ink'
                                : 'border-guide-line bg-white text-guide-inkSoft hover:border-guide-forest/40',
                            )}
                          >
                            {on && <Check className="h-3 w-3 text-guide-forest" strokeWidth={3} />}
                            {r.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                />
              </div>
            </div>

            {gateOpen && !result && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-7 border-t border-guide-line pt-7"
              >
                <p className="text-[15px] font-medium text-guide-ink">
                  Where should we send the full breakdown?
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label htmlFor="g-name">Full name</Label>
                    <input id="g-name" className={inputCls} {...register('name')} />
                    <Err>{errors.name?.message}</Err>
                  </div>
                  <div>
                    <Label htmlFor="g-email">Email</Label>
                    <input id="g-email" type="email" className={inputCls} {...register('email')} />
                    <Err>{errors.email?.message}</Err>
                  </div>
                  <div>
                    <Label htmlFor="g-phone">
                      Phone <span className="font-normal text-guide-muted">(optional)</span>
                    </Label>
                    <input id="g-phone" type="tel" className={inputCls} {...register('phone')} />
                    <Err>{errors.phone?.message}</Err>
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="g-timeline">Thinking of selling?</Label>
                    <select id="g-timeline" className={inputCls} {...register('timeline')}>
                      <option value="">Choose a timeline</option>
                      {SELLING_TIMELINES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <Err>{errors.timeline?.message}</Err>
                  </div>
                </div>

                <Controller
                  control={control}
                  name="consent"
                  render={({ field }) => (
                    <label className="mt-4 flex cursor-pointer items-start gap-2.5">
                      <input
                        type="checkbox"
                        checked={!!field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        className="mt-0.5 h-4 w-4 accent-guide-forest"
                      />
                      <span className="text-[13px] leading-relaxed text-guide-muted">
                        Email me the report and occasional Waterloo Region market updates.
                        Unsubscribe anytime.
                      </span>
                    </label>
                  )}
                />
                <Err>{errors.consent?.message}</Err>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-guide-forest px-5 py-3.5 text-[15px] font-medium text-white transition-colors hover:bg-guide-forestDark disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Building your report…
                    </>
                  ) : (
                    <>
                      Send me the full breakdown <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </div>

          {/* Live estimate */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="overflow-hidden rounded-2xl border border-guide-line bg-white">
              <div className="bg-guide-ink p-6 text-white sm:p-7">
                <p className="text-[12px] uppercase tracking-[0.14em] text-white/50">
                  {ready ? shown?.neighbourhoodName : 'Estimated range'}
                </p>
                {shown ? (
                  <p className="mt-2.5 text-[1.85rem] font-semibold leading-none tracking-[-0.02em] sm:text-[2.15rem]">
                    {formatCurrency(shown.low)}
                    <span className="mx-1.5 text-white/40">–</span>
                    {formatCurrency(shown.high)}
                  </p>
                ) : (
                  <p className="mt-2.5 text-[1.85rem] font-semibold leading-none text-white/25">
                    $— – $—
                  </p>
                )}
                <p className="mt-3 text-[14px] text-white/55">
                  {shown
                    ? `Midpoint ${formatCurrency(shown.mid)} · about $${shown.pricePerSqft}/sq ft`
                    : 'Pick a neighbourhood to see a range'}
                </p>
              </div>

              {shown && (
                <div className="p-6 sm:p-7">
                  <p className="text-[12px] font-medium uppercase tracking-wider text-guide-muted">
                    What moved it
                  </p>
                  <ul className="mt-3 space-y-2">
                    {shown.drivers.map((d) => (
                      <li key={d.label} className="flex items-baseline justify-between gap-3 text-[14px]">
                        <span className="text-guide-inkSoft">{d.label}</span>
                        <span
                          className={cn(
                            'shrink-0 font-medium tabular-nums',
                            d.impact >= 0 ? 'text-guide-forest' : 'text-guide-clay',
                          )}
                        >
                          {d.impact >= 0 ? '+' : ''}
                          {(d.impact * 100).toFixed(1)}%
                        </span>
                      </li>
                    ))}
                  </ul>

                  {result ? (
                    <div className="mt-6 border-t border-guide-line pt-5">
                      <p className="text-[12px] font-medium uppercase tracking-wider text-guide-muted">
                        Recent comparable sales
                      </p>
                      <ul className="mt-3 space-y-2.5">
                        {result.comparables.map((c) => (
                          <li key={c.address} className="text-[13px]">
                            <span className="block text-guide-ink">{c.address}</span>
                            <span className="text-guide-muted">
                              {c.beds} bed · {c.sqft.toLocaleString()} sq ft ·{' '}
                              {formatCurrency(c.soldPrice)}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <p className="mt-5 rounded-lg bg-guide-mint p-4 text-[13px] leading-relaxed text-guide-inkSoft">
                        {result.marketNote}
                      </p>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setGateOpen(true)}
                      className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-guide-line bg-guide-paper px-4 py-3 text-[14px] font-medium text-guide-ink transition-colors hover:border-guide-forest/40"
                    >
                      <Lock className="h-3.5 w-3.5 text-guide-muted" />
                      {gateOpen ? 'Fill in your details below' : 'Unlock comps + full breakdown'}
                    </button>
                  )}

                  <p className="mt-4 text-[11px] leading-relaxed text-guide-muted">
                    An automated estimate from neighbourhood data — not an appraisal or an opinion
                    of value under REBBA.
                  </p>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}

const inputCls =
  'mt-2 h-11 w-full rounded-lg border border-guide-line bg-white px-3.5 text-[15px] text-guide-ink outline-none transition-colors placeholder:text-guide-muted/70 focus:border-guide-forest focus:ring-2 focus:ring-guide-forest/15';

function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="text-[14px] font-medium text-guide-ink">
      {children}
    </label>
  );
}

function Err({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return <p className="mt-1.5 text-[12px] font-medium text-guide-clay">{children}</p>;
}
