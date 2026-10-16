type TokenRefreshListener = (accessToken: string) => void;

const tokenListeners = new Set<TokenRefreshListener>();

/**
 * Notifies subscribers after a new access token is persisted by the session
 * adapter. Token refresh is an API/session concern, so this lifecycle lives
 * beside the shared API client instead of in the UI package.
 */
export function noteTokenRefreshed(accessToken: string): void {
  for (const listener of tokenListeners) {
    try {
      listener(accessToken);
    } catch {
      // A subscriber must not break the refresh pipeline for other consumers.
    }
  }
}

/**
 * Subscribes to access-token refresh events. Returns an unsubscribe function.
 */
export function subscribeTokenRefresh(listener: TokenRefreshListener): () => void {
  tokenListeners.add(listener);
  return () => {
    tokenListeners.delete(listener);
  };
}
