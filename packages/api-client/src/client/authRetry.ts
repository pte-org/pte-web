import { ApiError } from "./apiError";
import {
  DEFAULT_MESSAGE,
  NETWORK_ERROR_MESSAGE,
  extractServerErrorDetails,
  kindForStatus,
  parseJsonSafely,
} from "./clientErrors";
import { StaleSessionRequestError, type ApiClientOptions } from "./clientTypes";
import type { TryRefresh } from "./refreshCoordinator";

export interface AuthorizedCallOptions {
  /**
   * Reject a successful response when the session changed while it was in
   * flight. On by default; a stream turns it off because its body is read
   * long after this point.
   */
  fenceAfterSuccess?: boolean;
}

/** Sends one request (built afresh on every call, so a retry carries the new token) and returns its successful response. */
export type AuthorizedCall = (
  send: () => Promise<Response>,
  options?: AuthorizedCallOptions,
) => Promise<Response>;

type AuthRetryDependencies = Pick<ApiClientOptions, "onUnauthorized" | "getSessionGeneration"> & {
  tryRefresh: TryRefresh;
};

/**
 * The one place that decides what a 401 means. The request is retried once
 * after a successful refresh. When the refresh could not be completed the
 * request fails as a network error and the session is left alone; only an
 * answer that is still 401 after that reaches `onUnauthorized`.
 */
export function createAuthorizedCall(dependencies: AuthRetryDependencies): AuthorizedCall {
  const { tryRefresh, onUnauthorized, getSessionGeneration } = dependencies;

  async function assertOk(response: Response): Promise<void> {
    if (response.ok) return;
    const errorBody = await parseJsonSafely(response);
    const kind = kindForStatus(response.status);
    const errorDetails = extractServerErrorDetails(errorBody);
    const message = errorDetails.message ?? DEFAULT_MESSAGE[kind];
    if (response.status === 401) onUnauthorized?.();
    throw new ApiError(kind, response.status, message, errorBody, {
      code: errorDetails.code,
      userMessage: errorDetails.userMessage,
    });
  }

  return async function authorizedCall(send, options = {}): Promise<Response> {
    const generation = getSessionGeneration?.();
    const sessionChanged = (): boolean =>
      generation !== undefined && getSessionGeneration?.() !== generation;

    let response = await send();
    if (response.status === 401) {
      const { outcome, cause } = await tryRefresh(generation);
      if (outcome === "stale" || sessionChanged()) throw new StaleSessionRequestError();
      if (outcome === "failed") throw new ApiError("network", 0, NETWORK_ERROR_MESSAGE, cause);
      if (outcome === "refreshed") response = await send();
    }
    await assertOk(response);
    if (options.fenceAfterSuccess !== false && sessionChanged()) {
      throw new StaleSessionRequestError();
    }
    return response;
  };
}
