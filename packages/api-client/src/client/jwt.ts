/**
 * iam's real JWT claims (`services/iam/.../security/AccessTokenIssuer.java`):
 * `sub` = user publicId, `roles` = string array (`Role.name()`, e.g.
 * `PLATFORM_ADMIN`), `tenant_id` = string UUID, present only for
 * tenant-scoped users (absent for platform roles). The access token carries
 * these — the login/refresh response body does not.
 */
export interface AccessTokenClaims {
  sub: string;
  roles: string[];
  tenantId: string | null;
  expiresAt: number;
}

/**
 * Decodes (never verifies — the server already signed/validated this token;
 * decoding here is purely so the UI can read `roles`/`tenant_id` for
 * routing and role-gating) the payload segment of a JWT. Returns `null` for
 * a malformed token rather than throwing, so a caller can fail closed
 * (treat as unauthenticated) instead of crashing the login flow.
 */
export function decodeAccessTokenClaims(accessToken: string): AccessTokenClaims | null {
  const segments = accessToken.split(".");
  if (segments.length !== 3) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(segments[1])) as {
      sub?: unknown;
      roles?: unknown;
      tenant_id?: unknown;
      exp?: unknown;
    };
    if (typeof payload.sub !== "string" || !Array.isArray(payload.roles)) return null;

    return {
      sub: payload.sub,
      roles: payload.roles.filter((role): role is string => typeof role === "string"),
      tenantId: typeof payload.tenant_id === "string" ? payload.tenant_id : null,
      expiresAt: typeof payload.exp === "number" ? payload.exp * 1000 : 0,
    };
  } catch {
    return null;
  }
}

function base64UrlDecode(segment: string): string {
  const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  // atob is available in both browsers and Next.js's edge/node runtimes;
  // decodeURIComponent+escape round-trip turns the latin1 atob output back
  // into the original UTF-8 JSON string.
  return decodeURIComponent(
    atob(padded)
      .split("")
      .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`)
      .join(""),
  );
}
