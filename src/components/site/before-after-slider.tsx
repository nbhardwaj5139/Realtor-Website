'use client';

import { useCallback, useRef, useState } from 'react';
import Image from 'next/image';
import { MoveHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Draggable before/after comparison. Works with pointer drag, click-to-position
 * and arrow keys, so it's usable without a mouse.
 */
export function BeforeAfterSlider({
  before,
  after,
  caption,
  className,
}: {
  before: string;
  after: string;
  caption?: string;
  className?: string;
}) {
  const [position, setPosition] = useState(50);
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const updateFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.min(100, Math.max(0, pct)));
  }, []);

  return (
    <figure className={cn('select-none', className)}>
      <div
        ref={containerRef}
        className="relative aspect-[16/10] w-full cursor-ew-resize overflow-hidden rounded-2xl border border-border shadow-card"
        onPointerDown={(e) => {
          setDragging(true);
          e.currentTarget.setPointerCapture(e.pointerId);
          updateFromClientX(e.clientX);
        }}
        onPointerMove={(e) => dragging && updateFromClientX(e.clientX)}
        onPointerUp={(e) => {
          setDragging(false);
          e.currentTarget.releasePointerCapture(e.pointerId);
        }}
        onPointerCancel={() => setDragging(false)}
      >
        {/* After (base layer) */}
        <Image
          src={after}
          alt="After professional staging"
          fill
          sizes="(max-width: 1024px) 100vw, 60vw"
          className="object-cover"
        />

        {/* Before (clipped layer) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        >
          <Image
            src={before}
            alt="Before staging"
            fill
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover"
          />
        </div>

        <span className="pointer-events-none absolute left-4 top-4 rounded-full bg-slate-ink/75 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
          Before
        </span>
        <span className="pointer-events-none absolute right-4 top-4 rounded-full bg-gold px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-ink">
          After
        </span>

        {/* Handle */}
        <div
          className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow-[0_0_16px_rgba(0,0,0,0.35)]"
          style={{ left: `${position}%` }}
        >
          <div
            role="slider"
            tabIndex={0}
            aria-label="Compare before and after staging"
            aria-valuenow={Math.round(position)}
            aria-valuemin={0}
            aria-valuemax={100}
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft') setPosition((p) => Math.max(0, p - 4));
              if (e.key === 'ArrowRight') setPosition((p) => Math.min(100, p + 4));
            }}
            className="pointer-events-auto absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full bg-white shadow-luxe transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2"
          >
            <MoveHorizontal className="h-5 w-5 text-slate-ink" />
          </div>
        </div>
      </div>

      {caption && (
        <figcaption className="mt-4 text-sm leading-relaxed text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
