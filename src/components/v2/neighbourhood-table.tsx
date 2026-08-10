'use client';

import { useMemo, useState } from 'react';
import { ArrowUpDown, Check } from 'lucide-react';
import { neighbourhoods } from '@/lib/data';
import { siteConfig } from '@/config/site';
import { cn, formatCompactCurrency } from '@/lib/utils';
import type { Neighbourhood } from '@/lib/types';

type SortKey =
  | 'name'
  | 'medianPrice'
  | 'yoyAppreciation'
  | 'avgDaysOnMarket'
  | 'googleKw'
  | 'goStation'
  | 'highway401'
  | 'walkScore'
  | 'school';

const COLUMNS: { key: SortKey; label: string; hint?: string; numeric: boolean }[] = [
  { key: 'name', label: 'Neighbourhood', numeric: false },
  { key: 'medianPrice', label: 'Median', numeric: true },
  { key: 'yoyAppreciation', label: 'YoY', numeric: true },
  { key: 'avgDaysOnMarket', label: 'Days', hint: 'Average days on market', numeric: true },
  { key: 'googleKw', label: 'Google KW', hint: 'Drive time, minutes', numeric: true },
  { key: 'goStation', label: 'GO', hint: 'To Kitchener GO station, minutes', numeric: true },
  { key: 'highway401', label: '401', hint: 'To the nearest on-ramp, minutes', numeric: true },
  { key: 'school', label: 'Schools', hint: 'Best-rated catchment school', numeric: true },
  { key: 'walkScore', label: 'Walk', hint: 'Walk Score out of 100', numeric: true },
];

/** Buyer priorities → which column the table sorts by. */
const PRIORITIES: { id: string; label: string; sort: SortKey; asc: boolean }[] = [
  { id: 'value', label: 'Lowest price', sort: 'medianPrice', asc: true },
  { id: 'growth', label: 'Fastest growth', sort: 'yoyAppreciation', asc: false },
  { id: 'tech', label: 'Closest to Google KW', sort: 'googleKw', asc: true },
  { id: 'commute', label: 'Best Toronto commute', sort: 'goStation', asc: true },
  { id: 'schools', label: 'Best schools', sort: 'school', asc: false },
  { id: 'walk', label: 'Most walkable', sort: 'walkScore', asc: false },
];

function bestSchool(n: Neighbourhood) {
  return Math.max(...n.schools.map((s) => s.rating));
}

function valueFor(n: Neighbourhood, key: SortKey): number | string {
  switch (key) {
    case 'name':
      return n.name;
    case 'googleKw':
      return n.commute.googleKw;
    case 'goStation':
      return n.commute.goStation;
    case 'highway401':
      return n.commute.highway401;
    case 'school':
      return bestSchool(n);
    default:
      return n[key];
  }
}

export function NeighbourhoodTable() {
  const [sort, setSort] = useState<SortKey>('medianPrice');
  const [asc, setAsc] = useState(true);
  const [priority, setPriority] = useState('value');

  const rows = useMemo(() => {
    return [...neighbourhoods].sort((a, b) => {
      const av = valueFor(a, sort);
      const bv = valueFor(b, sort);
      if (typeof av === 'string' || typeof bv === 'string') {
        return asc ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
      }
      return asc ? av - bv : bv - av;
    });
  }, [sort, asc]);

  function applyPriority(p: (typeof PRIORITIES)[number]) {
    setPriority(p.id);
    setSort(p.sort);
    setAsc(p.asc);
  }

  function toggleSort(key: SortKey) {
    setPriority('');
    if (key === sort) setAsc((v) => !v);
    else {
      setSort(key);
      setAsc(key === 'name');
    }
  }

  return (
    <section id="compare" className="border-b border-guide-line py-16 md:py-24">
      <div className="container">
        <div className="max-w-2xl">
          <p className="text-[13px] font-medium uppercase tracking-[0.14em] text-guide-forest">
            Neighbourhoods
          </p>
          <h2 className="mt-4 text-[2rem] font-semibold leading-tight tracking-[-0.02em] text-guide-ink sm:text-[2.5rem]">
            Every pocket, side by side.
          </h2>
          <p className="mt-4 text-[17px] leading-relaxed text-guide-inkSoft">
            Tell us what matters most and the table reorders. Or sort any column yourself —
            no filtering by &ldquo;lifestyle&rdquo;, just the numbers that decide it.
          </p>
        </div>

        <div className="mt-9 flex flex-wrap gap-2">
          {PRIORITIES.map((p) => (
            <button
              key={p.id}
              onClick={() => applyPriority(p)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-[14px] transition-colors',
                priority === p.id
                  ? 'border-guide-forest bg-guide-forest text-white'
                  : 'border-guide-line bg-white text-guide-inkSoft hover:border-guide-forest/40',
              )}
            >
              {priority === p.id && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
              {p.label}
            </button>
          ))}
        </div>

        <div className="mt-7 overflow-x-auto rounded-2xl border border-guide-line bg-white">
          <table className="w-full min-w-[860px] border-collapse text-left">
            <thead>
              <tr className="border-b border-guide-line">
                {COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    scope="col"
                    className={cn(
                      'whitespace-nowrap px-4 py-3.5 text-[12px] font-medium uppercase tracking-wider text-guide-muted',
                      col.numeric && col.key !== 'name' && 'text-right',
                    )}
                  >
                    <button
                      onClick={() => toggleSort(col.key)}
                      title={col.hint}
                      className={cn(
                        'inline-flex items-center gap-1.5 transition-colors hover:text-guide-forest',
                        sort === col.key && 'text-guide-forest',
                      )}
                    >
                      {col.label}
                      <ArrowUpDown className="h-3 w-3 opacity-50" />
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((n) => (
                <tr
                  key={n.id}
                  className="border-b border-guide-line/70 transition-colors last:border-0 hover:bg-guide-mint/50"
                >
                  <th scope="row" className="px-4 py-4 text-left font-normal">
                    <span className="block font-medium text-guide-ink">{n.name}</span>
                    <span className="block text-[13px] text-guide-muted">{n.city}</span>
                  </th>
                  <Cell value={formatCompactCurrency(n.medianPrice)} strong />
                  <Cell
                    value={`+${n.yoyAppreciation}%`}
                    className={n.yoyAppreciation >= 4.5 ? 'text-guide-forest' : undefined}
                  />
                  <Cell value={`${n.avgDaysOnMarket}`} />
                  <Cell value={`${n.commute.googleKw} min`} />
                  <Cell value={`${n.commute.goStation} min`} />
                  <Cell value={`${n.commute.highway401} min`} />
                  <Cell value={bestSchool(n).toFixed(1)} />
                  <Cell value={`${n.walkScore}`} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-[13px] leading-relaxed text-guide-muted">
          Commute times are typical off-peak driving times.
          {siteConfig.content.demoMode &&
            ' Prices and market figures are sample data for this demo — connect an MLS or CREA feed to publish live numbers.'}
        </p>
      </div>
    </section>
  );
}

function Cell({
  value,
  strong,
  className,
}: {
  value: string;
  strong?: boolean;
  className?: string;
}) {
  return (
    <td
      className={cn(
        'whitespace-nowrap px-4 py-4 text-right text-[15px] tabular-nums',
        strong ? 'font-medium text-guide-ink' : 'text-guide-inkSoft',
        className,
      )}
    >
      {value}
    </td>
  );
}
