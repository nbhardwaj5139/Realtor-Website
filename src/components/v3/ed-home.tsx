'use client';

import { useState } from 'react';
import { EdNav } from './ed-nav';
import { EdHero } from './ed-hero';
import { EdCommunities } from './ed-communities';
import { EdListings } from './ed-listings';
import { EdValue } from './ed-value';
import { EdTeam } from './ed-team';
import { EdReviews } from './ed-reviews';
import { EdContact } from './ed-contact';
import { DemoBadge } from '@/components/site/demo-badge';

/**
 * Client shell so the hero's price search can drive the listings grid.
 * Kept separate from page.tsx so that file can still export metadata.
 */
export function EdHome() {
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(Infinity);

  return (
    <div className="min-h-screen bg-ed-paper text-ed-ink antialiased">
      <EdNav />
      <main>
        <EdHero
          onSearch={(min, max) => {
            setMinPrice(min);
            setMaxPrice(max);
          }}
        />
        <EdCommunities />
        <EdListings
          minPrice={minPrice}
          maxPrice={maxPrice}
          onClearFilter={() => {
            setMinPrice(0);
            setMaxPrice(Infinity);
          }}
        />
        <EdValue />
        <EdTeam />
        <EdReviews />
        <EdContact />
      </main>
      <DemoBadge />
    </div>
  );
}
