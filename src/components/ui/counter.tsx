'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';
import { formatCompactCurrency } from '@/lib/utils';

type CounterProps = {
  value: number;
  format?: 'currency-compact' | 'number' | 'percent';
  suffix?: string;
  durationMs?: number;
  className?: string;
};

/** Counts up from zero the first time it scrolls into view. */
export function Counter({
  value,
  format = 'number',
  suffix = '',
  durationMs = 1600,
  className,
}: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setDisplay(value);
      return;
    }

    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1);
      // easeOutExpo — fast start, gentle landing
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplay(value * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, value, durationMs, reduce]);

  const rendered =
    format === 'currency-compact'
      ? formatCompactCurrency(display)
      : format === 'percent'
        ? `${display.toFixed(1)}%`
        : Math.round(display).toLocaleString('en-CA');

  return (
    <span ref={ref} className={className}>
      {rendered}
      {suffix}
    </span>
  );
}
