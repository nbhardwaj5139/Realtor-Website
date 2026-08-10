'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type Toast = { id: number; title: string; description?: string; variant: 'success' | 'error' };

type ToastContextValue = {
  toast: (t: Omit<Toast, 'id'> | (Omit<Toast, 'id' | 'variant'> & { variant?: Toast['variant'] })) => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const nextId = React.useRef(0);

  const dismiss = React.useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = React.useCallback<ToastContextValue['toast']>(
    (input) => {
      const id = nextId.current++;
      const entry: Toast = { variant: 'success', ...input, id };
      setToasts((prev) => [...prev, entry]);
      setTimeout(() => dismiss(id), 6000);
    },
    [dismiss],
  );

  const value = React.useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3 sm:bottom-6 sm:right-6"
        role="region"
        aria-live="polite"
      >
        <AnimatePresence initial={false}>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 24, scale: 0.97 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                'pointer-events-auto flex items-start gap-3 rounded-xl border bg-white p-4 shadow-luxe',
                t.variant === 'error' ? 'border-destructive/30' : 'border-border',
              )}
            >
              {t.variant === 'error' ? (
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
              ) : (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-ink">{t.title}</p>
                {t.description && (
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {t.description}
                  </p>
                )}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
