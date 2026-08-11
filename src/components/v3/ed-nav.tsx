'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, Phone, X } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';

const NAV = [
  { label: 'Communities', href: '#communities' },
  { label: 'Listings', href: '#listings' },
  { label: 'Home Value', href: '#value' },
  { label: 'Team', href: '#team' },
  { label: 'Reviews', href: '#reviews' },
];

export function EdNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
          scrolled ? 'bg-ed-paper/95 py-3 backdrop-blur-xl' : 'py-6',
        )}
      >
        <div
          className={cn(
            'absolute inset-x-0 bottom-0 h-px transition-opacity duration-500',
            scrolled ? 'bg-ed-line opacity-100' : 'opacity-0',
          )}
        />
        <nav className="container flex items-center justify-between gap-8">
          <Link href="/v3" className="group relative z-10">
            <span
              className={cn(
                'block font-serif text-[22px] leading-none tracking-[-0.02em] transition-colors duration-500',
                scrolled ? 'text-ed-ink' : 'text-white',
              )}
            >
              Team Pinto
            </span>
            <span
              className={cn(
                'mt-1.5 block text-[9px] font-medium uppercase tracking-[0.34em] transition-colors duration-500',
                scrolled ? 'text-ed-muted' : 'text-white/60',
              )}
            >
              eXp Realty
            </span>
          </Link>

          <div className="hidden items-center gap-9 lg:flex">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  'relative text-[13px] uppercase tracking-[0.12em] transition-colors duration-300',
                  'after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:transition-all after:duration-300 hover:after:w-full',
                  scrolled
                    ? 'text-ed-inkSoft after:bg-ed-ink hover:text-ed-ink'
                    : 'text-white/75 after:bg-white hover:text-white',
                )}
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <a
              href={siteConfig.phoneHref}
              className={cn(
                'hidden items-center gap-2 text-[13px] tracking-wide transition-colors duration-500 md:flex',
                scrolled ? 'text-ed-ink hover:text-ed-accent' : 'text-white/80 hover:text-white',
              )}
            >
              <Phone className="h-3.5 w-3.5" />
              {siteConfig.phone}
            </a>
            <a
              href="#value"
              className={cn(
                'hidden px-5 py-2.5 text-[12px] uppercase tracking-[0.14em] transition-all duration-500 sm:inline-block',
                scrolled
                  ? 'bg-ed-ink text-ed-paper hover:bg-ed-accent'
                  : 'bg-white/95 text-ed-ink hover:bg-white',
              )}
            >
              Home value
            </a>
            <button
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className={cn(
                'p-1.5 transition-colors duration-500 lg:hidden',
                scrolled ? 'text-ed-ink' : 'text-white',
              )}
            >
              <Menu className="h-6 w-6" strokeWidth={1.5} />
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
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[60] bg-ed-night lg:hidden"
          >
            <div className="container flex items-center justify-between py-6">
              <span className="font-serif text-[22px] text-white">Team Pinto</span>
              <button onClick={() => setOpen(false)} aria-label="Close menu" className="p-1.5 text-white">
                <X className="h-6 w-6" strokeWidth={1.5} />
              </button>
            </div>
            <div className="container mt-8 flex flex-col">
              {NAV.map((item, i) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.07 * i + 0.1, duration: 0.45 }}
                  className="border-b border-white/10 py-6 font-serif text-4xl text-white"
                >
                  {item.label}
                </motion.a>
              ))}
              <a
                href={siteConfig.phoneHref}
                className="mt-10 flex items-center gap-3 text-white/70"
              >
                <Phone className="h-4 w-4" /> {siteConfig.phone}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
