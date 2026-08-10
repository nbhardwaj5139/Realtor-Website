import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Reveal } from './reveal';

type SectionHeadingProps = {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: 'left' | 'center';
  tone?: 'dark' | 'light';
  className?: string;
  action?: ReactNode;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  tone = 'dark',
  className,
  action,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-6 md:flex-row md:items-end md:justify-between',
        align === 'center' && 'md:flex-col md:items-center md:justify-center',
        className,
      )}
    >
      <Reveal className={cn('max-w-2xl', align === 'center' && 'text-center')}>
        {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
        <h2
          className={cn(
            'heading-serif text-balance text-3xl font-medium leading-[1.12] sm:text-4xl lg:text-[2.75rem]',
            tone === 'light' ? 'text-white' : 'text-slate-ink',
          )}
        >
          {title}
        </h2>
        {description && (
          <p
            className={cn(
              'mt-5 text-base leading-relaxed',
              tone === 'light' ? 'text-white/70' : 'text-muted-foreground',
              align === 'center' && 'mx-auto',
            )}
          >
            {description}
          </p>
        )}
      </Reveal>
      {action && (
        <Reveal delay={0.15} className="shrink-0">
          {action}
        </Reveal>
      )}
    </div>
  );
}
