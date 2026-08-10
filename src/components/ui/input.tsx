import * as React from 'react';
import { cn } from '@/lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        'flex h-12 w-full rounded-xl border border-input bg-white px-4 py-2 text-base text-slate-ink shadow-sm transition-colors',
        'placeholder:text-muted-foreground/70',
        'focus-visible:border-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/25',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive/20',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'flex min-h-[110px] w-full rounded-xl border border-input bg-white px-4 py-3 text-base text-slate-ink shadow-sm transition-colors',
      'placeholder:text-muted-foreground/70',
      'focus-visible:border-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/25',
      'disabled:cursor-not-allowed disabled:opacity-50',
      className,
    )}
    {...props}
  />
));
Textarea.displayName = 'Textarea';

export { Input, Textarea };
