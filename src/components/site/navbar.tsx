'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, Phone, X } from 'lucide-react';
import { siteConfig, siteNav } from '@/config/site';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll while the mobile sheet is open.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-all duration-500',
          scrolled
            ? 'border-b border-border/70 bg-sand/85 backdrop-blur-xl'
            : 'border-b border-transparent bg-transparent',
        )}
      >
        <nav className="container flex h-20 items-center justify-between gap-6">
          <Link href="/" className="group flex flex-col leading-none" aria-label={siteConfig.teamLong}>
            <span
              className={cn(
                'heading-serif text-xl font-semibold tracking-tight transition-colors sm:text-2xl',
                scrolled ? 'text-slate-ink' : 'text-white',
              )}
            >
              {siteConfig.team}
            </span>
            <span
              className={cn(
                'mt-1 text-[10px] font-semibold uppercase tracking-[0.28em] transition-colors',
                scrolled ? 'text-gold' : 'text-gold-soft',
              )}
            >
              {siteConfig.tagline}
            </span>
          </Link>

          <div className="hidden items-center gap-8 lg:flex">
            {siteNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative text-sm font-medium transition-colors after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-0 after:bg-gold after:transition-all after:duration-300 hover:after:w-full',
                  scrolled ? 'text-slate-ink/80 hover:text-slate-ink' : 'text-white/85 hover:text-white',
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {siteConfig.phone && (
              <a
                href={siteConfig.phoneHref}
                className={cn(
                  'hidden items-center gap-2 text-sm font-medium transition-colors md:flex',
                  scrolled ? 'text-slate-ink hover:text-gold-bright' : 'text-white hover:text-gold-soft',
                )}
              >
                <Phone className="h-4 w-4" />
                {siteConfig.phone}
              </a>
            )}
            <Button asChild variant={scrolled ? 'default' : 'gold'} size="sm" className="hidden sm:inline-flex">
              <Link href="/#valuation">Get my home value</Link>
            </Button>
            <button
              onClick={() => setOpen(true)}
              className={cn(
                'rounded-full p-2 transition-colors lg:hidden',
                scrolled ? 'text-slate-ink hover:bg-secondary' : 'text-white hover:bg-white/10',
              )}
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[60] bg-slate-ink lg:hidden"
          >
            <div className="container flex h-20 items-center justify-between">
              <span className="heading-serif text-xl font-semibold text-white">{siteConfig.team}</span>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full p-2 text-white transition-colors hover:bg-white/10"
                aria-label="Close menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="container flex flex-col gap-1 pt-8">
              {siteNav.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.06 * i + 0.1, duration: 0.4 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block border-b border-white/10 py-5 font-serif text-3xl text-white transition-colors hover:text-gold"
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}

              <div className="mt-10 flex flex-col gap-3">
                <Button asChild variant="gold" size="lg">
                  <Link href="/#valuation" onClick={() => setOpen(false)}>
                    Get my home value
                  </Link>
                </Button>
                {siteConfig.phone && (
                  <Button asChild variant="light" size="lg">
                    <a href={siteConfig.phoneHref}>
                      <Phone className="h-4 w-4" /> {siteConfig.phone}
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
