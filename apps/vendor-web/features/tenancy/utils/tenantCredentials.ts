/** Public admin login URL for a tenant, derived from its slug. */
export const buildLoginUrl = (slug: string): string =>
  `https://${slug.trim()}.aptislms.vn/admin`;

/** Deterministic activation-code formatter (seam for the random generator). */
export const formatActivationCode = (
  slug: string,
  year: number,
  suffix: string,
): string => {
  const code = slug.replace(/[^a-z0-9]/gi, "").toUpperCase().slice(0, 6);
  return `APTIS-${code}-${year}-${suffix}`;
};

const SUFFIX_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const randomSuffix = (): string => {
  let out = "";
  for (let i = 0; i < 4; i += 1) {
    out += SUFFIX_CHARS[Math.floor(Math.random() * SUFFIX_CHARS.length)];
  }
  return out;
};

/** One-time activation code for a newly created tenant. */
export const generateActivationCode = (slug: string): string =>
  formatActivationCode(slug, new Date().getFullYear(), randomSuffix());
