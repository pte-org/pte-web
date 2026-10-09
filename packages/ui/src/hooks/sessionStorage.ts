/**
 * Matches the backend's real platform-wide role taxonomy exactly
 * This is what actually lands
 * in the JWT `roles` claim (`AccessTokenIssuer.java`), decoded client-side
 * via `decodeAccessTokenClaims` from `@pte/api-client`.
 */
export type SessionRole =
  | "PLATFORM_ADMIN"
  | "PLATFORM_MANAGER"
  | "ACADEMIC_MANAGER"
  | "ACADEMIC_STAFF"
  | "PLATFORM_AUTHOR"
  | "HOST_ADMIN"
  | "PROCTOR"
  | "EXAMINER"
  | "STUDENT";

/** Canonical roles accepted by new JWTs and new sessions. */
export const SESSION_ROLES = [
  "PLATFORM_ADMIN",
  "PLATFORM_MANAGER",
  "ACADEMIC_MANAGER",
  "ACADEMIC_STAFF",
  "HOST_ADMIN",
  "EXAMINER",
  "PROCTOR",
  "STUDENT",
] as const satisfies readonly SessionRole[];

/**
 * Normalizes the legacy author role at the UI boundary so existing tokens and
 * local sessions use the same capability as the canonical academic-staff role.
 */
export function normalizeSessionRole(role: unknown): SessionRole | null {
  if (typeof role !== "string") return null;
  if (role === "PLATFORM_AUTHOR") return "ACADEMIC_STAFF";
  return (SESSION_ROLES as readonly string[]).includes(role) ? (role as SessionRole) : null;
}

export function normalizeSessionRoles(roles: unknown): SessionRole[] {
  if (!Array.isArray(roles)) return [];
  return Array.from(
    new Set(roles.map(normalizeSessionRole).filter((role): role is SessionRole => role !== null)),
  );
}

export interface PteSession {
  accessToken: string;
  refreshToken?: string;
  /** A user's full JWT `roles` claim — may hold more than one role. */
  roles: SessionRole[];
  /** From the JWT `tenant_id` claim (UUID string) — null for platform roles. */
  tenantId?: string | null;
  expiresAt?: number;
}

const SESSION_KEY = "pte.session";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function parseSession(value: string | null): PteSession | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as Partial<PteSession>;
    const roles = normalizeSessionRoles(parsed.roles);
    if (!parsed.accessToken || roles.length === 0) {
      return null;
    }
    return { ...parsed, roles } as PteSession;
  } catch {
    return null;
  }
}

function matchesRole(session: PteSession, role: SessionRole | readonly SessionRole[]): boolean {
  const wanted = Array.isArray(role) ? role : [role];
  return session.roles.some((sessionRole) => wanted.includes(sessionRole));
}

export const sessionStorage = {
  save(session: PteSession): void {
    if (!isBrowser()) return;
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    noteSessionSaved(session);
  },
  retrieve(): PteSession | null {
    if (!isBrowser()) return null;
    return parseSession(window.localStorage.getItem(SESSION_KEY));
  },
  getAccessToken(): string | null {
    return this.retrieve()?.accessToken ?? null;
  },
  clear(): void {
    if (!isBrowser()) return;
    window.localStorage.removeItem(SESSION_KEY);
    noteSessionCleared();
  },
  isAuthenticated(): boolean {
    return Boolean(this.getAccessToken());
  },
  hasRole(role: SessionRole | readonly SessionRole[]): boolean {
    const session = this.retrieve();
    if (!session) return false;
    return matchesRole(session, role);
  },
};
import { noteSessionCleared, noteSessionSaved } from "./sessionLifecycle";
