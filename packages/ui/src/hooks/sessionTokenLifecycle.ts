type TokenRefreshListener = (accessToken: string) => void;

const tokenListeners = new Set<TokenRefreshListener>();

/**
 * Notifies all registered listeners when a new access token is saved
 * as part of a token refresh, without advancing the identity generation.
 */
export function noteTokenRefreshed(accessToken: string): void {
  for (const listener of tokenListeners) {
    try {
      listener(accessToken);
    } catch {
      // safe suppression of subscriber errors
    }
  }
}

/**
 * Subscribes to token refresh updates. Returns an unsubscribe function.
 */
export function subscribeTokenRefresh(listener: TokenRefreshListener): () => void {
  tokenListeners.add(listener);
  return () => {
    tokenListeners.delete(listener);
  };
}
