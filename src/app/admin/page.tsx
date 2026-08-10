import type { Metadata } from 'next';
import { isAuthenticated, usingDefaultPassword } from '@/lib/auth';
import { listLeads, storageMode } from '@/lib/leads-store';
import { AdminLogin } from '@/components/admin/admin-login';
import { AdminDashboard } from '@/components/admin/admin-dashboard';
import type { Lead } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Team dashboard',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const authed = await isAuthenticated();

  if (!authed) {
    return <AdminLogin showDemoHint={usingDefaultPassword()} />;
  }

  let leads: Lead[] = [];
  let storageError: string | null = null;

  try {
    leads = await listLeads();
  } catch (error) {
    console.error('[admin] failed to load leads:', error);
    storageError = 'Could not reach the lead store. Check your Supabase configuration.';
  }

  return (
    <AdminDashboard
      leads={leads}
      storage={storageMode()}
      storageError={storageError}
      insecurePassword={usingDefaultPassword()}
    />
  );
}
