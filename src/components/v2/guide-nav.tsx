'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';

const NAV = [
  { label: 'What it’s worth', href: '#valuation' },
  { label: 'Neighbourhoods', href: '#compare' },
  { label: 'What you can afford', href: '#afford' },
  { label: 'Closing costs', href: '#closing' },
];

export function GuideNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
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
          'sticky top-0 z-50 bg-guide-paper/90 backdrop-blur-md transition-shadow',
          scrolled && 'shadow-[0_1px_0_0_rgba(20,31,27,0.08)]',
        )}
      >
        <nav className="container flex h-[72px] items-center justify-between gap-8">
          <Link href="/v2" className="flex items-baseline gap-2.5">
            <span className="text-[17px] font-semibold tracking-tight text-guide-ink">
              {siteConfig.team}
            </span>
            <span className="hidden text-[13px] text-guide-muted sm:inline">
              Waterloo Region
            </span>
          </Link>

          <div className="hidden items-center gap-7 lg:flex">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-[14px] text-guide-inkSoft transition-colors hover:text-guide-forest"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <a
              href="#contact"
              className="hidden rounded-lg bg-guide-forest px-4 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-guide-forestDark sm:inline-block"
            >
              Talk to us
            </a>
            <button
              onClick={() => setOpen(true)}
              className="rounded-lg p-2 text-guide-ink transition-colors hover:bg-guide-paperDark lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </nav>
      </header>

      {open && (
        <div className="fixed inset-0 z-[60] bg-guide-paper lg:hidden">
          <div className="container flex h-[72px] items-center justify-between">
            <span className="text-[17px] font-semibold text-guide-ink">{siteConfig.team}</span>
            <button
              onClick={() => setOpen(false)}
              className="rounded-lg p-2 text-guide-ink hover:bg-guide-paperDark"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="container flex flex-col pt-6">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="border-b border-guide-line py-5 text-2xl text-guide-ink"
              >
                {item.label}
              </a>
            ))}
            <a
              href="#contact"
              onClick={() => setOpen(false)}
              className="mt-8 rounded-lg bg-guide-forest px-5 py-4 text-center font-medium text-white"
            >
              Talk to us
            </a>
          </div>
        </div>
      )}
    </>
  );
}
