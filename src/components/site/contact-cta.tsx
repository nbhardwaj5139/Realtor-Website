'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Loader2, Mail, MapPin, Phone } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Label, FieldError } from '@/components/ui/label';
import { Reveal } from '@/components/ui/reveal';
import { useToast } from '@/components/ui/toast';
import { siteConfig, hasContactDetails } from '@/config/site';
import { contactSchema, type ContactFormValues } from '@/lib/schemas';

export function ContactCta() {
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '', phone: '', message: '', source: 'Homepage contact' },
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
      toast({ title: 'Message sent', description: "We'll be in touch within one business day." });
    } catch (error) {
      toast({
        variant: 'error',
        title: "That didn't send",
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    }
  }

  return (
    <section id="contact" className="section bg-background">
      <div className="container">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <Reveal from="left">
            <p className="eyebrow mb-4">Let&apos;s talk</p>
            <h2 className="heading-serif text-balance text-3xl font-medium leading-[1.12] text-slate-ink sm:text-4xl lg:text-[2.75rem]">
              Two agents. One conversation. No pressure.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground">
              Whether you&apos;re nine months out or you got a job offer in Toronto yesterday,
              start with a call. We&apos;ll tell you honestly whether now is your moment.
            </p>

            <div className="mt-10 space-y-6">
              {siteConfig.agents.map((agent) => (
                <div key={agent.name} className="flex gap-5">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-slate-ink font-serif text-lg font-semibold text-gold">
                    {agent.initials}
                  </span>
                  <div>
                    <p className="heading-serif text-lg font-semibold text-slate-ink">
                      {agent.name}
                    </p>
                    {agent.role && (
                      <p className="text-xs uppercase tracking-wider text-gold">{agent.role}</p>
                    )}
                    {agent.bio && (
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {agent.bio}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {hasContactDetails && (
              <div className="mt-10 space-y-4 border-t border-border pt-8">
                {siteConfig.phone && (
                  <a
                    href={siteConfig.phoneHref}
                    className="flex items-center gap-3 text-slate-ink transition-colors hover:text-gold-bright"
                  >
                    <Phone className="h-4 w-4 text-gold" />
                    <span className="font-medium">{siteConfig.phone}</span>
                  </a>
                )}
                {siteConfig.email && (
                  <a
                    href={`mailto:${siteConfig.email}`}
                    className="flex items-center gap-3 text-slate-ink transition-colors hover:text-gold-bright"
                  >
                    <Mail className="h-4 w-4 text-gold" />
                    <span className="font-medium">{siteConfig.email}</span>
                  </a>
                )}
                {siteConfig.office && (
                  <p className="flex items-start gap-3 text-muted-foreground">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                    {siteConfig.office}
                  </p>
                )}
              </div>
            )}
          </Reveal>

          <Reveal from="right" delay={0.1}>
            <div className="rounded-2xl border border-border bg-white p-7 shadow-card sm:p-9">
              {sent ? (
                <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
                  <CheckCircle2 className="h-16 w-16 text-emerald-600" strokeWidth={1.5} />
                  <h3 className="heading-serif mt-6 text-2xl font-semibold text-slate-ink">
                    Message received
                  </h3>
                  <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
                    One of us will reply within one business day.
                    {siteConfig.phone && (
                      <>
                        {' '}
                        If it&apos;s urgent, call or text{' '}
                        <a
                          href={siteConfig.phoneHref}
                          className="font-medium text-slate-ink underline underline-offset-4"
                        >
                          {siteConfig.phone}
                        </a>
                        .
                      </>
                    )}
                  </p>
                  <Button variant="outline" className="mt-7" onClick={() => setSent(false)}>
                    Send another
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                  <div>
                    <Label htmlFor="contact-name">Full name</Label>
                    <Input
                      id="contact-name"
                      className="mt-2"
                      placeholder="Jordan Whitfield"
                      aria-invalid={!!errors.name}
                      {...register('name')}
                    />
                    <FieldError>{errors.name?.message}</FieldError>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="contact-email">Email</Label>
                      <Input
                        id="contact-email"
                        type="email"
                        className="mt-2"
                        placeholder="you@example.com"
                        aria-invalid={!!errors.email}
                        {...register('email')}
                      />
                      <FieldError>{errors.email?.message}</FieldError>
                    </div>
                    <div>
                      <Label htmlFor="contact-phone">
                        Phone <span className="text-muted-foreground">(optional)</span>
                      </Label>
                      <Input
                        id="contact-phone"
                        type="tel"
                        className="mt-2"
                        placeholder="(519) 555-0142"
                        {...register('phone')}
                      />
                      <FieldError>{errors.phone?.message}</FieldError>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="contact-message">How can we help?</Label>
                    <Textarea
                      id="contact-message"
                      className="mt-2 min-h-[150px]"
                      placeholder="We're in Laurelwood and thinking about listing in the spring. We'd like to know what our house is worth and what we'd need to do to get top dollar."
                      aria-invalid={!!errors.message}
                      {...register('message')}
                    />
                    <FieldError>{errors.message?.message}</FieldError>
                  </div>

                  <Button type="submit" variant="gold" size="lg" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Sending…
                      </>
                    ) : (
                      'Start the conversation'
                    )}
                  </Button>

                  <p className="text-center text-xs leading-relaxed text-muted-foreground">
                    We reply to every message ourselves — no call centre, no auto-dialer.
                  </p>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
