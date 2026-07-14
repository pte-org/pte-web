export type SessionRole = "ADMIN" | "HOST" | "STUDENT";

export interface AptisSession {
  accessToken: string;
  refreshToken?: string;
  role: SessionRole;
  userType?: string;
  tenantId?: number | null;
  mustChangePassword?: boolean;
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
    if (!parsed.accessToken || !parsed.role) return null;
    return parsed as AptisSession;
  } catch {
    return null;
  }
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
    return Array.isArray(role)
      ? role.includes(session.role)
      : session.role === role;
  },
};
