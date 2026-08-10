'use client';

import { useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Play, Quote, Star, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { SectionHeading } from '@/components/ui/section-heading';
import { testimonials } from '@/lib/data';
import { cn } from '@/lib/utils';
import type { Testimonial } from '@/lib/types';

export function TestimonialsCarousel() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [playing, setPlaying] = useState<Testimonial | null>(null);

  const current = testimonials[index];

  function go(next: number) {
    setDirection(next > index ? 1 : -1);
    setIndex((next + testimonials.length) % testimonials.length);
  }

  return (
    <section id="reviews" className="section bg-white">
      <div className="container">
        <SectionHeading
          eyebrow="Client stories"
          title="The part we can't write ourselves."
          description="Real outcomes from Waterloo Region sellers and buyers — what happened, how long it took, and what it cost."
          action={
            <div className="flex gap-2">
              <button
                onClick={() => go(index - 1)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-slate-ink transition-all hover:border-slate-ink hover:bg-slate-ink hover:text-white"
                aria-label="Previous testimonial"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => go(index + 1)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-slate-ink transition-all hover:border-slate-ink hover:bg-slate-ink hover:text-white"
                aria-label="Next testimonial"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          }
        />

        <div className="mt-12 overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current.id}
              custom={direction}
              initial={{ opacity: 0, x: direction * 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -60 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-12"
            >
              {/* Video */}
              <button
                onClick={() => setPlaying(current)}
                className="group relative aspect-[4/3] overflow-hidden rounded-2xl shadow-card"
                aria-label={`Play ${current.name}'s video testimonial`}
              >
                <Image
                  src={current.thumbnail}
                  alt={`${current.name} testimonial`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-ink/80 via-slate-ink/20 to-transparent" />
                <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:bg-gold">
                  <Play className="ml-1 h-6 w-6 fill-white text-white transition-colors group-hover:fill-slate-ink group-hover:text-slate-ink" />
                </span>
                <div className="absolute inset-x-5 bottom-5 text-left">
                  <Badge variant="glass">{current.type}</Badge>
                  <p className="mt-2 heading-serif text-lg font-semibold text-white">
                    {current.headline}
                  </p>
                </div>
              </button>

              {/* Quote */}
              <div className="flex flex-col justify-center">
                <Quote className="h-9 w-9 text-gold" />
                <blockquote className="heading-serif mt-6 text-xl font-normal leading-relaxed text-slate-ink sm:text-2xl">
                  &ldquo;{current.quote}&rdquo;
                </blockquote>

                <div className="mt-8 flex items-center gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-ink text-sm font-semibold text-gold">
                    {current.avatarInitials}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-ink">{current.name}</p>
                    <p className="text-sm text-muted-foreground">{current.location}</p>
                  </div>
                  <div className="ml-auto flex">
                    {Array.from({ length: current.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-gold text-gold" />
                    ))}
                  </div>
                </div>

                <div className="mt-6 rounded-xl bg-secondary px-5 py-4">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    Result
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-ink">{current.result}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dots */}
        <div className="mt-10 flex justify-center gap-2">
          {testimonials.map((t, i) => (
            <button
              key={t.id}
              onClick={() => go(i)}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                i === index ? 'w-8 bg-gold' : 'w-1.5 bg-sand-dark hover:bg-gold/50',
              )}
              aria-label={`Show testimonial ${i + 1}`}
              aria-current={i === index}
            />
          ))}
        </div>
      </div>

      <Dialog open={!!playing} onOpenChange={(open) => !open && setPlaying(null)}>
        <DialogContent className="max-w-3xl p-0" hideClose>
          <DialogTitle className="sr-only">
            Video testimonial from {playing?.name}
          </DialogTitle>
          <button
            onClick={() => setPlaying(null)}
            className="absolute -top-11 right-0 rounded-full bg-white/10 p-2 text-white backdrop-blur transition-colors hover:bg-white/20"
            aria-label="Close video"
          >
            <X className="h-5 w-5" />
          </button>
          {playing && (
            <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black">
              <iframe
                src={playing.videoUrl}
                title={`${playing.name} testimonial`}
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
