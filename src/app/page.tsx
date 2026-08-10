import { Navbar } from '@/components/site/navbar';
import { Hero } from '@/components/site/hero';
import { StatsBand } from '@/components/site/stats-band';
import { NeighbourhoodExplorer } from '@/components/site/neighbourhood-explorer';
import { ListingsShowcase } from '@/components/site/listings-showcase';
import { SellingProcess } from '@/components/site/selling-process';
import { CalculatorSection } from '@/components/site/calculator';
import { TestimonialsCarousel } from '@/components/site/testimonials-carousel';
import { ContactCta } from '@/components/site/contact-cta';
import { Footer } from '@/components/site/footer';
import { DemoBadge } from '@/components/site/demo-badge';
import { siteConfig } from '@/config/site';

/** JSON-LD so the team shows up correctly in local search results. */
function StructuredData() {
  // Only emit fields that have real values — blank entries in structured data
  // are worse than omitting them.
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: siteConfig.teamLong,
    description: siteConfig.description,
    url: siteConfig.url,
    areaServed: ['Kitchener', 'Waterloo', 'Cambridge', 'Waterloo Region, Ontario'],
    ...(siteConfig.phone ? { telephone: siteConfig.phone } : {}),
    ...(siteConfig.email ? { email: siteConfig.email } : {}),
    ...(siteConfig.office
      ? {
          address: {
            '@type': 'PostalAddress',
            streetAddress: siteConfig.office,
            addressRegion: 'ON',
            addressCountry: 'CA',
          },
        }
      : {}),
    employee: siteConfig.agents.map((a) => ({
      '@type': 'Person',
      name: a.name,
      ...(a.role ? { jobTitle: a.role } : {}),
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default function HomePage() {
  return (
    <>
      <StructuredData />
      <Navbar />
      <main>
        <Hero />
        <StatsBand />
        <NeighbourhoodExplorer />
        <ListingsShowcase />
        <SellingProcess />
        <CalculatorSection />
        {siteConfig.content.showTestimonials && <TestimonialsCarousel />}
        <ContactCta />
      </main>
      <Footer />
      <DemoBadge />
    </>
  );
}
