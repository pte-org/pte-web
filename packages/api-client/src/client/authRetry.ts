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

const RATE_LIMITED_STATUS = 429;
/** Waits to ride out a request rate limit; a longer wait than this is shown to the user instead. */
const MAX_RATE_LIMIT_WAIT_MS = 3000;
const MAX_RATE_LIMIT_RETRIES = 2;
const RATE_LIMIT_JITTER_MS = 250;
const MS_PER_SECOND = 1000;

/**
 * How long the server asks to wait, from `Retry-After` in seconds; null when it did not say or asks for more than
 * a short pause. Only a rejection that names a wait counts as a limit that will pass: it was refused before it
 * was processed, so sending it again cannot do anything twice.
 */
function rateLimitWaitMs(response: Response): number | null {
  const seconds = Number(response.headers.get("Retry-After"));
  if (!Number.isFinite(seconds) || seconds <= 0) return null;
  const waitMs = seconds * MS_PER_SECOND;
  return waitMs <= MAX_RATE_LIMIT_WAIT_MS ? waitMs : null;
}

const pause = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

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

    // A page opening sends many requests at once; a few can be turned away by the rate limit for a moment (the
    // ones sent before the session token is ready count against a small shared allowance). Waiting a second and
    // asking again lets them succeed instead of showing the person an error.
    const sendThroughRateLimit = async (): Promise<Response> => {
      let result = await send();
      for (let attempt = 0; attempt < MAX_RATE_LIMIT_RETRIES; attempt += 1) {
        const waitMs = result.status === RATE_LIMITED_STATUS ? rateLimitWaitMs(result) : null;
        if (waitMs === null) break;
        await pause(waitMs + Math.random() * RATE_LIMIT_JITTER_MS);
        if (sessionChanged()) throw new StaleSessionRequestError();
        result = await send();
      }
      return result;
    };

    let response = await sendThroughRateLimit();
    if (response.status === 401) {
      const { outcome, cause } = await tryRefresh(generation);
      if (outcome === "stale" || sessionChanged()) throw new StaleSessionRequestError();
      if (outcome === "failed") throw new ApiError("network", 0, NETWORK_ERROR_MESSAGE, cause);
      if (outcome === "refreshed") response = await sendThroughRateLimit();
    }
    await assertOk(response);
    if (options.fenceAfterSuccess !== false && sessionChanged()) {
      throw new StaleSessionRequestError();
    }
    return response;
  };
}
