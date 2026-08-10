import type { Metadata, Viewport } from 'next';
import { Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google';
import { siteConfig } from '@/config/site';
import { ToastProvider } from '@/components/ui/toast';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
  weight: ['400', '500', '600', '700'],
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jakarta',
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.teamLong} — Kitchener, Waterloo & Cambridge Real Estate`,
    template: `%s — ${siteConfig.team}`,
  },
  description: siteConfig.description,
  keywords: [
    'Kitchener real estate',
    'Waterloo homes for sale',
    'Cambridge Ontario realtor',
    'KW home valuation',
    'Waterloo Region realtor',
    'Toronto to Kitchener commute',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_CA',
    url: siteConfig.url,
    title: `${siteConfig.teamLong} — Kitchener, Waterloo & Cambridge Real Estate`,
    description: siteConfig.description,
    siteName: siteConfig.teamLong,
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.teamLong,
    description: siteConfig.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#0F172A',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-CA" className={`${playfair.variable} ${jakarta.variable}`}>
      <body className="font-sans">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
