'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Image with a designed fallback.
 *
 * An image-led layout looks broken the moment a photo 404s or a CDN rate-limits.
 * This keeps a warm gradient underneath at all times, so a missing image reads
 * as an intentional tonal block rather than a hole in the page.
 */
export function EdImage({
  src,
  alt,
  sizes,
  priority,
  className,
  zoom = true,
  fallbackTone = 'light',
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  zoom?: boolean;
  /**
   * Tone of the placeholder beneath the image. Use 'dark' anywhere light text
   * sits on top — otherwise a failed or slow-loading photo leaves white type on
   * a pale background and the section becomes unreadable.
   */
  fallbackTone?: 'light' | 'dark';
}) {
  const [failed, setFailed] = useState(false);

  return (
    <span
      aria-hidden={failed ? 'true' : undefined}
      className={cn(
        'absolute inset-0 block',
        fallbackTone === 'dark'
          ? 'bg-gradient-to-br from-[#242220] via-[#16161a] to-[#0C0C0D]'
          : 'bg-gradient-to-br from-ed-paperWarm via-[#e2dad0] to-[#cfc4b8]',
      )}
    >
      {!failed && (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          onError={() => setFailed(true)}
          className={cn(
            'object-cover',
            zoom && 'transition-transform duration-700 ease-out group-hover:scale-[1.04]',
            className,
          )}
        />
      )}
    </span>
  );
}
