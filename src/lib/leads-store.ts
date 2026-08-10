import { promises as fs } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import type { Lead, LeadStatus } from './types';

/**
 * Lead persistence with three tiers, picked automatically:
 *
 *  1. Supabase  — when SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are set.
 *                 Talks to PostgREST directly, so there's no client SDK to ship.
 *  2. JSON file — local development default (.data/leads.json).
 *  3. In-memory — read-only filesystems (Vercel/Lambda) with no Supabase config.
 *                 Data lives for the lifetime of the process; fine for demos.
 *
 * Supabase table DDL lives in supabase/schema.sql.
 */

const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'leads.json');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const useSupabase = Boolean(SUPABASE_URL && SUPABASE_KEY);

/** Survives hot reloads in dev, which would otherwise reset the array. */
const globalMemory = globalThis as unknown as { __leads?: Lead[] };
globalMemory.__leads ??= [];

function supabaseHeaders(extra: Record<string, string> = {}) {
  return {
    apikey: SUPABASE_KEY as string,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    ...extra,
  };
}

async function readFileLeads(): Promise<Lead[] | null> {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(raw) as Lead[];
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === 'ENOENT') return [];
    return null; // unreadable FS — caller falls back to memory
  }
}

async function writeFileLeads(leads: Lead[]): Promise<boolean> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(leads, null, 2), 'utf8');
    return true;
  } catch {
    return false; // read-only FS
  }
}

export async function listLeads(): Promise<Lead[]> {
  if (useSupabase) {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/leads?select=*&order=created_at.desc`,
      { headers: supabaseHeaders(), cache: 'no-store' },
    );
    if (!res.ok) throw new Error(`Supabase read failed: ${res.status}`);
    const rows = (await res.json()) as Record<string, unknown>[];
    return rows.map(fromSupabaseRow);
  }

  const fileLeads = await readFileLeads();
  if (fileLeads === null) return [...(globalMemory.__leads as Lead[])];
  return fileLeads.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createLead(
  input: Omit<Lead, 'id' | 'createdAt' | 'status'> & { status?: LeadStatus },
): Promise<Lead> {
  const lead: Lead = {
    ...input,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    status: input.status ?? 'new',
    notes: input.notes ?? [],
  };

  if (useSupabase) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
      method: 'POST',
      headers: supabaseHeaders({ Prefer: 'return=representation' }),
      body: JSON.stringify(toSupabaseRow(lead)),
    });
    if (!res.ok) throw new Error(`Supabase insert failed: ${res.status}`);
    return lead;
  }

  const fileLeads = await readFileLeads();
  if (fileLeads !== null) {
    const next = [lead, ...fileLeads];
    const written = await writeFileLeads(next);
    if (written) return lead;
  }

  (globalMemory.__leads as Lead[]).unshift(lead);
  return lead;
}

export async function updateLead(
  id: string,
  patch: { status?: LeadStatus; note?: string },
): Promise<Lead | null> {
  if (useSupabase) {
    const current = await fetch(`${SUPABASE_URL}/rest/v1/leads?id=eq.${id}&select=*`, {
      headers: supabaseHeaders(),
      cache: 'no-store',
    });
    const [row] = (await current.json()) as Record<string, unknown>[];
    if (!row) return null;
    const lead = fromSupabaseRow(row);
    const updated = applyPatch(lead, patch);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/leads?id=eq.${id}`, {
      method: 'PATCH',
      headers: supabaseHeaders(),
      body: JSON.stringify({ status: updated.status, notes: updated.notes }),
    });
    if (!res.ok) throw new Error(`Supabase update failed: ${res.status}`);
    return updated;
  }

  const fileLeads = await readFileLeads();
  if (fileLeads !== null) {
    const index = fileLeads.findIndex((l) => l.id === id);
    if (index === -1) return null;
    const updated = applyPatch(fileLeads[index], patch);
    fileLeads[index] = updated;
    const written = await writeFileLeads(fileLeads);
    if (written) return updated;
  }

  const memory = globalMemory.__leads as Lead[];
  const index = memory.findIndex((l) => l.id === id);
  if (index === -1) return null;
  memory[index] = applyPatch(memory[index], patch);
  return memory[index];
}

function applyPatch(lead: Lead, patch: { status?: LeadStatus; note?: string }): Lead {
  return {
    ...lead,
    status: patch.status ?? lead.status,
    notes: patch.note
      ? [...(lead.notes ?? []), `${new Date().toISOString()} — ${patch.note}`]
      : lead.notes,
  };
}

/* --------------------------- Supabase mapping --------------------------- */

function toSupabaseRow(lead: Lead) {
  return {
    id: lead.id,
    created_at: lead.createdAt,
    type: lead.type,
    status: lead.status,
    name: lead.name,
    email: lead.email,
    phone: lead.phone ?? null,
    message: lead.message ?? null,
    source: lead.source ?? null,
    valuation: lead.valuation ?? null,
    tour: lead.tour ?? null,
    notes: lead.notes ?? [],
  };
}

function fromSupabaseRow(row: Record<string, unknown>): Lead {
  return {
    id: String(row.id),
    createdAt: String(row.created_at),
    type: row.type as Lead['type'],
    status: row.status as LeadStatus,
    name: String(row.name ?? ''),
    email: String(row.email ?? ''),
    phone: (row.phone as string) ?? undefined,
    message: (row.message as string) ?? undefined,
    source: (row.source as string) ?? undefined,
    valuation: (row.valuation as Lead['valuation']) ?? undefined,
    tour: (row.tour as Lead['tour']) ?? undefined,
    notes: (row.notes as string[]) ?? [],
  };
}

export function storageMode(): 'supabase' | 'file' | 'memory' {
  return useSupabase ? 'supabase' : 'file';
}
