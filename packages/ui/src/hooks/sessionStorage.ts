/**
 * Matches iam's real platform-wide role taxonomy exactly
 * (`services/iam/.../domain/enums/Role.java`) — this is what actually lands
 * in the JWT `roles` claim (`AccessTokenIssuer.java`), decoded client-side
 * via `decodeAccessTokenClaims` from `@aptis/api-client`.
 */
export type SessionRole =
  | "PLATFORM_ADMIN"
  | "PLATFORM_AUTHOR"
  | "HOST_ADMIN"
  | "HOST_AUTHOR"
  | "PROCTOR"
  | "STUDENT";

export interface AptisSession {
  accessToken: string;
  refreshToken?: string;
  /** A user's full JWT `roles` claim — may hold more than one role. */
  roles: SessionRole[];
  /** From the JWT `tenant_id` claim (UUID string) — null for platform roles. */
  tenantId?: string | null;
  expiresAt?: number;
}

const SESSION_KEY = "aptis.session";

function isBrowser(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.localStorage !== "undefined"
  );
}

function parseSession(value: string | null): AptisSession | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as Partial<AptisSession>;
    if (!parsed.accessToken || !Array.isArray(parsed.roles) || parsed.roles.length === 0) {
      return null;
    }
    return parsed as AptisSession;
  } catch {
    return null;
  }
}

function matchesRole(session: AptisSession, role: SessionRole | SessionRole[]): boolean {
  const wanted = Array.isArray(role) ? role : [role];
  return session.roles.some((sessionRole) => wanted.includes(sessionRole));
}

export const sessionStorage = {
  save(session: AptisSession): void {
    if (!isBrowser()) return;
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  },
  retrieve(): AptisSession | null {
    if (!isBrowser()) return null;
    return parseSession(window.localStorage.getItem(SESSION_KEY));
  },
  getAccessToken(): string | null {
    return this.retrieve()?.accessToken ?? null;
  },
  clear(): void {
    if (!isBrowser()) return;
    window.localStorage.removeItem(SESSION_KEY);
  },
  isAuthenticated(): boolean {
    return Boolean(this.getAccessToken());
  },
  hasRole(role: SessionRole | SessionRole[]): boolean {
    const session = this.retrieve();
    if (!session) return false;
    return matchesRole(session, role);
  },
};
