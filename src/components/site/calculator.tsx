'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Calculator, Info, Landmark, PiggyBank, TrendingDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SectionHeading } from '@/components/ui/section-heading';
import { Reveal } from '@/components/ui/reveal';
import {
  calculateMortgage,
  PAYMENT_FREQUENCIES,
  type PaymentFrequency,
} from '@/lib/mortgage';
import { calculateLandTransferTax, minimumDownPayment } from '@/lib/ontario-tax';
import { cn, formatCurrency } from '@/lib/utils';

export function CalculatorSection() {
  const [price, setPrice] = useState(899_000);
  const [downPayment, setDownPayment] = useState(179_800);
  const [rate, setRate] = useState(4.59);
  const [amortization, setAmortization] = useState(25);
  const [frequency, setFrequency] = useState<PaymentFrequency>('monthly');
  const [firstTimeBuyer, setFirstTimeBuyer] = useState(false);
  const [propertyTax, setPropertyTax] = useState(5400);
  const [condoFee, setCondoFee] = useState(0);

  const mortgage = useMemo(
    () =>
      calculateMortgage({
        price,
        downPayment,
        interestRate: rate,
        amortization,
        paymentFrequency: frequency,
        propertyTaxAnnual: propertyTax,
        condoFeeMonthly: condoFee,
        otherMonthly: 180, // heat + home insurance placeholder
      }),
    [price, downPayment, rate, amortization, frequency, propertyTax, condoFee],
  );

  const ltt = useMemo(
    () => calculateLandTransferTax({ price, firstTimeBuyer }),
    [price, firstTimeBuyer],
  );

  const minDown = minimumDownPayment(price);
  const downPercent = price > 0 ? (downPayment / price) * 100 : 0;

  // Closing costs: LTT + legal + title + inspection + adjustments (rules of thumb).
  const legalFees = 2200;
  const titleInsurance = 450;
  const inspection = 550;
  const adjustments = Math.round(price * 0.001);
  const totalClosing = ltt.total + legalFees + titleInsurance + inspection + adjustments;
  const cashToClose = downPayment + totalClosing;

  function setPriceAndSyncDown(next: number) {
    const currentPercent = price > 0 ? downPayment / price : 0.2;
    setPrice(next);
    setDownPayment(Math.round(next * currentPercent));
  }

  return (
    <section id="calculator" className="section bg-background">
      <div className="container">
        <SectionHeading
          eyebrow="Ontario-calibrated numbers"
          title="What it actually costs to buy here."
          description="Ontario land transfer tax, the first-time buyer rebate, CMHC premiums and semi-annual compounding — all built in. And because Waterloo Region has no municipal land transfer tax, we show you what the same purchase would cost in Toronto."
        />

        <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_1.05fr]">
          {/* Inputs */}
          <Reveal from="left">
            <div className="rounded-2xl border border-border bg-white p-6 shadow-card sm:p-8">
              <div className="mb-7 flex items-center gap-2.5">
                <Calculator className="h-5 w-5 text-gold" />
                <h3 className="heading-serif text-xl font-semibold text-slate-ink">
                  Your purchase
                </h3>
              </div>

              <div className="space-y-7">
                <SliderField
                  label="Purchase price"
                  value={price}
                  display={formatCurrency(price)}
                  min={250_000}
                  max={3_000_000}
                  step={5_000}
                  onChange={setPriceAndSyncDown}
                />

                <div>
                  <div className="flex items-end justify-between">
                    <Label>Down payment</Label>
                    <span className="text-sm font-semibold text-slate-ink">
                      {formatCurrency(downPayment)}{' '}
                      <span className="text-muted-foreground">({downPercent.toFixed(1)}%)</span>
                    </span>
                  </div>
                  <Slider
                    className="mt-4"
                    value={[downPayment]}
                    min={Math.round(price * 0.05)}
                    max={price}
                    step={1000}
                    onValueChange={([v]) => setDownPayment(v)}
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[5, 10, 20, 35].map((pct) => (
                      <button
                        key={pct}
                        onClick={() => setDownPayment(Math.round(price * (pct / 100)))}
                        className={cn(
                          'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                          Math.abs(downPercent - pct) < 0.5
                            ? 'border-slate-ink bg-slate-ink text-white'
                            : 'border-border bg-white text-slate-ink/70 hover:border-gold',
                        )}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                  {!mortgage.meetsMinimumDown && (
                    <p className="mt-3 flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-xs leading-relaxed text-destructive">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      Federal minimum for this price is {formatCurrency(minDown)} — 5% on the first
                      $500K, 10% above that, 20% over $1.5M.
                    </p>
                  )}
                </div>

                <SliderField
                  label="Interest rate"
                  value={rate}
                  display={`${rate.toFixed(2)}%`}
                  min={1}
                  max={9}
                  step={0.01}
                  onChange={setRate}
                />

                <div>
                  <Label>Amortization</Label>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[15, 20, 25, 30].map((years) => (
                      <button
                        key={years}
                        onClick={() => setAmortization(years)}
                        className={cn(
                          'flex-1 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all',
                          amortization === years
                            ? 'border-slate-ink bg-slate-ink text-white'
                            : 'border-input bg-white text-slate-ink/75 hover:border-gold',
                        )}
                      >
                        {years} yr
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Payment frequency</Label>
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    {PAYMENT_FREQUENCIES.map((f) => (
                      <button
                        key={f.value}
                        onClick={() => setFrequency(f.value)}
                        className={cn(
                          'rounded-xl border px-3 py-2.5 text-xs font-medium leading-tight transition-all',
                          frequency === f.value
                            ? 'border-slate-ink bg-slate-ink text-white'
                            : 'border-input bg-white text-slate-ink/75 hover:border-gold',
                        )}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="property-tax">Property tax / year</Label>
                    <Input
                      id="property-tax"
                      type="number"
                      className="mt-2"
                      value={propertyTax}
                      onChange={(e) => setPropertyTax(Number(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="condo-fee">Condo fee / month</Label>
                    <Input
                      id="condo-fee"
                      type="number"
                      className="mt-2"
                      value={condoFee}
                      onChange={(e) => setCondoFee(Number(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gold/30 bg-gold/5 p-4">
                  <Checkbox
                    checked={firstTimeBuyer}
                    onCheckedChange={(state) => setFirstTimeBuyer(state === true)}
                    className="mt-0.5"
                  />
                  <span className="text-sm leading-relaxed text-slate-ink/85">
                    <strong className="font-semibold">I&apos;m a first-time home buyer</strong>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      Applies the Ontario rebate — up to $4,000 off provincial land transfer tax.
                    </span>
                  </span>
                </label>
              </div>
            </div>
          </Reveal>

          {/* Results */}
          <Reveal from="right" delay={0.1}>
            <Tabs defaultValue="payment">
              <TabsList className="w-full">
                <TabsTrigger value="payment" className="flex-1">
                  Payment
                </TabsTrigger>
                <TabsTrigger value="closing" className="flex-1">
                  Land transfer &amp; closing
                </TabsTrigger>
              </TabsList>

              <TabsContent value="payment">
                <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-card">
                  <div className="bg-gradient-to-br from-slate-ink to-slate-deep p-7 text-center sm:p-8">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
                      {mortgage.paymentLabel} payment
                    </p>
                    <motion.p
                      key={mortgage.payment}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="heading-serif mt-3 text-4xl font-semibold text-white sm:text-5xl"
                    >
                      {formatCurrency(mortgage.payment)}
                    </motion.p>
                    <p className="mt-3 text-sm text-white/60">
                      Principal &amp; interest ·{' '}
                      {formatCurrency(mortgage.monthlyEquivalent)}/month equivalent
                    </p>
                    {frequency === 'accelerated-biweekly' && (
                      <Badge variant="gold" className="mt-4">
                        Paid off in {mortgage.amortizationYears.toFixed(1)} years —{' '}
                        {(amortization - mortgage.amortizationYears).toFixed(1)} saved
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-1 p-6 sm:p-7">
                    <ResultRow label="Mortgage principal" value={formatCurrency(mortgage.principal)} />
                    {mortgage.insured && (
                      <ResultRow
                        label="CMHC insurance premium"
                        value={formatCurrency(mortgage.insurancePremium)}
                        hint="Added to the loan, not paid up front"
                      />
                    )}
                    <ResultRow
                      label="Total interest over term"
                      value={formatCurrency(mortgage.totalInterest)}
                    />
                    <ResultRow
                      label="Total paid"
                      value={formatCurrency(mortgage.totalPaid)}
                      className="border-b-0"
                    />

                    <div className="mt-5 rounded-xl bg-secondary p-5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Total monthly carrying cost
                      </p>
                      <p className="heading-serif mt-2 text-3xl font-semibold text-slate-ink">
                        {formatCurrency(mortgage.totalMonthlyCarrying)}
                      </p>
                      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                        Mortgage {formatCurrency(mortgage.monthlyEquivalent)} · property tax{' '}
                        {formatCurrency(propertyTax / 12)}
                        {condoFee > 0 && ` · condo fee ${formatCurrency(condoFee)}`} · heat &amp;
                        insurance {formatCurrency(180)}
                      </p>
                    </div>

                    {mortgage.insured && (
                      <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
                        With less than 20% down your mortgage must be insured. Reaching 20% removes
                        the {formatCurrency(mortgage.insurancePremium)} premium entirely.
                      </p>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="closing">
                <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-card">
                  <div className="bg-gradient-to-br from-slate-ink to-slate-deep p-7 text-center sm:p-8">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
                      Ontario land transfer tax
                    </p>
                    <motion.p
                      key={ltt.total}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="heading-serif mt-3 text-4xl font-semibold text-white sm:text-5xl"
                    >
                      {formatCurrency(ltt.total)}
                    </motion.p>
                    {firstTimeBuyer && ltt.provincialRebate > 0 && (
                      <Badge variant="gold" className="mt-4">
                        <PiggyBank className="h-3.5 w-3.5" />
                        {formatCurrency(ltt.provincialRebate)} first-time buyer rebate applied
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-1 p-6 sm:p-7">
                    <ResultRow
                      label="Provincial LTT (before rebate)"
                      value={formatCurrency(ltt.provincialTax)}
                    />
                    {firstTimeBuyer && (
                      <ResultRow
                        label="First-time buyer rebate"
                        value={`− ${formatCurrency(ltt.provincialRebate)}`}
                        positive
                      />
                    )}
                    <ResultRow
                      label="Municipal LTT (Waterloo Region)"
                      value="$0"
                      hint="Only Toronto charges one"
                      positive
                    />
                    <ResultRow label="Legal fees (est.)" value={formatCurrency(legalFees)} />
                    <ResultRow label="Title insurance (est.)" value={formatCurrency(titleInsurance)} />
                    <ResultRow label="Home inspection (est.)" value={formatCurrency(inspection)} />
                    <ResultRow
                      label="Adjustments (est.)"
                      value={formatCurrency(adjustments)}
                      className="border-b-0"
                    />

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl bg-secondary p-5">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          Closing costs
                        </p>
                        <p className="heading-serif mt-2 text-2xl font-semibold text-slate-ink">
                          {formatCurrency(totalClosing)}
                        </p>
                      </div>
                      <div className="rounded-xl bg-slate-ink p-5">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">
                          Cash to close
                        </p>
                        <p className="heading-serif mt-2 text-2xl font-semibold text-white">
                          {formatCurrency(cashToClose)}
                        </p>
                      </div>
                    </div>

                    {/* The KW advantage */}
                    <div className="mt-5 rounded-xl border border-gold/30 bg-gold/5 p-5">
                      <div className="flex items-start gap-3">
                        <TrendingDown className="mt-0.5 h-5 w-5 shrink-0 text-gold-bright" />
                        <div>
                          <p className="text-sm font-semibold text-slate-ink">
                            You save {formatCurrency(ltt.savingsVsToronto)} buying in KW
                          </p>
                          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                            The identical purchase inside Toronto would attract a municipal land
                            transfer tax on top of the provincial one —{' '}
                            {formatCurrency(ltt.torontoComparisonTotal)} in total versus{' '}
                            {formatCurrency(ltt.total)} here. Waterloo Region has no municipal LTT.
                          </p>
                        </div>
                      </div>
                    </div>

                    <p className="mt-5 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                      <Landmark className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
                      Rates reflect the current Ontario LTT brackets. Legal, title and inspection
                      figures are typical KW estimates — your lawyer will give you exact numbers.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-border bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm leading-relaxed text-muted-foreground">
                Want these numbers against a specific house?
              </p>
              <Button asChild variant="gold" className="shrink-0">
                <a href="#contact">Run it with us</a>
              </Button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function SliderField({
  label,
  value,
  display,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <div className="flex items-end justify-between">
        <Label>{label}</Label>
        <span className="text-sm font-semibold text-slate-ink">{display}</span>
      </div>
      <Slider
        className="mt-4"
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([v]) => onChange(v)}
      />
    </div>
  );
}

function ResultRow({
  label,
  value,
  hint,
  positive,
  className,
}: {
  label: string;
  value: string;
  hint?: string;
  positive?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('flex items-start justify-between gap-4 border-b border-border py-3', className)}>
      <div className="min-w-0">
        <p className="text-sm text-slate-ink/75">{label}</p>
        {hint && <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>}
      </div>
      <p
        className={cn(
          'shrink-0 text-sm font-semibold tabular-nums',
          positive ? 'text-emerald-600' : 'text-slate-ink',
        )}
      >
        {value}
      </p>
    </div>
  );
}
