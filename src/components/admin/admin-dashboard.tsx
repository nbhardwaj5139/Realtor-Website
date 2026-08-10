'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Database, Inbox, LogOut, ShieldAlert, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LeadInbox } from './lead-inbox';
import { KitGenerator } from './kit-generator';
import { siteConfig } from '@/config/site';
import type { Lead } from '@/lib/types';

export function AdminDashboard({
  leads,
  storage,
  storageError,
  insecurePassword,
}: {
  leads: Lead[];
  storage: 'supabase' | 'file' | 'memory';
  storageError: string | null;
  insecurePassword: boolean;
}) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function signOut() {
    setSigningOut(true);
    await fetch('/api/admin/login', { method: 'DELETE' });
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-slate-ink">
        <div className="container flex h-20 items-center justify-between gap-6">
          <div>
            <p className="heading-serif text-xl font-semibold text-white">{siteConfig.team}</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-gold">
              Team dashboard
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-[11px] text-white/60 sm:flex">
              <Database className="h-3 w-3" />
              {storage === 'supabase' ? 'Supabase' : 'Local file store'}
            </span>
            <Button asChild variant="light" size="sm">
              <Link href="/">View site</Link>
            </Button>
            <Button variant="light" size="sm" onClick={signOut} disabled={signingOut}>
              <LogOut className="h-4 w-4" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-10">
        {insecurePassword && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
            <p className="text-sm leading-relaxed text-amber-900">
              This deployment is using the built-in demo password. Set{' '}
              <code className="font-mono font-semibold">ADMIN_PASSWORD</code> and{' '}
              <code className="font-mono font-semibold">ADMIN_SESSION_SECRET</code> before putting
              real client data in here.
            </p>
          </div>
        )}

        {storageError && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <p className="text-sm leading-relaxed text-destructive">{storageError}</p>
          </div>
        )}

        <Tabs defaultValue="leads">
          <TabsList>
            <TabsTrigger value="leads">
              <Inbox className="mr-2 h-4 w-4" /> Lead inbox
            </TabsTrigger>
            <TabsTrigger value="kit">
              <Wand2 className="mr-2 h-4 w-4" /> Listing kit
            </TabsTrigger>
          </TabsList>

          <TabsContent value="leads">
            <LeadInbox leads={leads} />
          </TabsContent>

          <TabsContent value="kit">
            <KitGenerator />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
