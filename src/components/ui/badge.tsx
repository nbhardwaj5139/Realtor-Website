import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-slate-ink text-white',
        gold: 'border-transparent bg-gold text-slate-ink',
        outline: 'border-slate-ink/20 text-slate-ink',
        muted: 'border-transparent bg-secondary text-secondary-foreground',
        success: 'border-transparent bg-emerald-600 text-white',
        warning: 'border-transparent bg-amber-500 text-slate-ink',
        glass: 'border-white/25 bg-white/15 text-white backdrop-blur-md',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
