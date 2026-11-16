import type { ApiClientOptions } from "./clientTypes";

/**
 * What became of one attempt to refresh the session:
 * - `refreshed`: new tokens were stored, the request may be retried;
 * - `rejected`: the server refused the refresh token, the session is over;
 * - `failed`: the refresh call itself could not be completed (network,
 *   timeout, server error); the session is kept so the user is not signed
 *   out by a blip;
 * - `stale`: the session changed (logout, account switch) meanwhile;
 * - `unavailable`: the session cannot be continued from here — no refresh
 *   is configured, there is no refresh token, or the new tokens could not
 *   be stored. Treated like a refusal: the caller ends the session.
 */
export type RefreshOutcome = "refreshed" | "rejected" | "failed" | "stale" | "unavailable";

export interface RefreshResult {
  outcome: RefreshOutcome;
  /** Why a `failed` attempt failed, kept for the error the request surfaces. */
  cause?: unknown;
}

export type TryRefresh = (expectedGeneration?: number) => Promise<RefreshResult>;

type RefreshDependencies = Pick<
  ApiClientOptions,
  "getRefreshToken" | "refreshAccessToken" | "onTokenRefreshed" | "getSessionGeneration"
>;

/**
 * Builds the refresh step shared by every request of one client. Concurrent
 * 401s are folded into a single in-flight refresh — several widgets each
 * mid-request when the access token expires must not each fire their own
 * `/auth/refresh` call. A finished attempt is never kept, so the next 401
 * after a failure starts a new one.
 */
export function createRefreshCoordinator(dependencies: RefreshDependencies): TryRefresh {
  const { getRefreshToken, refreshAccessToken, onTokenRefreshed, getSessionGeneration } = dependencies;
  let inFlight: { generation: number | undefined; promise: Promise<RefreshResult> } | null = null;

  return async function tryRefresh(expectedGeneration?: number): Promise<RefreshResult> {
    if (!refreshAccessToken) return { outcome: "unavailable" };
    if (expectedGeneration !== undefined && getSessionGeneration?.() !== expectedGeneration) {
      return { outcome: "stale" };
    }
    const refreshToken = getRefreshToken?.() ?? null;
    if (!refreshToken) return { outcome: "unavailable" };
    const generationAtStart = expectedGeneration ?? getSessionGeneration?.();
    const sessionChanged = (): boolean =>
      generationAtStart !== undefined && getSessionGeneration?.() !== generationAtStart;

    if (!inFlight || inFlight.generation !== generationAtStart) {
      // Two handlers, not then().catch(): only a rejection of the refresh call itself means "failed".
      const promise = refreshAccessToken(refreshToken).then(
        (tokens): RefreshResult => {
          if (tokens === null) return { outcome: "rejected" };
          if (sessionChanged()) return { outcome: "stale" };
          try {
            onTokenRefreshed?.(tokens);
          } catch {
            // The server has already replaced the refresh token; one we could not store is lost,
            // and the old one is dead. Keeping this session would only fail again on every request.
            return { outcome: "unavailable" };
          }
          return { outcome: "refreshed" };
        },
        (cause: unknown): RefreshResult => ({ outcome: "failed", cause }),
      );
      inFlight = { generation: generationAtStart, promise };
      const forget = (): void => {
        if (inFlight?.promise === promise) {
          inFlight = null;
        }
      };
      // Also on rejection, so an attempt that threw unexpectedly is not handed to later requests.
      void promise.then(forget, forget);
    }
    const result = await inFlight.promise;
    if (result.outcome === "refreshed" && sessionChanged()) return { outcome: "stale" };
    return result;
  };
}
