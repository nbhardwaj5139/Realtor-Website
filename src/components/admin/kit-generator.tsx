'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Copy, Download, Loader2, Sparkles, Wand2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Label, FieldError } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/toast';
import { PROPERTY_TYPES } from '@/lib/data';
import { listingKitSchema, type ListingKitValues } from '@/lib/schemas';
import type { ListingKit } from '@/lib/listing-kit';
import { cn } from '@/lib/utils';

const TONES: { value: ListingKitValues['tone']; label: string }[] = [
  { value: 'luxury', label: 'Modern luxury' },
  { value: 'family', label: 'Family-focused' },
  { value: 'investor', label: 'Investor' },
  { value: 'first-time', label: 'First-time buyer' },
];

export function KitGenerator() {
  const [kit, setKit] = useState<ListingKit | null>(null);
  const { toast } = useToast();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ListingKitValues>({
    resolver: zodResolver(listingKitSchema),
    defaultValues: {
      address: '',
      mlsId: '',
      city: 'Waterloo',
      neighbourhood: '',
      propertyType: 'Single Family',
      price: 899000,
      beds: 4,
      baths: 3,
      sqft: 2200,
      lotSize: '',
      highlights: '',
      openHouse: '',
      tone: 'luxury',
    },
  });

  async function onSubmit(data: ListingKitValues) {
    try {
      const res = await fetch('/api/admin/listing-kit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error ?? 'Generation failed');
      setKit(payload.kit as ListingKit);
      toast({
        title: 'Kit ready',
        description:
          payload.kit.source === 'claude'
            ? 'Written by Claude from your listing details.'
            : 'Generated from the built-in templates (no API key configured).',
      });
    } catch (error) {
      toast({
        variant: 'error',
        title: "Couldn't build the kit",
        description: error instanceof Error ? error.message : undefined,
      });
    }
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-2xl border border-border bg-white p-6 shadow-card"
        noValidate
      >
        <div className="mb-6 flex items-center gap-2.5">
          <Wand2 className="h-5 w-5 text-gold-bright" />
          <h2 className="heading-serif text-lg font-semibold text-slate-ink">Listing details</h2>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="kit-address">Property address</Label>
            <Input id="kit-address" className="mt-2" placeholder="312 Laurelwood Drive" {...register('address')} />
            <FieldError>{errors.address?.message}</FieldError>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="kit-city">City</Label>
              <Input id="kit-city" className="mt-2" {...register('city')} />
              <FieldError>{errors.city?.message}</FieldError>
            </div>
            <div>
              <Label htmlFor="kit-hood">
                Neighbourhood <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input id="kit-hood" className="mt-2" placeholder="Laurelwood" {...register('neighbourhood')} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="kit-mls">
                MLS ID <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input id="kit-mls" className="mt-2" placeholder="X40284821" {...register('mlsId')} />
            </div>
            <div>
              <Label htmlFor="kit-type">Property type</Label>
              <Controller
                control={control}
                name="propertyType"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="kit-type" className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PROPERTY_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="kit-price">List price</Label>
              <Input id="kit-price" type="number" className="mt-2" {...register('price')} />
              <FieldError>{errors.price?.message}</FieldError>
            </div>
            <div>
              <Label htmlFor="kit-sqft">Square footage</Label>
              <Input id="kit-sqft" type="number" className="mt-2" {...register('sqft')} />
              <FieldError>{errors.sqft?.message}</FieldError>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="kit-beds">Beds</Label>
              <Input id="kit-beds" type="number" className="mt-2" {...register('beds')} />
            </div>
            <div>
              <Label htmlFor="kit-baths">Baths</Label>
              <Input id="kit-baths" type="number" className="mt-2" {...register('baths')} />
            </div>
            <div>
              <Label htmlFor="kit-year">Year built</Label>
              <Input id="kit-year" type="number" className="mt-2" placeholder="2006" {...register('yearBuilt')} />
            </div>
          </div>

          <div>
            <Label htmlFor="kit-lot">
              Lot size <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input id="kit-lot" className="mt-2" placeholder="48 x 112 ft" {...register('lotSize')} />
          </div>

          <div>
            <Label htmlFor="kit-highlights">Features & highlights</Label>
            <Textarea
              id="kit-highlights"
              className="mt-2"
              placeholder="Finished basement, chef's kitchen with quartz island, backs onto trail, EV rough-in, 2023 roof"
              {...register('highlights')}
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              Comma-separated. Only what you enter here is described — nothing is invented.
            </p>
          </div>

          <div>
            <Label htmlFor="kit-open">
              Open house <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input id="kit-open" className="mt-2" placeholder="Sat & Sun, 2–4 PM" {...register('openHouse')} />
          </div>

          <div>
            <Label>Tone</Label>
            <Controller
              control={control}
              name="tone"
              render={({ field }) => (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {TONES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => field.onChange(t.value)}
                      className={cn(
                        'rounded-xl border px-3 py-2.5 text-sm font-medium transition-all',
                        field.value === t.value
                          ? 'border-slate-ink bg-slate-ink text-white'
                          : 'border-input bg-white text-slate-ink/75 hover:border-gold',
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              )}
            />
          </div>
        </div>

        <Button type="submit" variant="gold" size="lg" className="mt-7 w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Writing the kit…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" /> Generate marketing kit
            </>
          )}
        </Button>
      </form>

      <div>
        {kit ? (
          <KitOutput kit={kit} />
        ) : (
          <div className="flex h-full min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-white p-12 text-center">
            <Sparkles className="h-10 w-10 text-muted-foreground/40" strokeWidth={1.5} />
            <p className="mt-4 font-medium text-slate-ink">Your kit will appear here</p>
            <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Fill in the listing on the left and we&apos;ll write the MLS description, the
              Instagram caption with KW hashtags, an email blast and a print-ready open house
              flyer.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function KitOutput({ kit }: { kit: ListingKit }) {
  const captionWithTags = `${kit.instagramCaption}\n\n${kit.hashtags.join(' ')}`;

  function downloadFlyer() {
    const blob = new Blob([kit.flyerHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'open-house-flyer.html';
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-6 shadow-card">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="heading-serif text-lg font-semibold text-slate-ink">Marketing kit</h2>
        <Badge variant={kit.source === 'claude' ? 'gold' : 'muted'}>
          {kit.source === 'claude' ? 'Written by Claude' : 'Template'}
        </Badge>
      </div>

      <Tabs defaultValue="mls">
        <TabsList className="flex w-full flex-wrap">
          <TabsTrigger value="mls">MLS</TabsTrigger>
          <TabsTrigger value="social">Instagram</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="flyer">Flyer</TabsTrigger>
        </TabsList>

        <TabsContent value="mls">
          <CopyBlock label="MLS property description" value={kit.mlsDescription} />
        </TabsContent>

        <TabsContent value="social">
          <CopyBlock label="Instagram caption" value={captionWithTags} />
          <div className="mt-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Hashtags
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {kit.hashtags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-slate-ink"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="email">
          <CopyBlock label="Subject line" value={kit.emailBlast.subject} rows={1} />
          <div className="mt-4">
            <CopyBlock label="Email body" value={kit.emailBlast.body} />
          </div>
        </TabsContent>

        <TabsContent value="flyer">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Open house flyer
            </p>
            <Button size="sm" variant="outline" onClick={downloadFlyer}>
              <Download className="h-3.5 w-3.5" /> Download HTML
            </Button>
          </div>
          <div className="mt-3 overflow-hidden rounded-xl border border-border bg-secondary">
            <iframe
              title="Open house flyer preview"
              srcDoc={kit.flyerHtml}
              className="h-[640px] w-full bg-white"
              sandbox=""
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Open the downloaded file and print to PDF at Letter size for a ready-to-hand-out flyer.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CopyBlock({
  label,
  value,
  rows = 10,
}: {
  label: string;
  value: string;
  rows?: number;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — the textarea is still selectable */
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </p>
        <Button size="sm" variant="ghost" onClick={copy}>
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-600" /> Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" /> Copy
            </>
          )}
        </Button>
      </div>
      <textarea
        readOnly
        rows={rows}
        value={value}
        className="mt-2 w-full resize-y rounded-xl border border-input bg-secondary/50 p-4 font-sans text-sm leading-relaxed text-slate-ink focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
      />
    </div>
  );
}
