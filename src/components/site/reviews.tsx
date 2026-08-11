'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SectionHeading } from '@/components/ui/section-heading';
import { siteConfig } from '@/config/site';
import { testimonials } from '@/lib/data';
import { cn } from '@/lib/utils';

const INITIAL = 6;

/**
 * Real, attributed client reviews.
 *
 * Replaces the earlier testimonial carousel, which was built around invented
 * client stories with invented sale results. These are the team's published
 * Google reviews, quoted as written and credited by name — so there is no
 * video thumbnail and no "sold $X over asking" line, because the reviews
 * don't contain those claims.
 */
export function Reviews({ variant = 'default' }: { variant?: 'default' | 'guide' }) {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? testimonials : testimonials.slice(0, INITIAL);
  const { googleRating, googleReviewCount } = siteConfig.proof;
  const guide = variant === 'guide';

  return (
    <section
      id="reviews"
      className={cn(guide ? 'border-b border-guide-line py-16 md:py-24' : 'section bg-background')}
    >
      <div className="container">
        {guide ? (
          <div className="max-w-2xl">
            <p className="text-[13px] font-medium uppercase tracking-[0.14em] text-guide-forest">
              Reviews
            </p>
            <h2 className="mt-4 text-[2rem] font-semibold leading-tight tracking-[-0.02em] text-guide-ink sm:text-[2.5rem]">
              {googleRating} out of 5, across {googleReviewCount} Google reviews.
            </h2>
            <p className="mt-4 text-[17px] leading-relaxed text-guide-inkSoft">
              Quoted as written, credited by name. Every one of these is public — go read
              the rest on Google rather than taking our word for it.
            </p>
          </div>
        ) : (
          <SectionHeading
            eyebrow="Client reviews"
            title={
              <>
                {googleRating} out of 5, across
                <br className="hidden sm:block" /> {googleReviewCount} Google reviews.
              </>
            }
            description="Quoted as written and credited by name. Every one of these is public — go read the rest on Google rather than taking our word for it."
            action={
              <Button asChild variant="outline">
                <a href={siteConfig.proof.youtubeUrl} target="_blank" rel="noopener noreferrer">
                  Watch on YouTube
                </a>
              </Button>
            }
          />
        )}

        {/* Aggregate */}
        <div
          className={cn(
            'mt-9 flex flex-wrap items-center gap-x-8 gap-y-4 rounded-2xl border p-6',
            guide ? 'border-guide-line bg-white' : 'border-border bg-white',
          )}
        >
          <div className="flex items-center gap-3">
            <span
              className={cn(
                'heading-serif text-4xl font-semibold',
                guide ? 'font-sans text-guide-ink' : 'text-slate-ink',
              )}
            >
              {googleRating}
            </span>
            <div>
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'h-4 w-4',
                      guide ? 'fill-guide-forest text-guide-forest' : 'fill-gold text-gold',
                    )}
                  />
                ))}
              </div>
              <p
                className={cn(
                  'mt-1 text-xs',
                  guide ? 'text-guide-muted' : 'text-muted-foreground',
                )}
              >
                {googleReviewCount} Google reviews
              </p>
            </div>
          </div>

          <div className={cn('h-10 w-px', guide ? 'bg-guide-line' : 'bg-border')} />

          <div>
            <p className={cn('text-sm font-medium', guide ? 'text-guide-ink' : 'text-slate-ink')}>
              {siteConfig.proof.yearsServing} serving Waterloo Region
            </p>
            <p className={cn('text-xs', guide ? 'text-guide-muted' : 'text-muted-foreground')}>
              {siteConfig.proof.youtubeViews} views on the Team Pinto YouTube channel
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {shown.map((t, i) => (
            <motion.figure
              key={t.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, delay: Math.min(i * 0.05, 0.25) }}
              className={cn(
                'flex flex-col rounded-2xl border p-6',
                guide ? 'border-guide-line bg-white' : 'border-border bg-white shadow-card',
              )}
            >
              <Quote
                className={cn('h-5 w-5', guide ? 'text-guide-forest' : 'text-gold')}
                strokeWidth={1.75}
              />
              <blockquote
                className={cn(
                  'mt-4 flex-1 text-[15px] leading-relaxed',
                  guide ? 'text-guide-inkSoft' : 'text-slate-ink/80',
                )}
              >
                {t.quote}
              </blockquote>

              <figcaption
                className={cn(
                  'mt-5 flex items-center gap-3 border-t pt-4',
                  guide ? 'border-guide-line' : 'border-border',
                )}
              >
                <span
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                    guide ? 'bg-guide-mint text-guide-forest' : 'bg-slate-ink text-gold',
                  )}
                >
                  {t.initials}
                </span>
                <span className="min-w-0">
                  <span
                    className={cn(
                      'block truncate text-sm font-medium',
                      guide ? 'text-guide-ink' : 'text-slate-ink',
                    )}
                  >
                    {t.name}
                  </span>
                  <span
                    className={cn(
                      'block text-xs',
                      guide ? 'text-guide-muted' : 'text-muted-foreground',
                    )}
                  >
                    {t.source} · {t.when}
                  </span>
                </span>
                <span className="ml-auto flex shrink-0">
                  {Array.from({ length: t.rating }).map((_, s) => (
                    <Star
                      key={s}
                      className={cn(
                        'h-3 w-3',
                        guide ? 'fill-guide-forest text-guide-forest' : 'fill-gold text-gold',
                      )}
                    />
                  ))}
                </span>
              </figcaption>
            </motion.figure>
          ))}
        </div>

        {testimonials.length > INITIAL && (
          <div className="mt-8 text-center">
            <button
              onClick={() => setExpanded((v) => !v)}
              className={cn(
                'rounded-full border px-5 py-2.5 text-sm font-medium transition-colors',
                guide
                  ? 'border-guide-line bg-white text-guide-ink hover:border-guide-forest/40'
                  : 'border-border bg-white text-slate-ink hover:border-gold',
              )}
            >
              {expanded ? 'Show fewer' : `Show all ${testimonials.length}`}
            </button>
          </div>
        )}

        <p
          className={cn(
            'mt-6 text-center text-xs',
            guide ? 'text-guide-muted' : 'text-muted-foreground',
          )}
        >
          Reviews published on Google and reproduced as written. Rating and count as shown on
          the team&apos;s Google Business profile.
        </p>
      </div>
    </section>
  );
}
