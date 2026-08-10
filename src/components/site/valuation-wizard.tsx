'use client';

import { useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Bath,
  BedDouble,
  Building2,
  Check,
  Home,
  Loader2,
  Lock,
  MapPin,
  Ruler,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label, FieldError } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';
import { neighbourhoods, PROPERTY_TYPES, RENOVATIONS, SELLING_TIMELINES } from '@/lib/data';
import { valuationSchema, type ValuationFormValues } from '@/lib/schemas';
import { estimateValue, type ValuationResult } from '@/lib/valuation';
import { cn, formatCurrency } from '@/lib/utils';
import type { PropertyType } from '@/lib/types';

const STEPS = [
  { id: 'address', label: 'Address' },
  { id: 'type', label: 'Property' },
  { id: 'details', label: 'Details' },
  { id: 'unlock', label: 'Your report' },
] as const;

const STEP_FIELDS: Record<number, (keyof ValuationFormValues)[]> = {
  0: ['address', 'neighbourhoodId'],
  1: ['propertyType'],
  2: ['beds', 'baths', 'sqft', 'renovations'],
  3: ['name', 'email', 'phone', 'timeline', 'consent'],
};

const PROPERTY_ICONS: Record<PropertyType, typeof Home> = {
  'Single Family': Home,
  'Semi-Detached': Home,
  Townhouse: Building2,
  Condo: Building2,
};

export function ValuationWizard({ className }: { className?: string }) {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ValuationResult | null>(null);
  const { toast } = useToast();

  const {
    register,
    control,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors },
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

  const values = watch();

  /** Live preview shown (blurred) behind the lead gate on the final step. */
  const preview = useMemo(() => {
    if (!values.neighbourhoodId) return null;
    return estimateValue({
      neighbourhoodId: values.neighbourhoodId,
      propertyType: values.propertyType,
      beds: Number(values.beds) || 3,
      baths: Number(values.baths) || 2,
      sqft: values.sqft ? Number(values.sqft) : undefined,
      renovations: values.renovations ?? [],
    });
  }, [values.neighbourhoodId, values.propertyType, values.beds, values.baths, values.sqft, values.renovations]);

  async function next() {
    const valid = await trigger(STEP_FIELDS[step]);
    if (!valid) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function onSubmit(data: ValuationFormValues) {
    setSubmitting(true);
    try {
      const res = await fetch('/api/valuation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error ?? 'Something went wrong');

      setResult(payload.estimate as ValuationResult);
      toast({
        title: 'Your report is on its way',
        description: `We've emailed the full breakdown to ${data.email}.`,
      });
    } catch (error) {
      toast({
        variant: 'error',
        title: "That didn't go through",
        description:
          error instanceof Error ? error.message : 'Please try again or call us directly.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return <ValuationResultPanel result={result} values={values} className={className} />;
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-white/10 bg-white/95 shadow-luxe backdrop-blur-xl',
        className,
      )}
    >
      <div className="border-b border-border bg-gradient-to-r from-slate-ink to-slate-deep px-6 py-5 sm:px-8">
        <div className="flex items-center gap-2 text-gold">
          <Sparkles className="h-4 w-4" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em]">
            Instant KW valuation
          </span>
        </div>
        <h3 className="heading-serif mt-2 text-2xl font-medium text-white sm:text-[1.75rem]">
          What&apos;s your KW home worth right now?
        </h3>
        <p className="mt-2 text-sm text-white/60">
          Four questions. Roughly forty seconds. No account, no phone tag.
        </p>
      </div>

      <div className="px-6 pb-7 pt-6 sm:px-8">
        {/* Step rail */}
        <div className="mb-7">
          <Progress value={((step + 1) / STEPS.length) * 100} className="mb-4" />
          <ol className="flex items-center justify-between">
            {STEPS.map((s, i) => (
              <li key={s.id} className="flex items-center gap-2">
                <span
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold transition-colors',
                    i < step
                      ? 'bg-gold text-slate-ink'
                      : i === step
                        ? 'bg-slate-ink text-white'
                        : 'bg-secondary text-muted-foreground',
                  )}
                >
                  {i < step ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
                </span>
                <span
                  className={cn(
                    'hidden text-xs font-medium sm:inline',
                    i === step ? 'text-slate-ink' : 'text-muted-foreground',
                  )}
                >
                  {s.label}
                </span>
              </li>
            ))}
          </ol>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="min-h-[290px]"
            >
              {step === 0 && (
                <div className="space-y-5">
                  <div>
                    <Label htmlFor="address">Street address</Label>
                    <div className="relative mt-2">
                      <MapPin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="address"
                        placeholder="312 Laurelwood Drive"
                        className="pl-11"
                        aria-invalid={!!errors.address}
                        {...register('address')}
                      />
                    </div>
                    <FieldError>{errors.address?.message}</FieldError>
                  </div>

                  <div>
                    <Label htmlFor="neighbourhoodId">Neighbourhood</Label>
                    <Controller
                      control={control}
                      name="neighbourhoodId"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger id="neighbourhoodId" className="mt-2">
                            <SelectValue placeholder="Choose your neighbourhood" />
                          </SelectTrigger>
                          <SelectContent>
                            {neighbourhoods.map((n) => (
                              <SelectItem key={n.id} value={n.id}>
                                {n.name} · {n.city}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <FieldError>{errors.neighbourhoodId?.message}</FieldError>
                  </div>

                  {values.neighbourhoodId && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl border border-gold/25 bg-gold/5 p-4"
                    >
                      {(() => {
                        const n = neighbourhoods.find((x) => x.id === values.neighbourhoodId)!;
                        return (
                          <div className="flex items-start gap-3">
                            <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-gold-bright" />
                            <p className="text-sm leading-relaxed text-slate-ink/80">
                              <strong className="font-semibold">{n.name}</strong> is up{' '}
                              {n.yoyAppreciation}% year over year, averaging{' '}
                              {n.avgDaysOnMarket} days on market at {n.listToSaleRatio}% of list.
                            </p>
                          </div>
                        );
                      })()}
                    </motion.div>
                  )}
                </div>
              )}

              {step === 1 && (
                <div>
                  <Label>Property type</Label>
                  <Controller
                    control={control}
                    name="propertyType"
                    render={({ field }) => (
                      <div className="mt-3 grid grid-cols-2 gap-3">
                        {PROPERTY_TYPES.map((type) => {
                          const Icon = PROPERTY_ICONS[type];
                          const active = field.value === type;
                          return (
                            <button
                              key={type}
                              type="button"
                              onClick={() => field.onChange(type)}
                              className={cn(
                                'group flex flex-col items-start gap-3 rounded-xl border p-4 text-left transition-all duration-300',
                                active
                                  ? 'border-slate-ink bg-slate-ink text-white shadow-md'
                                  : 'border-input bg-white hover:border-gold hover:shadow-sm',
                              )}
                            >
                              <Icon
                                className={cn(
                                  'h-5 w-5 transition-colors',
                                  active ? 'text-gold' : 'text-muted-foreground',
                                )}
                              />
                              <span className="text-sm font-medium">{type}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  />
                  <FieldError>{errors.propertyType?.message}</FieldError>

                  <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
                    Not sure how yours is classified? Pick the closest — we&apos;ll confirm it
                    against the assessment roll in your full report.
                  </p>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <StepperField
                      label="Bedrooms"
                      icon={BedDouble}
                      value={Number(values.beds)}
                      onChange={(v) => setValue('beds', v, { shouldValidate: true })}
                      min={1}
                      max={8}
                    />
                    <StepperField
                      label="Bathrooms"
                      icon={Bath}
                      value={Number(values.baths)}
                      onChange={(v) => setValue('baths', v, { shouldValidate: true })}
                      min={1}
                      max={8}
                    />
                  </div>

                  <div>
                    <Label htmlFor="sqft">
                      Approx. square footage <span className="text-muted-foreground">(optional)</span>
                    </Label>
                    <div className="relative mt-2">
                      <Ruler className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="sqft"
                        type="number"
                        inputMode="numeric"
                        placeholder="2,100"
                        className="pl-11"
                        {...register('sqft')}
                      />
                    </div>
                    <FieldError>{errors.sqft?.message}</FieldError>
                  </div>

                  <div>
                    <Label>Recent upgrades</Label>
                    <Controller
                      control={control}
                      name="renovations"
                      render={({ field }) => (
                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                          {RENOVATIONS.map((reno) => {
                            const checked = field.value?.includes(reno.id);
                            return (
                              <label
                                key={reno.id}
                                className={cn(
                                  'flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm transition-all',
                                  checked
                                    ? 'border-gold bg-gold/8'
                                    : 'border-input bg-white hover:border-gold/50',
                                )}
                              >
                                <Checkbox
                                  checked={checked}
                                  onCheckedChange={(state) => {
                                    const set = new Set(field.value ?? []);
                                    if (state) {
                                      // "Original / needs updating" is mutually exclusive.
                                      if (reno.id === 'none') set.clear();
                                      else set.delete('none');
                                      set.add(reno.id);
                                    } else {
                                      set.delete(reno.id);
                                    }
                                    field.onChange([...set]);
                                  }}
                                />
                                <span className="leading-tight">{reno.label}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5">
                  {/* Blurred teaser — the value is visibly *there*, just gated. */}
                  {preview && (
                    <div className="relative overflow-hidden rounded-xl border border-slate-ink/10 bg-slate-ink p-5 text-center">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
                        Your estimated range
                      </p>
                      <p
                        className="mt-2 select-none font-serif text-3xl font-semibold text-white"
                        style={{ filter: 'blur(9px)' }}
                        aria-hidden="true"
                      >
                        {formatCurrency(preview.low)} – {formatCurrency(preview.high)}
                      </p>
                      <div className="mt-3 flex items-center justify-center gap-2 text-xs text-white/60">
                        <Lock className="h-3.5 w-3.5" />
                        Unlock the range, the comps and the PDF breakdown
                      </div>
                    </div>
                  )}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Label htmlFor="name">Full name</Label>
                      <Input
                        id="name"
                        className="mt-2"
                        placeholder="Jordan Whitfield"
                        aria-invalid={!!errors.name}
                        {...register('name')}
                      />
                      <FieldError>{errors.name?.message}</FieldError>
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        className="mt-2"
                        placeholder="you@example.com"
                        aria-invalid={!!errors.email}
                        {...register('email')}
                      />
                      <FieldError>{errors.email?.message}</FieldError>
                    </div>
                    <div>
                      <Label htmlFor="phone">
                        Phone <span className="text-muted-foreground">(optional)</span>
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        className="mt-2"
                        placeholder="(519) 555-0142"
                        {...register('phone')}
                      />
                      <FieldError>{errors.phone?.message}</FieldError>
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="timeline">When are you thinking of selling?</Label>
                      <Controller
                        control={control}
                        name="timeline"
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger id="timeline" className="mt-2">
                              <SelectValue placeholder="Choose a timeline" />
                            </SelectTrigger>
                            <SelectContent>
                              {SELLING_TIMELINES.map((t) => (
                                <SelectItem key={t} value={t}>
                                  {t}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <FieldError>{errors.timeline?.message}</FieldError>
                    </div>
                  </div>

                  <Controller
                    control={control}
                    name="consent"
                    render={({ field }) => (
                      <label className="flex cursor-pointer items-start gap-3">
                        <Checkbox
                          checked={!!field.value}
                          onCheckedChange={(state) => field.onChange(state === true)}
                          className="mt-0.5"
                        />
                        <span className="text-xs leading-relaxed text-muted-foreground">
                          Email me my valuation report and occasional KW market updates. No spam,
                          unsubscribe anytime.
                        </span>
                      </label>
                    )}
                  />
                  <FieldError>{errors.consent?.message}</FieldError>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-7 flex items-center gap-3">
            {step > 0 && (
              <Button type="button" variant="outline" onClick={back} className="px-5">
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
            )}
            {step < STEPS.length - 1 ? (
              <Button type="button" onClick={next} className="flex-1">
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" variant="gold" className="flex-1" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Building your report…
                  </>
                ) : (
                  <>
                    Show my home value <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

function StepperField({
  label,
  icon: Icon,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  icon: typeof BedDouble;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-2 flex h-12 items-center justify-between rounded-xl border border-input bg-white px-2 shadow-sm">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-lg font-medium text-slate-ink transition-colors hover:bg-secondary disabled:opacity-30"
          aria-label={`Decrease ${label.toLowerCase()}`}
        >
          −
        </button>
        <span className="flex items-center gap-2 text-base font-semibold text-slate-ink">
          <Icon className="h-4 w-4 text-gold" />
          {value}
          {value >= max && '+'}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-lg font-medium text-slate-ink transition-colors hover:bg-secondary disabled:opacity-30"
          aria-label={`Increase ${label.toLowerCase()}`}
        >
          +
        </button>
      </div>
    </div>
  );
}

function ValuationResultPanel({
  result,
  values,
  className,
}: {
  result: ValuationResult;
  values: ValuationFormValues;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'overflow-hidden rounded-2xl border border-white/10 bg-white shadow-luxe',
        className,
      )}
    >
      <div className="bg-gradient-to-br from-slate-ink to-slate-deep px-6 py-8 text-center sm:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
          {values.address} · {result.neighbourhoodName}
        </p>
        <p className="heading-serif mt-4 text-[1.75rem] font-semibold leading-tight text-white sm:text-4xl">
          {formatCurrency(result.low)}
          <span className="mx-2 text-gold">–</span>
          {formatCurrency(result.high)}
        </p>
        <p className="mt-3 text-sm text-white/60">
          Midpoint {formatCurrency(result.mid)} · about ${result.pricePerSqft}/sq ft ·{' '}
          <span className="capitalize">{result.confidence}</span> confidence
        </p>
      </div>

      <div className="space-y-6 px-6 py-7 sm:px-8">
        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
            What moved your number
          </h4>
          <ul className="mt-3 space-y-2">
            {result.drivers.map((d) => (
              <li
                key={d.label}
                className="flex items-center justify-between gap-4 border-b border-border pb-2 text-sm last:border-0"
              >
                <span className="text-slate-ink/80">{d.label}</span>
                <span
                  className={cn(
                    'shrink-0 font-semibold tabular-nums',
                    d.impact >= 0 ? 'text-emerald-600' : 'text-destructive',
                  )}
                >
                  {d.impact >= 0 ? '+' : ''}
                  {(d.impact * 100).toFixed(1)}%
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
            Recent comparable sales
          </h4>
          <div className="mt-3 space-y-2">
            {result.comparables.map((c) => (
              <div
                key={c.address}
                className="flex items-center justify-between gap-4 rounded-lg bg-secondary/60 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-ink">{c.address}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.beds} bed · {c.baths} bath · {c.sqft.toLocaleString()} sq ft ·{' '}
                    {c.daysOnMarket} days
                  </p>
                </div>
                <span className="shrink-0 text-sm font-semibold tabular-nums text-slate-ink">
                  {formatCurrency(c.soldPrice)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <p className="rounded-xl bg-gold/8 p-4 text-sm leading-relaxed text-slate-ink/80">
          {result.marketNote}
        </p>

        <div className="rounded-xl border border-border p-4">
          <p className="text-sm font-semibold text-slate-ink">Your full PDF is in your inbox</p>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            An algorithm hasn&apos;t stood in your kitchen. We&apos;ll follow up within one business
            day with the comparable breakdown and what would actually move this number.
          </p>
          <Button asChild variant="gold" className="mt-4 w-full">
            <a href="#contact">Book the 15-minute pricing call</a>
          </Button>
        </div>

        <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
          This is an automated estimate generated from neighbourhood data, not an appraisal or an
          opinion of value under REBBA. Actual market value depends on condition, finishes and
          timing.
        </p>
      </div>
    </motion.div>
  );
}
