'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { Bath, BedDouble, CalendarCheck, Car, Maximize, Play, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { SectionHeading } from '@/components/ui/section-heading';
import { TourDialog } from './tour-dialog';
import { listings, neighbourhoods } from '@/lib/data';
import { cn, formatCurrency } from '@/lib/utils';
import type { Listing, ListingStatus } from '@/lib/types';

const STATUS_META: Record<ListingStatus, { label: string; variant: 'default' | 'gold' | 'success' | 'warning' }> = {
  active: { label: 'Active', variant: 'success' },
  pending: { label: 'Pending', variant: 'warning' },
  'sold-above': { label: 'Sold above asking', variant: 'gold' },
};

const STATUS_FILTERS: { value: ListingStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'sold-above', label: 'Sold above asking' },
];

const TYPE_FILTERS = ['All types', 'Single Family', 'Semi-Detached', 'Townhouse', 'Condo'] as const;

const PRICE_BANDS = [
  { value: 'all', label: 'Any price', min: 0, max: Infinity },
  { value: 'under-700', label: 'Under $700K', min: 0, max: 700_000 },
  { value: '700-1m', label: '$700K – $1M', min: 700_000, max: 1_000_000 },
  { value: 'over-1m', label: '$1M+', min: 1_000_000, max: Infinity },
] as const;

export function ListingsShowcase() {
  const [status, setStatus] = useState<ListingStatus | 'all'>('all');
  const [type, setType] = useState<(typeof TYPE_FILTERS)[number]>('All types');
  const [band, setBand] = useState<(typeof PRICE_BANDS)[number]['value']>('all');
  const [tourListing, setTourListing] = useState<Listing | null>(null);
  const [videoListing, setVideoListing] = useState<Listing | null>(null);

  const visible = useMemo(() => {
    const priceBand = PRICE_BANDS.find((b) => b.value === band)!;
    return listings.filter((l) => {
      if (status !== 'all' && l.status !== status) return false;
      if (type !== 'All types' && l.propertyType !== type) return false;
      const price = l.soldPrice ?? l.price;
      return price >= priceBand.min && price < priceBand.max;
    });
  }, [status, type, band]);

  return (
    <section id="listings" className="section bg-white">
      <div className="container">
        <SectionHeading
          eyebrow="Featured listings"
          title="Homes we're representing right now."
          description="Every listing below launched with staging, architectural photography, a 3D tour and a paid campaign behind it. That's the whole difference."
          action={
            <Button asChild variant="outline">
              <a href="#contact">Get new listings first</a>
            </Button>
          }
        />

        {/* Filters */}
        <div className="mt-10 flex flex-col gap-4 rounded-2xl border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatus(f.value)}
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-medium transition-all',
                  status === f.value
                    ? 'bg-slate-ink text-white shadow-sm'
                    : 'bg-white text-slate-ink/70 hover:text-slate-ink',
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <select
              value={type}
              onChange={(e) => setType(e.target.value as (typeof TYPE_FILTERS)[number])}
              className="h-10 rounded-full border border-input bg-white px-4 text-sm text-slate-ink shadow-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/25"
              aria-label="Filter by property type"
            >
              {TYPE_FILTERS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <select
              value={band}
              onChange={(e) => setBand(e.target.value as (typeof PRICE_BANDS)[number]['value'])}
              className="h-10 rounded-full border border-input bg-white px-4 text-sm text-slate-ink shadow-sm focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/25"
              aria-label="Filter by price"
            >
              {PRICE_BANDS.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <motion.div layout className="mt-8 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {visible.map((listing, i) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                index={i}
                onTour={() => setTourListing(listing)}
                onVideo={() => setVideoListing(listing)}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {visible.length === 0 && (
          <p className="mt-12 text-center text-muted-foreground">
            Nothing matches those filters right now.{' '}
            <a href="#contact" className="font-medium text-slate-ink underline underline-offset-4">
              Tell us what you&apos;re looking for
            </a>{' '}
            and we&apos;ll send matches before they hit the board.
          </p>
        )}
      </div>

      <TourDialog
        listing={tourListing}
        open={!!tourListing}
        onOpenChange={(open) => !open && setTourListing(null)}
      />

      <Dialog open={!!videoListing} onOpenChange={(open) => !open && setVideoListing(null)}>
        <DialogContent className="max-w-3xl p-0" hideClose>
          <DialogTitle className="sr-only">
            Video tour — {videoListing?.address}
          </DialogTitle>
          <button
            onClick={() => setVideoListing(null)}
            className="absolute -top-11 right-0 rounded-full bg-white/10 p-2 text-white backdrop-blur transition-colors hover:bg-white/20"
            aria-label="Close video"
          >
            <X className="h-5 w-5" />
          </button>
          {videoListing && (
            <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black">
              <iframe
                src={videoListing.videoTourUrl}
                title={`Video tour of ${videoListing.address}`}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

function ListingCard({
  listing,
  index,
  onTour,
  onVideo,
}: {
  listing: Listing;
  index: number;
  onTour: () => void;
  onVideo: () => void;
}) {
  const meta = STATUS_META[listing.status];
  const hood = neighbourhoods.find((n) => n.id === listing.neighbourhoodId);
  const displayPrice = listing.soldPrice ?? listing.price;
  const overAsk = listing.soldPrice ? listing.soldPrice - listing.listPrice : 0;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.05, 0.3), ease: [0.22, 1, 0.36, 1] }}
      className="card-hover group overflow-hidden rounded-2xl border border-border bg-card shadow-card"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={listing.image}
          alt={`${listing.address}, ${listing.city}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-ink/70 via-transparent to-transparent opacity-70" />

        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <Badge variant={meta.variant}>{meta.label}</Badge>
          {overAsk > 0 && (
            <Badge variant="glass">+{formatCurrency(overAsk)} over</Badge>
          )}
        </div>

        <button
          onClick={onVideo}
          className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition-all hover:scale-110 hover:bg-gold hover:text-slate-ink"
          aria-label={`Play video tour of ${listing.address}`}
        >
          <Play className="ml-0.5 h-4 w-4 fill-current" />
        </button>

        <div className="absolute inset-x-4 bottom-4">
          <p className="heading-serif text-2xl font-semibold text-white">
            {formatCurrency(displayPrice)}
          </p>
          <p className="text-xs text-white/75">
            {hood?.name ?? listing.city} · {listing.daysOnMarket} days on market
          </p>
        </div>
      </div>

      <div className="p-5">
        <h3 className="heading-serif text-lg font-semibold leading-snug text-slate-ink">
          {listing.address}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {listing.city}, ON · {listing.propertyType}
        </p>

        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {listing.headline}
        </p>

        <div className="mt-4 grid grid-cols-4 gap-1 border-y border-border py-3.5 text-center">
          <Spec icon={BedDouble} value={listing.beds} label="beds" />
          <Spec icon={Bath} value={listing.baths} label="baths" />
          <Spec icon={Maximize} value={listing.sqft.toLocaleString()} label="sq ft" />
          <Spec icon={Car} value={listing.parking} label="parking" />
        </div>

        <div className="mt-4 flex gap-2">
          <Button onClick={onTour} className="flex-1" size="sm">
            <CalendarCheck className="h-4 w-4" /> Private tour
          </Button>
          <Button onClick={onVideo} variant="outline" size="sm" className="px-4">
            <Play className="h-3.5 w-3.5 fill-current" />
          </Button>
        </div>
      </div>
    </motion.article>
  );
}

function Spec({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof BedDouble;
  value: string | number;
  label: string;
}) {
  return (
    <div>
      <Icon className="mx-auto h-4 w-4 text-gold" />
      <p className="mt-1.5 text-sm font-semibold text-slate-ink">{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}
