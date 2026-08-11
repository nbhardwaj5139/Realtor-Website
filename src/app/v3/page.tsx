import type { Metadata } from 'next';
import { EdHome } from '@/components/v3/ed-home';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: `${siteConfig.teamLong} — Waterloo Region Real Estate`,
  description: siteConfig.description,
};

export default function EditorialPage() {
  return <EdHome />;
}
