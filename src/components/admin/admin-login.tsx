'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound, Loader2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label, FieldError } from '@/components/ui/label';
import { siteConfig } from '@/config/site';
import { loginSchema } from '@/lib/schemas';
import type { z } from 'zod';

type LoginValues = z.infer<typeof loginSchema>;

export function AdminLogin({ showDemoHint }: { showDemoHint: boolean }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { password: '' },
  });

  async function onSubmit(data: LoginValues) {
    setError(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload?.error ?? 'Sign-in failed');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed');
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-ink px-5 py-16">
      <div className="w-full max-w-md">
        <div className="text-center">
          <p className="heading-serif text-3xl font-semibold text-white">{siteConfig.team}</p>
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-gold">
            Team dashboard
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-10 rounded-2xl border border-white/10 bg-white p-8 shadow-luxe"
          noValidate
        >
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary">
              <KeyRound className="h-5 w-5 text-gold-bright" />
            </span>
            <div>
              <h1 className="heading-serif text-lg font-semibold text-slate-ink">Sign in</h1>
              <p className="text-sm text-muted-foreground">Agents only.</p>
            </div>
          </div>

          <Label htmlFor="password">Team password</Label>
          <Input
            id="password"
            type="password"
            autoFocus
            autoComplete="current-password"
            className="mt-2"
            {...register('password')}
          />
          <FieldError>{errors.password?.message}</FieldError>

          {error && (
            <p className="mt-3 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" className="mt-6 w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Signing in…
              </>
            ) : (
              'Enter dashboard'
            )}
          </Button>

          {showDemoHint && (
            <p className="mt-5 flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
              <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                No <code className="font-mono">ADMIN_PASSWORD</code> is set, so the demo password{' '}
                <code className="font-mono font-semibold">kw-demo-2026</code> is active. Set the
                environment variable before deploying.
              </span>
            </p>
          )}
        </form>
      </div>
    </main>
  );
}
