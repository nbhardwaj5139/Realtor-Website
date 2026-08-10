'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Info, X } from 'lucide-react';
import { siteConfig } from '@/config/site';

/**
 * Persistent, dismissible marker that this build runs on sample data.
 *
 * Present so nobody viewing the demo mistakes the listings, market figures or
 * valuation output for real transactions. Remove by setting
 * siteConfig.content.demoMode to false once real data is connected.
 */
export function DemoBadge() {
  const [open, setOpen] = useState(true);
  const [expanded, setExpanded] = useState(false);

  if (!siteConfig.content.demoMode || !open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 12 }}
        transition={{ delay: 1.4, duration: 0.4 }}
        className="fixed bottom-4 left-4 z-[70] max-w-[calc(100vw-2rem)] sm:bottom-6 sm:left-6"
      >
        <div className="flex items-start gap-2.5 rounded-xl border border-white/15 bg-slate-ink/95 py-2.5 pl-3.5 pr-2.5 shadow-luxe backdrop-blur-md">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />

          <div className="min-w-0">
            <button
              onClick={() => setExpanded((v) => !v)}
              className="text-left text-xs font-medium text-white transition-colors hover:text-gold-soft"
            >
              Demo build · sample data
            </button>

            {expanded && (
              <p className="mt-1.5 max-w-xs text-[11px] leading-relaxed text-white/60">
                Listings, neighbourhood figures and market statistics are placeholders for layout
                only — they are not real properties or transactions. The valuation tool returns an
                algorithmic estimate, not an appraisal.
              </p>
            )}
          </div>

          <button
            onClick={() => setOpen(false)}
            aria-label="Dismiss demo notice"
            className="shrink-0 rounded-md p-1 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
