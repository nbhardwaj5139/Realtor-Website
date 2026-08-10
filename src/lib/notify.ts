import { siteConfig } from '@/config/site';
import { formatCurrency } from './utils';
import type { Lead } from './types';

/**
 * Outbound notifications. Every integration is optional — with no environment
 * variables configured the app still works end to end and simply logs what it
 * *would* have sent, so the demo runs out of the box.
 *
 *   RESEND_API_KEY        → transactional email via Resend
 *   SENDGRID_API_KEY      → transactional email via SendGrid (fallback)
 *   NOTIFY_FROM_EMAIL     → verified sender address
 *   NOTIFY_TO_EMAIL       → where new-lead alerts go (defaults to siteConfig.email)
 *   CRM_WEBHOOK_URL       → Follow Up Boss / Zapier / Make webhook for lead sync
 */

type EmailPayload = { to: string; subject: string; html: string; replyTo?: string };

async function sendEmail({ to, subject, html, replyTo }: EmailPayload) {
  const from = process.env.NOTIFY_FROM_EMAIL || `${siteConfig.team} <onboarding@resend.dev>`;

  if (process.env.RESEND_API_KEY) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to: [to], subject, html, reply_to: replyTo }),
    });
    if (!res.ok) throw new Error(`Resend failed: ${res.status} ${await res.text()}`);
    return { provider: 'resend' as const };
  }

  if (process.env.SENDGRID_API_KEY) {
    const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: from.replace(/.*<|>.*/g, '') || from },
        subject,
        content: [{ type: 'text/html', value: html }],
      }),
    });
    if (!res.ok) throw new Error(`SendGrid failed: ${res.status} ${await res.text()}`);
    return { provider: 'sendgrid' as const };
  }

  console.info(`[notify] email suppressed (no provider configured) → ${to}: ${subject}`);
  return { provider: 'noop' as const };
}

async function syncToCrm(lead: Lead) {
  const url = process.env.CRM_WEBHOOK_URL;
  if (!url) {
    console.info(`[notify] CRM sync skipped (no CRM_WEBHOOK_URL) → lead ${lead.id}`);
    return { synced: false };
  }
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      source: siteConfig.url,
      event: 'lead.created',
      person: {
        firstName: lead.name.split(' ')[0],
        lastName: lead.name.split(' ').slice(1).join(' '),
        emails: [{ value: lead.email }],
        phones: lead.phone ? [{ value: lead.phone }] : [],
        tags: [lead.type, lead.valuation?.neighbourhoodName].filter(Boolean),
      },
      lead,
    }),
  });
  return { synced: res.ok };
}

const shell = (body: string) => `
<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:#F8F6F0;padding:32px 0;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #EFEBE1;">
    <div style="background:#0F172A;padding:24px 32px;">
      <div style="color:#C5A880;font-size:11px;letter-spacing:.22em;text-transform:uppercase;font-weight:600;">${siteConfig.tagline}</div>
      <div style="color:#fff;font-size:22px;font-weight:600;margin-top:6px;">${siteConfig.teamLong}</div>
    </div>
    <div style="padding:32px;color:#0F172A;line-height:1.6;font-size:15px;">${body}</div>
    <div style="padding:20px 32px;background:#F8F6F0;color:#64748b;font-size:12px;line-height:1.5;">
      ${siteConfig.brokerage}<br/>${siteConfig.office} · ${siteConfig.phone}
    </div>
  </div>
</div>`;

/** Fires on every new lead: alert the team, auto-respond to the visitor, sync CRM. */
export async function handleNewLead(lead: Lead) {
  const teamInbox = process.env.NOTIFY_TO_EMAIL || siteConfig.email;

  const detail = lead.valuation
    ? `<p><strong>${lead.valuation.address}</strong> — ${lead.valuation.neighbourhoodName}<br/>
       ${lead.valuation.propertyType} · ${lead.valuation.beds} bed · ${lead.valuation.baths} bath<br/>
       Estimate: <strong>${formatCurrency(lead.valuation.estimateLow)} – ${formatCurrency(lead.valuation.estimateHigh)}</strong><br/>
       Timeline: ${lead.valuation.timeline}</p>`
    : lead.tour
      ? `<p><strong>${lead.tour.listingAddress}</strong><br/>
         ${lead.tour.tourType === 'virtual' ? 'Virtual tour' : 'In-person tour'} ·
         ${lead.tour.preferredDate} at ${lead.tour.preferredTime}</p>`
      : lead.message
        ? `<p>${escapeHtml(lead.message)}</p>`
        : '';

  const results = await Promise.allSettled([
    sendEmail({
      to: teamInbox,
      replyTo: lead.email,
      subject: `New ${lead.type} lead — ${lead.name}`,
      html: shell(`
        <h2 style="margin:0 0 16px;font-size:20px;">New ${lead.type} lead</h2>
        <p><strong>${escapeHtml(lead.name)}</strong><br/>
        <a href="mailto:${lead.email}">${lead.email}</a>${lead.phone ? ` · ${escapeHtml(lead.phone)}` : ''}</p>
        ${detail}
        <p style="margin-top:24px;"><a href="${siteConfig.url}/admin" style="background:#0F172A;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;display:inline-block;">Open the lead inbox</a></p>`),
    }),
    sendEmail({
      to: lead.email,
      subject: autoResponderSubject(lead),
      html: shell(autoResponderBody(lead)),
    }),
    syncToCrm(lead),
  ]);

  results.forEach((r, i) => {
    if (r.status === 'rejected') {
      console.error(`[notify] step ${i} failed for lead ${lead.id}:`, r.reason);
    }
  });
}

function autoResponderSubject(lead: Lead) {
  if (lead.valuation) return `Your ${lead.valuation.neighbourhoodName} home value report`;
  if (lead.tour) return `Your tour request for ${lead.tour.listingAddress}`;
  return `Thanks for reaching out to ${siteConfig.team}`;
}

function autoResponderBody(lead: Lead) {
  const first = escapeHtml(lead.name.split(' ')[0]);

  if (lead.valuation) {
    const v = lead.valuation;
    return `
      <h2 style="margin:0 0 16px;font-size:20px;">Hi ${first}, here's your range</h2>
      <p>Based on what you told us about <strong>${escapeHtml(v.address)}</strong> in ${escapeHtml(v.neighbourhoodName)}:</p>
      <p style="font-size:26px;font-weight:700;margin:20px 0;color:#0F172A;">
        ${formatCurrency(v.estimateLow)} – ${formatCurrency(v.estimateHigh)}
      </p>
      <p>That's an algorithmic starting point from recent ${escapeHtml(v.neighbourhoodName)} activity — it hasn't seen your finishes, your lot or your light. We'll follow up within one business day with the full comparable breakdown and a walk-through of what would move the number.</p>
      <p style="margin-top:24px;">— ${siteConfig.agents.map((a) => a.name).join(' & ')}<br/>
      <a href="${siteConfig.phoneHref}">${siteConfig.phone}</a></p>`;
  }

  if (lead.tour) {
    return `
      <h2 style="margin:0 0 16px;font-size:20px;">Hi ${first}, we've got your request</h2>
      <p>You asked to see <strong>${escapeHtml(lead.tour.listingAddress)}</strong> on
      ${escapeHtml(lead.tour.preferredDate)} at ${escapeHtml(lead.tour.preferredTime)}
      (${lead.tour.tourType === 'virtual' ? 'virtual walkthrough' : 'in person'}).</p>
      <p>One of us will confirm the exact time shortly. If it's urgent, call or text
      <a href="${siteConfig.phoneHref}">${siteConfig.phone}</a> — we answer.</p>
      <p style="margin-top:24px;">— ${siteConfig.agents.map((a) => a.name).join(' & ')}</p>`;
  }

  return `
    <h2 style="margin:0 0 16px;font-size:20px;">Hi ${first}, thanks for reaching out</h2>
    <p>We've received your message and will reply within one business day. For anything
    time-sensitive, call or text <a href="${siteConfig.phoneHref}">${siteConfig.phone}</a>.</p>
    <p style="margin-top:24px;">— ${siteConfig.agents.map((a) => a.name).join(' & ')}</p>`;
}

/** Manual "send the CMA" action from the admin lead inbox. */
export async function sendCmaEmail(lead: Lead) {
  if (!lead.valuation) throw new Error('Lead has no valuation attached');
  const v = lead.valuation;

  await sendEmail({
    to: lead.email,
    subject: `Your comparative market analysis — ${v.address}`,
    html: shell(`
      <h2 style="margin:0 0 16px;font-size:20px;">Your CMA is ready</h2>
      <p>Hi ${escapeHtml(lead.name.split(' ')[0])}, attached is the full comparative market
      analysis for <strong>${escapeHtml(v.address)}</strong>.</p>
      <table style="width:100%;border-collapse:collapse;margin:20px 0;">
        <tr><td style="padding:8px 0;color:#64748b;">Estimated range</td>
            <td style="padding:8px 0;text-align:right;font-weight:600;">${formatCurrency(v.estimateLow)} – ${formatCurrency(v.estimateHigh)}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b;">Neighbourhood</td>
            <td style="padding:8px 0;text-align:right;font-weight:600;">${escapeHtml(v.neighbourhoodName)}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b;">Property</td>
            <td style="padding:8px 0;text-align:right;font-weight:600;">${escapeHtml(v.propertyType)} · ${v.beds} bed · ${v.baths} bath</td></tr>
      </table>
      <p>Ready to talk pricing strategy? Reply to this email or call
      <a href="${siteConfig.phoneHref}">${siteConfig.phone}</a>.</p>`),
  });
}

function escapeHtml(input: string) {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
