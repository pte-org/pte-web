const TOKEN_KEY = "aptis.accessToken";
const SESSION_KEY = "aptis.session";

function isBrowser(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.localStorage !== "undefined"
  );
}

/**
 * Thin, SSR-safe wrapper over localStorage for the access token.
 * On the server (no `window`) every call is a no-op / returns null.
 */
export const tokenStorage = {
  save(token: string): void {
    if (!isBrowser()) return;
    window.localStorage.setItem(TOKEN_KEY, token);
  },
  retrieve(): string | null {
    if (!isBrowser()) return null;
    const legacyToken = window.localStorage.getItem(TOKEN_KEY);
    if (legacyToken) return legacyToken;
    const rawSession = window.localStorage.getItem(SESSION_KEY);
    if (!rawSession) return null;
    try {
      const parsed = JSON.parse(rawSession) as { accessToken?: unknown };
      return typeof parsed.accessToken === "string" ? parsed.accessToken : null;
    } catch {
      return null;
    }
  },
  clear(): void {
    if (!isBrowser()) return;
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(SESSION_KEY);
  },
};
