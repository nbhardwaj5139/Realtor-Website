'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { siteConfig } from '@/config/site';
import { contactSchema, type ContactFormValues } from '@/lib/schemas';

export function GuideContact() {
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '', phone: '', message: '', source: 'Move Guide contact' },
  });

  async function onSubmit(data: ContactFormValues) {
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload?.error ?? 'Request failed');
      }
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
    <section id="contact" className="py-16 md:py-24">
      <div className="container">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,480px)] lg:gap-16">
          <div>
            <p className="text-[13px] font-medium uppercase tracking-[0.14em] text-guide-forest">
              Talk to a person
            </p>
            <h2 className="mt-4 text-[2rem] font-semibold leading-tight tracking-[-0.02em] text-guide-ink sm:text-[2.5rem]">
              The tools only get you so far.
            </h2>
            <p className="mt-4 max-w-lg text-[17px] leading-relaxed text-guide-inkSoft">
              A calculator can&apos;t tell you whether the foundation crack matters, whether to
              wait until spring, or how hard to push on offer day. That part still takes a
              conversation — and it costs nothing to have one.
            </p>

            <div className="mt-9 flex flex-wrap gap-x-10 gap-y-5">
              {siteConfig.agents.map((agent) => (
                <div key={agent.name}>
                  <p className="text-[16px] font-medium text-guide-ink">{agent.name}</p>
                  {agent.role && <p className="text-[13px] text-guide-muted">{agent.role}</p>}
                </div>
              ))}
            </div>

            {(siteConfig.phone || siteConfig.email) && (
              <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 border-t border-guide-line pt-7 text-[15px]">
                {siteConfig.phone && (
                  <a href={siteConfig.phoneHref} className="text-guide-ink hover:text-guide-forest">
                    {siteConfig.phone}
                  </a>
                )}
                {siteConfig.email && (
                  <a href={`mailto:${siteConfig.email}`} className="text-guide-ink hover:text-guide-forest">
                    {siteConfig.email}
                  </a>
                )}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-guide-line bg-white p-6 sm:p-8">
            {sent ? (
              <div className="flex min-h-[340px] flex-col items-center justify-center text-center">
                <CheckCircle2 className="h-12 w-12 text-guide-forest" strokeWidth={1.5} />
                <h3 className="mt-5 text-[1.35rem] font-semibold text-guide-ink">Message received</h3>
                <p className="mt-2.5 max-w-xs text-[15px] leading-relaxed text-guide-inkSoft">
                  We&apos;ll reply within one business day.
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="mt-6 rounded-lg border border-guide-line px-4 py-2.5 text-[14px] text-guide-ink hover:border-guide-forest/40"
                >
                  Send another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <div>
                  <label htmlFor="gc-name" className="text-[14px] font-medium text-guide-ink">
                    Name
                  </label>
                  <input id="gc-name" className={ci} {...register('name')} />
                  <E>{errors.name?.message}</E>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="gc-email" className="text-[14px] font-medium text-guide-ink">
                      Email
                    </label>
                    <input id="gc-email" type="email" className={ci} {...register('email')} />
                    <E>{errors.email?.message}</E>
                  </div>
                  <div>
                    <label htmlFor="gc-phone" className="text-[14px] font-medium text-guide-ink">
                      Phone <span className="font-normal text-guide-muted">(optional)</span>
                    </label>
                    <input id="gc-phone" type="tel" className={ci} {...register('phone')} />
                    <E>{errors.phone?.message}</E>
                  </div>
                </div>
                <div>
                  <label htmlFor="gc-msg" className="text-[14px] font-medium text-guide-ink">
                    What&apos;s on your mind?
                  </label>
                  <textarea
                    id="gc-msg"
                    rows={5}
                    placeholder="We're in Laurelwood, thinking about listing in the spring, and we'd like to know what we'd need to do first."
                    className={`${ci} h-auto py-3`}
                    {...register('message')}
                  />
                  <E>{errors.message?.message}</E>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-guide-forest px-5 py-3.5 text-[15px] font-medium text-white transition-colors hover:bg-guide-forestDark disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Sending…
                    </>
                  ) : (
                    'Send message'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

const ci =
  'mt-2 h-11 w-full rounded-lg border border-guide-line bg-white px-3.5 text-[15px] text-guide-ink outline-none transition-colors placeholder:text-guide-muted/70 focus:border-guide-forest focus:ring-2 focus:ring-guide-forest/15';

function E({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return <p className="mt-1.5 text-[12px] font-medium text-guide-clay">{children}</p>;
}
