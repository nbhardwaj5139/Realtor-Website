import { z } from 'zod';

const phoneRegex = /^[+()\d][\d\s().-]{6,}$/;

/**
 * Optional numeric field.
 *
 * An empty text input arrives as `""`, which `z.coerce.number()` turns into 0 —
 * failing any `.min()` even though the field was left blank on purpose.
 * Normalise blanks to `undefined` first so `.optional()` actually applies.
 */
function optionalNumber(min: number, max: number) {
  return z.preprocess(
    (value) => (value === '' || value === null ? undefined : value),
    z.coerce.number().int().min(min).max(max).optional(),
  );
}

export const contactFields = {
  name: z.string().min(2, 'Please enter your name').max(120),
  email: z.string().email('Enter a valid email address').max(200),
  phone: z
    .string()
    .regex(phoneRegex, 'Enter a valid phone number')
    .max(40)
    .optional()
    .or(z.literal('')),
};

export const propertyTypeSchema = z.enum([
  'Single Family',
  'Semi-Detached',
  'Townhouse',
  'Condo',
]);

/* Step 1 — address & neighbourhood */
export const valuationStep1Schema = z.object({
  address: z.string().min(4, 'Enter your street address').max(200),
  neighbourhoodId: z.string().min(1, 'Choose your neighbourhood'),
});

/* Step 2 — property type */
export const valuationStep2Schema = z.object({
  propertyType: propertyTypeSchema,
});

/* Step 3 — size & condition */
export const valuationStep3Schema = z.object({
  beds: z.coerce.number().int().min(1).max(10),
  baths: z.coerce.number().int().min(1).max(10),
  sqft: optionalNumber(250, 15000),
  renovations: z.array(z.string()).default([]),
});

/* Step 4 — the lead gate */
export const valuationStep4Schema = z.object({
  ...contactFields,
  timeline: z.string().min(1, 'Let us know your timeline'),
  consent: z.literal(true, {
    errorMap: () => ({ message: 'Please agree so we can send your report' }),
  }),
});

export const valuationSchema = valuationStep1Schema
  .merge(valuationStep2Schema)
  .merge(valuationStep3Schema)
  .merge(valuationStep4Schema);

export type ValuationFormValues = z.infer<typeof valuationSchema>;

export const tourSchema = z.object({
  ...contactFields,
  listingId: z.string().min(1),
  listingAddress: z.string().min(1),
  preferredDate: z.string().min(1, 'Pick a date'),
  preferredTime: z.string().min(1, 'Pick a time'),
  tourType: z.enum(['in-person', 'virtual']),
  message: z.string().max(2000).optional(),
});

export type TourFormValues = z.infer<typeof tourSchema>;

export const contactSchema = z.object({
  ...contactFields,
  message: z.string().min(5, 'Tell us a little about what you need').max(2000),
  source: z.string().max(200).optional(),
});

export type ContactFormValues = z.infer<typeof contactSchema>;

export const inquirySchema = z.object({
  ...contactFields,
  message: z.string().max(2000).optional(),
  source: z.string().max(200).optional(),
});

/* Admin */
export const loginSchema = z.object({
  password: z.string().min(1, 'Enter the team password'),
});

export const listingKitSchema = z.object({
  address: z.string().min(3, 'Enter the property address').max(200),
  mlsId: z.string().max(40).optional(),
  city: z.string().min(2, 'Enter the city').max(80),
  neighbourhood: z.string().max(80).optional(),
  propertyType: propertyTypeSchema,
  price: z.coerce.number().min(1, 'Enter the list price'),
  beds: z.coerce.number().int().min(0).max(20),
  baths: z.coerce.number().int().min(0).max(20),
  sqft: z.coerce.number().int().min(100).max(30000),
  yearBuilt: optionalNumber(1700, 2100),
  lotSize: z.string().max(80).optional(),
  highlights: z.string().max(1200).optional(),
  openHouse: z.string().max(120).optional(),
  tone: z.enum(['luxury', 'family', 'investor', 'first-time']).default('luxury'),
});

export type ListingKitValues = z.infer<typeof listingKitSchema>;

export const leadUpdateSchema = z.object({
  id: z.string().min(1),
  status: z.enum(['new', 'contacted', 'nurturing', 'won', 'archived']).optional(),
  note: z.string().max(2000).optional(),
});
