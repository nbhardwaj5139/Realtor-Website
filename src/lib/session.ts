/**
 * Session constants with no Node-only dependencies, so `middleware.ts` can
 * import them without dragging `node:crypto` into the Edge runtime.
 */
export const SESSION_COOKIE = 'mg_admin_session';

export const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours
