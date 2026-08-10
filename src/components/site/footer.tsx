import Link from 'next/link';
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Youtube } from 'lucide-react';
import { siteConfig, siteNav } from '@/config/site';
import { neighbourhoods } from '@/lib/data';

// Only render a social icon once a real profile URL is configured.
const socials = [
  { href: siteConfig.social.instagram, label: 'Instagram', Icon: Instagram },
  { href: siteConfig.social.facebook, label: 'Facebook', Icon: Facebook },
  { href: siteConfig.social.linkedin, label: 'LinkedIn', Icon: Linkedin },
  { href: siteConfig.social.youtube, label: 'YouTube', Icon: Youtube },
].filter((s) => Boolean(s.href));

export function Footer() {
  return (
    <footer className="bg-slate-ink text-white">
      <div className="container py-16 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <p className="heading-serif text-2xl font-semibold">{siteConfig.teamLong}</p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-gold">
              {siteConfig.tagline}
            </p>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-white/60">
              {siteConfig.description}
            </p>
            <div className="mt-7 flex gap-3">
              {socials.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="rounded-full border border-white/15 p-2.5 text-white/70 transition-all hover:border-gold hover:text-gold"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">Explore</h3>
            <ul className="mt-5 space-y-3 text-sm">
              {siteNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-white/65 transition-colors hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/admin" className="text-white/65 transition-colors hover:text-white">
                  Team login
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
              Neighbourhoods
            </h3>
            <ul className="mt-5 space-y-3 text-sm">
              {neighbourhoods.slice(0, 7).map((n) => (
                <li key={n.id}>
                  <Link
                    href={`/#neighbourhoods`}
                    className="text-white/65 transition-colors hover:text-white"
                  >
                    {n.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">Contact</h3>
            <ul className="mt-5 space-y-4 text-sm text-white/65">
              {siteConfig.phone && (
                <li>
                  <a href={siteConfig.phoneHref} className="flex items-start gap-3 transition-colors hover:text-white">
                    <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                    {siteConfig.phone}
                  </a>
                </li>
              )}
              {siteConfig.email && (
                <li>
                  <a
                    href={`mailto:${siteConfig.email}`}
                    className="flex items-start gap-3 transition-colors hover:text-white"
                  >
                    <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                    {siteConfig.email}
                  </a>
                </li>
              )}
              {siteConfig.office && (
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                  {siteConfig.office}
                </li>
              )}
              {!siteConfig.phone && !siteConfig.email && !siteConfig.office && (
                <li>
                  <a href="#contact" className="transition-colors hover:text-white">
                    Send us a message
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-14 border-t border-white/10 pt-8">
          <p className="text-xs leading-relaxed text-white/40">
            {siteConfig.brokerage ? `${siteConfig.brokerage}. ` : ''}
            {siteConfig.content.demoMode
              ? 'Demonstration build. Listings, neighbourhood figures and market statistics shown on this site are sample data for layout purposes and do not represent real properties or transactions. '
              : ''}
            Not intended to solicit buyers or sellers currently under contract. All measurements and
            figures on this site are estimates for illustration only and do not constitute an
            appraisal, financial advice, or a guarantee of value. Home valuation ranges are
            generated by an automated model, not an appraisal. Mortgage and land transfer tax
            figures are estimates — confirm with your lender and lawyer before making an offer.
          </p>
          <p className="mt-5 text-xs text-white/40">
            © {new Date().getFullYear()} {siteConfig.teamLong}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
