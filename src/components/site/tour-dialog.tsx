'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarCheck, CheckCircle2, Loader2, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Label, FieldError } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';
import { tourSchema, type TourFormValues } from '@/lib/schemas';
import { cn } from '@/lib/utils';
import type { Listing } from '@/lib/types';

const TIME_SLOTS = [
  '9:00 AM',
  '10:30 AM',
  '12:00 PM',
  '1:30 PM',
  '3:00 PM',
  '4:30 PM',
  '6:00 PM',
  '7:30 PM',
];

/**
 * Direct booking form. If NEXT_PUBLIC_BOOKING_URL is set (Calendly / Cal.com),
 * the scheduler is embedded instead — same modal, zero code changes.
 */
export function TourDialog({
  listing,
  open,
  onOpenChange,
}: {
  listing: Listing | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();
  const bookingUrl = process.env.NEXT_PUBLIC_BOOKING_URL;

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TourFormValues>({
    resolver: zodResolver(tourSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      preferredDate: '',
      preferredTime: '',
      tourType: 'in-person',
      message: '',
      listingId: listing?.id ?? '',
      listingAddress: listing?.address ?? '',
    },
    values: listing
      ? {
          name: '',
          email: '',
          phone: '',
          preferredDate: '',
          preferredTime: '',
          tourType: 'in-person',
          message: '',
          listingId: listing.id,
          listingAddress: `${listing.address}, ${listing.city}`,
        }
      : undefined,
  });

  async function onSubmit(data: TourFormValues) {
    try {
      const res = await fetch('/api/tour', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload?.error ?? 'Request failed');
      }
      setSubmitted(true);
      toast({
        title: 'Tour request sent',
        description: 'One of us will confirm your time shortly.',
      });
    } catch (error) {
      toast({
        variant: 'error',
        title: "We couldn't send that",
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    }
  }

  function handleOpenChange(next: boolean) {
    onOpenChange(next);
    if (!next) {
      setTimeout(() => {
        setSubmitted(false);
        reset();
      }, 250);
    }
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        {submitted ? (
          <div className="py-6 text-center">
            <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-600" strokeWidth={1.5} />
            <DialogTitle className="mt-5">You&apos;re on the calendar</DialogTitle>
            <DialogDescription className="mx-auto mt-3 max-w-sm">
              We&apos;ve got your request for {listing?.address}. Expect a confirmation text or
              email within the hour during business hours.
            </DialogDescription>
            <Button className="mt-7" onClick={() => handleOpenChange(false)}>
              Done
            </Button>
          </div>
        ) : bookingUrl ? (
          <>
            <DialogHeader>
              <DialogTitle>Book a private tour</DialogTitle>
              <DialogDescription>{listing?.address}</DialogDescription>
            </DialogHeader>
            <iframe
              title="Booking calendar"
              src={bookingUrl}
              className="h-[560px] w-full rounded-xl border border-border"
              loading="lazy"
            />
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Schedule a private tour</DialogTitle>
              <DialogDescription>
                {listing?.address}
                {listing ? `, ${listing.city}` : ''} — pick a window and we&apos;ll confirm within
                the hour.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <input type="hidden" {...register('listingId')} />
              <input type="hidden" {...register('listingAddress')} />

              <Controller
                control={control}
                name="tourType"
                render={({ field }) => (
                  <div className="grid grid-cols-2 gap-3">
                    {(
                      [
                        { value: 'in-person', label: 'In person', Icon: CalendarCheck },
                        { value: 'virtual', label: 'Virtual walkthrough', Icon: Video },
                      ] as const
                    ).map(({ value, label, Icon }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => field.onChange(value)}
                        className={cn(
                          'flex items-center gap-2.5 rounded-xl border p-3.5 text-sm font-medium transition-all',
                          field.value === value
                            ? 'border-slate-ink bg-slate-ink text-white'
                            : 'border-input bg-white text-slate-ink hover:border-gold',
                        )}
                      >
                        <Icon
                          className={cn(
                            'h-4 w-4',
                            field.value === value ? 'text-gold' : 'text-muted-foreground',
                          )}
                        />
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="tour-name">Full name</Label>
                  <Input id="tour-name" className="mt-2" {...register('name')} />
                  <FieldError>{errors.name?.message}</FieldError>
                </div>
                <div>
                  <Label htmlFor="tour-email">Email</Label>
                  <Input id="tour-email" type="email" className="mt-2" {...register('email')} />
                  <FieldError>{errors.email?.message}</FieldError>
                </div>
                <div>
                  <Label htmlFor="tour-phone">Phone</Label>
                  <Input id="tour-phone" type="tel" className="mt-2" {...register('phone')} />
                  <FieldError>{errors.phone?.message}</FieldError>
                </div>
                <div>
                  <Label htmlFor="tour-date">Preferred date</Label>
                  <Input
                    id="tour-date"
                    type="date"
                    min={today}
                    className="mt-2"
                    {...register('preferredDate')}
                  />
                  <FieldError>{errors.preferredDate?.message}</FieldError>
                </div>
                <div>
                  <Label htmlFor="tour-time">Preferred time</Label>
                  <Controller
                    control={control}
                    name="preferredTime"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id="tour-time" className="mt-2">
                          <SelectValue placeholder="Pick a time" />
                        </SelectTrigger>
                        <SelectContent>
                          {TIME_SLOTS.map((slot) => (
                            <SelectItem key={slot} value={slot}>
                              {slot}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FieldError>{errors.preferredTime?.message}</FieldError>
                </div>
              </div>

              <div>
                <Label htmlFor="tour-message">
                  Anything we should know? <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Textarea
                  id="tour-message"
                  className="mt-2"
                  placeholder="We're relocating from Toronto and can only see homes on weekends…"
                  {...register('message')}
                />
              </div>

              <Button type="submit" variant="gold" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Sending…
                  </>
                ) : (
                  'Request this tour'
                )}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
