import Anthropic from '@anthropic-ai/sdk';
import { siteConfig } from '@/config/site';
import { formatCurrency } from './utils';
import type { ListingKitValues } from './schemas';

/**
 * Listing marketing kit generator.
 *
 * With ANTHROPIC_API_KEY set, copy is written by Claude. Without it, the
 * deterministic template generator below runs instead — so the admin tool is
 * fully usable in the demo with no keys configured.
 */

export type ListingKit = {
  mlsDescription: string;
  instagramCaption: string;
  hashtags: string[];
  emailBlast: { subject: string; body: string };
  flyerHtml: string;
  source: 'claude' | 'template';
};

const TONE_BRIEF: Record<ListingKitValues['tone'], string> = {
  luxury:
    'Modern luxury. Restrained, confident, architectural. Speak to a move-up or high-net-worth buyer.',
  family:
    'Warm and practical. Lead with space, school catchment, yard and neighbourhood life.',
  investor:
    'Numbers-forward. Lead with yield, tenancy, transit proximity and rental demand drivers.',
  'first-time':
    'Encouraging and plain-spoken. Lead with affordability, carrying costs and what is move-in ready.',
};

const CORE_HASHTAGS = [
  '#KWrealestate',
  '#WaterlooHomes',
  '#KitchenerRealEstate',
  '#CambridgeOntario',
  '#WaterlooRegion',
  '#KWliving',
  '#OntarioRealEstate',
];

const CITY_HASHTAGS: Record<string, string[]> = {
  kitchener: ['#KitchenerON', '#DowntownKitchener', '#KitchenerHomes'],
  waterloo: ['#UptownWaterloo', '#WaterlooON', '#WaterlooRealtor'],
  cambridge: ['#CambridgeON', '#GaslightDistrict', '#HespelerVillage'],
};

export function hashtagsFor(city: string, neighbourhood?: string) {
  const key = city.trim().toLowerCase();
  const local = CITY_HASHTAGS[key] ?? [];
  const hoodTag = neighbourhood
    ? `#${neighbourhood.replace(/[^a-zA-Z0-9]/g, '')}`
    : undefined;
  return [...CORE_HASHTAGS, ...local, ...(hoodTag ? [hoodTag] : [])].slice(0, 14);
}

/* ------------------------- Deterministic fallback ------------------------- */

function templateKit(input: ListingKitValues): ListingKit {
  const {
    address,
    city,
    neighbourhood,
    propertyType,
    price,
    beds,
    baths,
    sqft,
    yearBuilt,
    lotSize,
    highlights,
    openHouse,
    tone,
  } = input;

  const features = (highlights ?? '')
    .split(/[,\n]/)
    .map((f) => f.trim())
    .filter(Boolean);

  const featureSentence = features.length
    ? `Standouts include ${features.slice(0, 4).join(', ')}.`
    : '';

  const openers: Record<ListingKitValues['tone'], string> = {
    luxury: `A considered ${propertyType.toLowerCase()} on ${address}`,
    family: `Room to grow on ${address}`,
    investor: `A clean investment opportunity at ${address}`,
    'first-time': `An honest first step at ${address}`,
  };

  const mlsDescription = [
    `${openers[tone]}${neighbourhood ? `, in the heart of ${neighbourhood}` : ''}, ${city}.`,
    `${beds} bedroom${beds === 1 ? '' : 's'} and ${baths} bathroom${baths === 1 ? '' : 's'} across roughly ${sqft.toLocaleString()} square feet${yearBuilt ? `, built in ${yearBuilt}` : ''}${lotSize ? ` on a ${lotSize} lot` : ''}.`,
    featureSentence,
    `Waterloo Region continues to draw buyers from the GTA for the commute, the tech corridor and the value — and ${city} sits at the centre of it.`,
    `Offered at ${formatCurrency(price)}.${openHouse ? ` Open house ${openHouse}.` : ''} Book your private showing with ${siteConfig.team} at ${siteConfig.phone}.`,
  ]
    .filter(Boolean)
    .join(' ');

  const instagramCaption = [
    `${openers[tone].toUpperCase()} 🔑`,
    '',
    `${beds} bed · ${baths} bath · ${sqft.toLocaleString()} sq ft`,
    `${neighbourhood ? `${neighbourhood}, ` : ''}${city} · ${formatCurrency(price)}`,
    '',
    features.length ? features.slice(0, 3).map((f) => `→ ${f}`).join('\n') : '',
    '',
    openHouse ? `Open house ${openHouse}. ` : '',
    `DM us or call ${siteConfig.phone} for a private tour.`,
  ]
    .filter((line) => line !== undefined)
    .join('\n')
    .replace(/\n{3,}/g, '\n\n');

  return {
    mlsDescription,
    instagramCaption,
    hashtags: hashtagsFor(city, neighbourhood),
    emailBlast: {
      subject: `Just listed in ${neighbourhood ?? city} — ${formatCurrency(price)}`,
      body: `${mlsDescription}\n\n${openHouse ? `Open house: ${openHouse}\n\n` : ''}Reply to this email or call ${siteConfig.phone} to book a private showing.\n\n— ${siteConfig.agents.map((a) => a.name).join(' & ')}, ${siteConfig.teamLong}`,
    },
    flyerHtml: buildFlyerHtml(input, features),
    source: 'template',
  };
}

/* ------------------------------ Claude path ------------------------------ */

const KIT_SCHEMA = {
  type: 'object',
  properties: {
    mlsDescription: {
      type: 'string',
      description:
        'MLS property description, 120-200 words, no fair-housing violations, no absolute claims about investment returns.',
    },
    instagramCaption: {
      type: 'string',
      description: 'Instagram caption with line breaks and at most 3 emoji. No hashtags.',
    },
    emailSubject: { type: 'string' },
    emailBody: { type: 'string' },
  },
  required: ['mlsDescription', 'instagramCaption', 'emailSubject', 'emailBody'],
  additionalProperties: false,
} as const;

async function claudeKit(input: ListingKitValues): Promise<ListingKit> {
  const client = new Anthropic();

  const brief = [
    `Address: ${input.address}, ${input.city}, Ontario`,
    input.neighbourhood ? `Neighbourhood: ${input.neighbourhood}` : null,
    input.mlsId ? `MLS ID: ${input.mlsId}` : null,
    `Property type: ${input.propertyType}`,
    `List price: ${formatCurrency(input.price)}`,
    `Beds: ${input.beds} · Baths: ${input.baths} · Approx ${input.sqft} sq ft`,
    input.yearBuilt ? `Year built: ${input.yearBuilt}` : null,
    input.lotSize ? `Lot: ${input.lotSize}` : null,
    input.highlights ? `Agent notes / features: ${input.highlights}` : null,
    input.openHouse ? `Open house: ${input.openHouse}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  const response = await client.messages.create({
    model: 'claude-opus-5',
    max_tokens: 4000,
    system: [
      `You write listing marketing copy for ${siteConfig.teamLong}, a real estate team in Kitchener-Waterloo, Ontario, Canada.`,
      'Write for the Waterloo Region market: Toronto commuters on the GO line, tech workers near Google KW and the David Johnston R&D Park, and families choosing WRDSB or WCDSB catchments.',
      'Use Canadian spelling and Canadian dollar figures. Never state or imply a preference based on race, religion, family status, disability, or any other protected ground under the Ontario Human Rights Code — describe the property, not the buyer.',
      'Never guarantee appreciation, rental income, or resale value. Do not invent features, measurements, or school names that were not provided.',
      `Tone: ${TONE_BRIEF[input.tone]}`,
    ].join(' '),
    messages: [
      {
        role: 'user',
        content: `Write the marketing kit for this listing:\n\n${brief}`,
      },
    ],
    output_config: { format: { type: 'json_schema', schema: KIT_SCHEMA } },
  });

  const text = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('');

  const parsed = JSON.parse(text) as {
    mlsDescription: string;
    instagramCaption: string;
    emailSubject: string;
    emailBody: string;
  };

  const features = (input.highlights ?? '')
    .split(/[,\n]/)
    .map((f) => f.trim())
    .filter(Boolean);

  return {
    mlsDescription: parsed.mlsDescription,
    instagramCaption: parsed.instagramCaption,
    hashtags: hashtagsFor(input.city, input.neighbourhood),
    emailBlast: { subject: parsed.emailSubject, body: parsed.emailBody },
    flyerHtml: buildFlyerHtml(input, features),
    source: 'claude',
  };
}

export async function generateListingKit(input: ListingKitValues): Promise<ListingKit> {
  if (!process.env.ANTHROPIC_API_KEY) return templateKit(input);

  try {
    return await claudeKit(input);
  } catch (error) {
    // A model outage should never block the realtor — fall back to templates.
    console.error('[listing-kit] Claude generation failed, using template:', error);
    return templateKit(input);
  }
}

/* ------------------------------ Flyer layout ------------------------------ */

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Print-ready open house flyer — 8.5x11, previewed in an iframe in /admin. */
function buildFlyerHtml(input: ListingKitValues, features: string[]) {
  const {
    address,
    city,
    neighbourhood,
    price,
    beds,
    baths,
    sqft,
    yearBuilt,
    lotSize,
    openHouse,
  } = input;

  return `<!doctype html>
<html lang="en-CA">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(address)} — Open House</title>
<style>
  @page { size: letter; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Plus Jakarta Sans', -apple-system, Segoe UI, Roboto, sans-serif; color: #0F172A; background: #F8F6F0; }
  .sheet { width: 8.5in; min-height: 11in; margin: 0 auto; background: #fff; display: flex; flex-direction: column; }
  .hero { height: 4.2in; background: linear-gradient(160deg, #0F172A, #1e293b); color: #fff; padding: 0.6in; display: flex; flex-direction: column; justify-content: flex-end; }
  .eyebrow { font-size: 11px; letter-spacing: .24em; text-transform: uppercase; color: #C5A880; font-weight: 700; }
  h1 { font-family: Georgia, 'Playfair Display', serif; font-size: 40px; font-weight: 600; line-height: 1.1; margin-top: 14px; }
  .sub { margin-top: 10px; font-size: 15px; color: rgba(255,255,255,.7); }
  .price { margin-top: 22px; font-family: Georgia, serif; font-size: 34px; color: #C5A880; }
  .body { padding: 0.55in 0.6in; flex: 1; }
  .specs { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; border-top: 1px solid #EFEBE1; border-bottom: 1px solid #EFEBE1; padding: 20px 0; }
  .spec b { display: block; font-size: 20px; font-family: Georgia, serif; }
  .spec span { font-size: 10px; letter-spacing: .14em; text-transform: uppercase; color: #64748b; }
  .features { margin-top: 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px 24px; }
  .features li { list-style: none; font-size: 13px; padding-left: 16px; position: relative; color: #334155; }
  .features li:before { content: ''; position: absolute; left: 0; top: 7px; width: 6px; height: 6px; border-radius: 50%; background: #C5A880; }
  .open { margin-top: 26px; background: #C5A880; color: #0F172A; padding: 16px 20px; border-radius: 10px; font-weight: 700; font-size: 15px; }
  .footer { background: #0F172A; color: #fff; padding: 0.4in 0.6in; display: flex; justify-content: space-between; align-items: center; }
  .footer .team { font-family: Georgia, serif; font-size: 20px; }
  .footer .meta { text-align: right; font-size: 12px; color: rgba(255,255,255,.65); line-height: 1.6; }
  .disclaimer { font-size: 8px; color: rgba(255,255,255,.4); margin-top: 8px; }
</style>
</head>
<body>
  <div class="sheet">
    <div class="hero">
      <p class="eyebrow">${escapeHtml(neighbourhood ? `${neighbourhood} · ${city}` : city)}, Ontario</p>
      <h1>${escapeHtml(address)}</h1>
      <p class="sub">${beds} bedroom · ${baths} bathroom · ${sqft.toLocaleString()} sq ft${yearBuilt ? ` · built ${yearBuilt}` : ''}</p>
      <p class="price">${formatCurrency(price)}</p>
    </div>

    <div class="body">
      <div class="specs">
        <div class="spec"><b>${beds}</b><span>Bedrooms</span></div>
        <div class="spec"><b>${baths}</b><span>Bathrooms</span></div>
        <div class="spec"><b>${sqft.toLocaleString()}</b><span>Sq ft</span></div>
        <div class="spec"><b>${escapeHtml(lotSize || '—')}</b><span>Lot</span></div>
      </div>

      ${
        features.length
          ? `<ul class="features">${features
              .slice(0, 8)
              .map((f) => `<li>${escapeHtml(f)}</li>`)
              .join('')}</ul>`
          : ''
      }

      ${openHouse ? `<div class="open">Open House · ${escapeHtml(openHouse)}</div>` : ''}
    </div>

    <div class="footer">
      <div>
        <div class="team">${escapeHtml(siteConfig.teamLong)}</div>
        <div class="disclaimer">${escapeHtml(siteConfig.brokerage)}. Measurements approximate. Not intended to solicit buyers or sellers currently under contract.</div>
      </div>
      <div class="meta">
        ${escapeHtml(siteConfig.phone)}<br />
        ${escapeHtml(siteConfig.email)}
      </div>
    </div>
  </div>
</body>
</html>`;
}
