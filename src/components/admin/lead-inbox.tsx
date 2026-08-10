'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CalendarCheck,
  ChevronDown,
  FileText,
  Home,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  Send,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import type { Lead, LeadStatus, LeadType } from '@/lib/types';

const TYPE_META: Record<LeadType, { label: string; icon: typeof Home }> = {
  valuation: { label: 'Valuation', icon: Home },
  tour: { label: 'Tour request', icon: CalendarCheck },
  inquiry: { label: 'Listing inquiry', icon: MessageSquare },
  contact: { label: 'Contact form', icon: Mail },
};

const STATUS_META: Record<
  LeadStatus,
  { label: string; variant: 'default' | 'gold' | 'muted' | 'success' | 'outline' }
> = {
  new: { label: 'New', variant: 'gold' },
  contacted: { label: 'Contacted', variant: 'default' },
  nurturing: { label: 'Nurturing', variant: 'outline' },
  won: { label: 'Won', variant: 'success' },
  archived: { label: 'Archived', variant: 'muted' },
};

const FILTERS: { value: LeadType | 'all'; label: string }[] = [
  { value: 'all', label: 'All leads' },
  { value: 'valuation', label: 'Valuations' },
  { value: 'tour', label: 'Tours' },
  { value: 'contact', label: 'Contact' },
  { value: 'inquiry', label: 'Inquiries' },
];

export function LeadInbox({ leads }: { leads: Lead[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [filter, setFilter] = useState<LeadType | 'all'>('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const visible = useMemo(
    () => (filter === 'all' ? leads : leads.filter((l) => l.type === filter)),
    [leads, filter],
  );

  const counts = useMemo(
    () => ({
      total: leads.length,
      new: leads.filter((l) => l.status === 'new').length,
      valuation: leads.filter((l) => l.type === 'valuation').length,
      tour: leads.filter((l) => l.type === 'tour').length,
    }),
    [leads],
  );

  async function updateStatus(id: string, status: LeadStatus) {
    setBusy(id);
    try {
      const res = await fetch('/api/admin/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error('Update failed');
      router.refresh();
    } catch {
      toast({ variant: 'error', title: "Couldn't update that lead" });
    } finally {
      setBusy(null);
    }
  }

  async function sendCma(id: string) {
    setBusy(id);
    try {
      const res = await fetch('/api/admin/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'send-cma' }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload?.error ?? 'Send failed');
      toast({
        title: 'CMA sent',
        description: 'The lead has been marked as contacted.',
      });
      router.refresh();
    } catch (error) {
      toast({
        variant: 'error',
        title: "Couldn't send the CMA",
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-4">
        <SummaryTile label="Total leads" value={counts.total} />
        <SummaryTile label="Unworked" value={counts.new} accent />
        <SummaryTile label="Valuation requests" value={counts.valuation} />
        <SummaryTile label="Tour requests" value={counts.tour} />
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              'rounded-full border px-4 py-2 text-sm font-medium transition-all',
              filter === f.value
                ? 'border-slate-ink bg-slate-ink text-white'
                : 'border-border bg-white text-slate-ink/70 hover:border-gold',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border bg-white p-12 text-center">
          <Mail className="mx-auto h-10 w-10 text-muted-foreground/50" strokeWidth={1.5} />
          <p className="mt-4 font-medium text-slate-ink">No leads here yet</p>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Submit the home valuation wizard on the homepage to see one land in this inbox.
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-white">
          {visible.map((lead) => {
            const meta = TYPE_META[lead.type];
            const Icon = meta.icon;
            const isOpen = expanded === lead.id;

            return (
              <div key={lead.id} className="border-b border-border last:border-0">
                <button
                  onClick={() => setExpanded(isOpen ? null : lead.id)}
                  className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-secondary/50 sm:p-5"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary">
                    <Icon className="h-4 w-4 text-gold-bright" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-ink">{lead.name}</span>
                      <Badge variant={STATUS_META[lead.status].variant}>
                        {STATUS_META[lead.status].label}
                      </Badge>
                    </div>
                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      {meta.label}
                      {lead.valuation ? ` · ${lead.valuation.address}` : ''}
                      {lead.tour ? ` · ${lead.tour.listingAddress}` : ''}
                      {' · '}
                      {formatDate(lead.createdAt)}
                    </p>
                  </div>

                  {lead.valuation && (
                    <span className="hidden shrink-0 text-sm font-semibold text-slate-ink sm:block">
                      {formatCurrency(lead.valuation.estimateMid)}
                    </span>
                  )}

                  <ChevronDown
                    className={cn(
                      'h-4 w-4 shrink-0 text-muted-foreground transition-transform',
                      isOpen && 'rotate-180',
                    )}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-border bg-secondary/40 p-5 sm:p-6">
                        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
                          <div>
                            <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                              Contact
                            </h4>
                            <div className="mt-3 flex flex-wrap gap-4 text-sm">
                              <a
                                href={`mailto:${lead.email}`}
                                className="flex items-center gap-2 font-medium text-slate-ink hover:text-gold-bright"
                              >
                                <Mail className="h-3.5 w-3.5 text-gold" /> {lead.email}
                              </a>
                              {lead.phone && (
                                <a
                                  href={`tel:${lead.phone.replace(/\s/g, '')}`}
                                  className="flex items-center gap-2 font-medium text-slate-ink hover:text-gold-bright"
                                >
                                  <Phone className="h-3.5 w-3.5 text-gold" /> {lead.phone}
                                </a>
                              )}
                            </div>

                            {lead.message && (
                              <>
                                <h4 className="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                  Message
                                </h4>
                                <p className="mt-2 whitespace-pre-wrap rounded-lg bg-white p-4 text-sm leading-relaxed text-slate-ink/80">
                                  {lead.message}
                                </p>
                              </>
                            )}

                            {lead.valuation && (
                              <>
                                <h4 className="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                  Valuation request
                                </h4>
                                <dl className="mt-2 grid gap-x-6 gap-y-2 rounded-lg bg-white p-4 text-sm sm:grid-cols-2">
                                  <Row label="Address" value={lead.valuation.address} />
                                  <Row label="Neighbourhood" value={lead.valuation.neighbourhoodName} />
                                  <Row label="Type" value={lead.valuation.propertyType} />
                                  <Row
                                    label="Size"
                                    value={`${lead.valuation.beds} bed · ${lead.valuation.baths} bath${lead.valuation.sqft ? ` · ${lead.valuation.sqft.toLocaleString()} sq ft` : ''}`}
                                  />
                                  <Row
                                    label="Estimate"
                                    value={`${formatCurrency(lead.valuation.estimateLow)} – ${formatCurrency(lead.valuation.estimateHigh)}`}
                                  />
                                  <Row label="Timeline" value={lead.valuation.timeline} />
                                  {lead.valuation.renovations.length > 0 && (
                                    <Row
                                      label="Upgrades"
                                      value={lead.valuation.renovations.join(', ')}
                                    />
                                  )}
                                </dl>
                              </>
                            )}

                            {lead.tour && (
                              <>
                                <h4 className="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                  Tour request
                                </h4>
                                <dl className="mt-2 grid gap-x-6 gap-y-2 rounded-lg bg-white p-4 text-sm sm:grid-cols-2">
                                  <Row label="Property" value={lead.tour.listingAddress} />
                                  <Row
                                    label="Format"
                                    value={lead.tour.tourType === 'virtual' ? 'Virtual' : 'In person'}
                                  />
                                  <Row label="Date" value={lead.tour.preferredDate} />
                                  <Row label="Time" value={lead.tour.preferredTime} />
                                </dl>
                              </>
                            )}

                            {lead.notes && lead.notes.length > 0 && (
                              <>
                                <h4 className="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                  Activity
                                </h4>
                                <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
                                  {lead.notes.map((note, i) => (
                                    <li key={i}>{note}</li>
                                  ))}
                                </ul>
                              </>
                            )}
                          </div>

                          <div>
                            <h4 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                              Actions
                            </h4>

                            <div className="mt-3 space-y-2">
                              {lead.valuation && (
                                <Button
                                  onClick={() => sendCma(lead.id)}
                                  variant="gold"
                                  className="w-full justify-start"
                                  disabled={busy === lead.id}
                                >
                                  {busy === lead.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <FileText className="h-4 w-4" />
                                  )}
                                  Send instant CMA
                                </Button>
                              )}
                              <Button asChild variant="outline" className="w-full justify-start">
                                <a href={`mailto:${lead.email}?subject=Following up on your enquiry`}>
                                  <Send className="h-4 w-4" /> Reply by email
                                </a>
                              </Button>
                            </div>

                            <h4 className="mt-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                              Status
                            </h4>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {(Object.keys(STATUS_META) as LeadStatus[]).map((status) => (
                                <button
                                  key={status}
                                  onClick={() => updateStatus(lead.id, status)}
                                  disabled={busy === lead.id || lead.status === status}
                                  className={cn(
                                    'rounded-full border px-3 py-1.5 text-xs font-medium transition-all disabled:opacity-60',
                                    lead.status === status
                                      ? 'border-slate-ink bg-slate-ink text-white'
                                      : 'border-border bg-white text-slate-ink/70 hover:border-gold',
                                  )}
                                >
                                  {STATUS_META[status].label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SummaryTile({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border p-5',
        accent ? 'border-gold/40 bg-gold/8' : 'border-border bg-white',
      )}
    >
      <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="heading-serif mt-1.5 text-3xl font-semibold text-slate-ink">{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-slate-ink">{value}</dd>
    </div>
  );
}
