'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { siteConfig } from '@/config/site';
import { contactSchema, type ContactFormValues } from '@/lib/schemas';

export function EdContact() {
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '', phone: '', message: '', source: 'Editorial contact' },
  });

  async function onSubmit(data: ContactFormValues) {
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error ?? 'Request failed');
      setSent(true);
      reset();
      toast({ title: 'Message sent' });
    } catch (error) {
      toast({
        variant: 'error',
        title: "That didn't send",
        description: error instanceof Error ? error.message : undefined,
      });
    }
  }

  return (
    <>
      <section id="contact" className="bg-ed-paperWarm py-24 md:py-32">
        <div className="container grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-20">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-ed-accent">
              Get in touch
            </p>
            <h2 className="mt-5 font-serif text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.02] tracking-[-0.025em] text-ed-ink">
              Start with a
              <span className="italic text-ed-muted"> conversation.</span>
            </h2>
            <p className="mt-7 max-w-md text-[16px] leading-relaxed text-ed-inkSoft">
              Buying, selling, or just curious what the last year did to your street —
              there&apos;s no cost to asking, and no obligation after.
            </p>

            <dl className="mt-12 space-y-6 border-t border-ed-line pt-9">
              <div>
                <dt className="text-[11px] uppercase tracking-[0.18em] text-ed-muted">Office</dt>
                <dd className="mt-1.5 text-[16px] text-ed-ink">
                  <a href={siteConfig.phoneHref} className="hover:text-ed-accent">
                    {siteConfig.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-[0.18em] text-ed-muted">
                  {siteConfig.brokerage}
                </dt>
                <dd className="mt-1.5 text-[16px] leading-relaxed text-ed-ink">
                  {siteConfig.office}
                </dd>
              </div>
            </dl>
          </div>

          <div className="bg-ed-paper p-8 sm:p-10">
            {sent ? (
              <div className="flex min-h-[380px] flex-col items-center justify-center text-center">
                <CheckCircle2 className="h-12 w-12 text-ed-accent" strokeWidth={1.25} />
                <p className="mt-6 font-serif text-2xl text-ed-ink">Message received</p>
                <p className="mt-3 max-w-xs text-[15px] leading-relaxed text-ed-inkSoft">
                  One of the team will reply within one business day.
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="mt-7 border border-ed-ink px-5 py-2.5 text-[12px] uppercase tracking-[0.14em] text-ed-ink transition-colors hover:bg-ed-ink hover:text-ed-paper"
                >
                  Send another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
                <Field id="ed-name" label="Name" error={errors.name?.message} {...register('name')} />
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field id="ed-email" label="Email" type="email" error={errors.email?.message} {...register('email')} />
                  <Field id="ed-phone" label="Phone" type="tel" error={errors.phone?.message} {...register('phone')} />
                </div>
                <div>
                  <label htmlFor="ed-msg" className="block text-[11px] uppercase tracking-[0.18em] text-ed-muted">
                    How can we help?
                  </label>
                  <textarea
                    id="ed-msg"
                    rows={5}
                    className="mt-3 w-full resize-y border-0 border-b border-ed-line bg-transparent pb-3 text-[16px] text-ed-ink outline-none transition-colors focus:border-ed-ink"
                    {...register('message')}
                  />
                  {errors.message && (
                    <p className="mt-2 text-[12px] text-ed-accent">{errors.message.message}</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-2 inline-flex w-full items-center justify-center gap-2 bg-ed-ink px-6 py-4 text-[12px] uppercase tracking-[0.16em] text-ed-paper transition-colors hover:bg-ed-accent disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Sending
                    </>
                  ) : (
                    'Send message'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <footer className="bg-ed-night py-16 text-white">
        <div className="container">
          <div className="flex flex-col gap-10 border-b border-white/10 pb-12 md:flex-row md:justify-between">
            <div>
              <p className="font-serif text-[26px] leading-none">Team Pinto</p>
              <p className="mt-2.5 text-[10px] uppercase tracking-[0.3em] text-white/45">
                {siteConfig.brokerage}
              </p>
            </div>
            <div className="flex flex-wrap gap-x-8 gap-y-3 text-[13px]">
              {[
                ['Communities', '#communities'],
                ['Listings', '#listings'],
                ['Home value', '#value'],
                ['Team', '#team'],
                ['Reviews', '#reviews'],
              ].map(([label, href]) => (
                <a key={href} href={href} className="text-white/55 transition-colors hover:text-white">
                  {label}
                </a>
              ))}
              <Link href="/admin" className="text-white/55 transition-colors hover:text-white">
                Team login
              </Link>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-[13px]">
              {Object.entries(siteConfig.social)
                .filter(([, url]) => Boolean(url))
                .map(([name, url]) => (
                  <a
                    key={name}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="capitalize text-white/55 transition-colors hover:text-white"
                  >
                    {name}
                  </a>
                ))}
            </div>
          </div>

          <p className="mt-10 max-w-4xl text-[11px] leading-relaxed text-white/35">
            {siteConfig.brokerage}.{' '}
            {siteConfig.content.demoMode &&
              'Demonstration build — listings and market figures shown are sample data and do not represent real properties or transactions. '}
            Not intended to solicit buyers or sellers currently under contract. Home valuation
            ranges are generated by an automated model and are not an appraisal. Mortgage and land
            transfer tax figures are estimates — confirm with your lender and lawyer before making
            an offer.
          </p>
          <p className="mt-5 text-[11px] text-white/35">
            © {new Date().getFullYear()} Team Pinto.
          </p>
        </div>
      </footer>
    </>
  );
}

const Field = ({
  id,
  label,
  error,
  type = 'text',
  ...rest
}: {
  id: string;
  label: string;
  error?: string;
  type?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div>
    <label htmlFor={id} className="block text-[11px] uppercase tracking-[0.18em] text-ed-muted">
      {label}
    </label>
    <input
      id={id}
      type={type}
      className="mt-3 h-10 w-full border-0 border-b border-ed-line bg-transparent text-[16px] text-ed-ink outline-none transition-colors focus:border-ed-ink"
      {...rest}
    />
    {error && <p className="mt-2 text-[12px] text-ed-accent">{error}</p>}
  </div>
);
