import { ApiError } from "./apiError";
import { createAuthorizedCall } from "./authRetry";
import {
  NETWORK_ERROR_MESSAGE,
  filenameFromDisposition,
  parseJsonSafely,
  unwrapResponse,
} from "./clientErrors";
import type {
  ApiClient,
  ApiClientOptions,
  DownloadResponse,
  EnsureFreshTokenOptions,
  RequestOptions,
} from "./clientTypes";
import { decodeAccessTokenClaims } from "./jwt";
import { createRefreshCoordinator } from "./refreshCoordinator";

// Requests and types across the package import these names from this module.
export { DEFAULT_PAGE_SIZE, StaleSessionRequestError } from "./clientTypes";
export type {
  ApiClient,
  ApiClientOptions,
  ApiResponseEnvelope,
  DownloadResponse,
  EnsureFreshTokenOptions,
  PageMeta,
  PagedResult,
  RefreshedTokens,
  RequestOptions,
  SessionGenerationGetter,
  TokenGetter,
} from "./clientTypes";

/**
 * Credential-exchange endpoints the backend serves without authentication. A
 * stale access token left in storage must not ride along: the resource server
 * rejects any invalid bearer token with 401 before it checks the path is public,
 * which made the first login attempt after a session expired always fail.
 * Duplicated from `AUTH_ENDPOINTS` for the same circular-import reason as
 * `createSessionApiClient`'s refresh path.
 */
const PUBLIC_AUTH_PATHS: readonly string[] = [
  "/api/v1/auth/login",
  "/api/v1/auth/refresh",
  "/api/v1/auth/logout",
  // A reset link is often opened in a browser that still holds an expired session; its token made the link hang.
  "/api/v1/auth/password-reset/request",
  "/api/v1/auth/password-reset/validate",
  "/api/v1/auth/password-reset/confirm",
];

function isPublicAuthPath(path: string): boolean {
  const pathname = path.split("?")[0] ?? path;
  return PUBLIC_AUTH_PATHS.includes(pathname);
}

async function toDownload(response: Response): Promise<DownloadResponse> {
  return {
    blob: await response.blob(),
    filename: filenameFromDisposition(response.headers.get("Content-Disposition")),
  };
}

export function createApiClient(options: ApiClientOptions): ApiClient {
  const { baseUrl, getToken, onUnauthorized, getSessionGeneration, fetchFn = fetch } = options;
  const tryRefresh = createRefreshCoordinator(options);
  const authorizedCall = createAuthorizedCall({ tryRefresh, onUnauthorized, getSessionGeneration });

  function buildHeaders(path: string, customHeaders?: HeadersInit, hasJsonBody = false): Headers {
    const headers = new Headers(customHeaders);
    const token = isPublicAuthPath(path) ? null : (getToken?.() ?? null);
    if (token) headers.set("Authorization", `Bearer ${token}`);
    if (hasJsonBody) headers.set("Content-Type", "application/json");
    return headers;
  }

  async function send(path: string, init: RequestInit): Promise<Response> {
    try {
      return await fetchFn(`${baseUrl}${path}`, init);
    } catch (cause) {
      throw new ApiError("network", 0, NETWORK_ERROR_MESSAGE, cause);
    }
  }

  // Each sender rebuilds its headers when called, so a retry after a refresh carries the new token.
  function sendJson(path: string, requestOptions: RequestOptions): () => Promise<Response> {
    const { body, headers: customHeaders, ...rest } = requestOptions;
    return () =>
      send(path, {
        ...rest,
        headers: buildHeaders(path, customHeaders, body !== undefined),
        body: body === undefined ? undefined : JSON.stringify(body),
      });
  }

  function sendForm(path: string, formData: FormData, requestOptions: RequestInit): () => Promise<Response> {
    const { headers: customHeaders, ...rest } = requestOptions;
    return () =>
      send(path, {
        ...rest,
        method: rest.method ?? "POST",
        headers: buildHeaders(path, customHeaders, false),
        body: formData,
      });
  }

  async function request<T>(path: string, requestOptions: RequestOptions = {}): Promise<T> {
    const response = await authorizedCall(sendJson(path, requestOptions));
    return unwrapResponse<T>(await parseJsonSafely(response));
  }

  async function upload<T>(path: string, formData: FormData, requestOptions: RequestInit = {}): Promise<T> {
    const response = await authorizedCall(sendForm(path, formData, requestOptions));
    return unwrapResponse<T>(await parseJsonSafely(response));
  }

  async function uploadDownload(
    path: string,
    formData: FormData,
    requestOptions: RequestInit = {},
  ): Promise<DownloadResponse> {
    return toDownload(await authorizedCall(sendForm(path, formData, requestOptions)));
  }

  async function download(path: string, requestOptions: RequestOptions = {}): Promise<DownloadResponse> {
    return toDownload(await authorizedCall(sendJson(path, requestOptions)));
  }

  async function openStream(
    path: string,
    requestOptions: RequestInit = {},
  ): Promise<ReadableStream<Uint8Array>> {
    const { headers: customHeaders, ...rest } = requestOptions;
    const response = await authorizedCall(
      () => send(path, { ...rest, headers: buildHeaders(path, customHeaders, false) }),
      { fenceAfterSuccess: false },
    );
    if (!response.body) {
      throw new ApiError("network", response.status, NETWORK_ERROR_MESSAGE);
    }
    return response.body;
  }

  async function ensureFreshAccessToken(
    freshOptions?: EnsureFreshTokenOptions,
  ): Promise<string | null> {
    const currentToken = getToken?.() ?? null;
    const minValidityMs = (freshOptions?.minValiditySeconds ?? 0) * 1000;
    const force = freshOptions?.forceRefresh ?? false;

    if (currentToken && !force) {
      const claims = decodeAccessTokenClaims(currentToken);
      if (claims && claims.expiresAt > Date.now() + minValidityMs) {
        return currentToken;
      }
    }

    const requestGeneration = getSessionGeneration?.();
    const { outcome: refreshOutcome } = await tryRefresh(requestGeneration);
    if (refreshOutcome === "refreshed") {
      if (requestGeneration === undefined || getSessionGeneration?.() === requestGeneration) {
        return getToken?.() ?? null;
      }
      return null;
    }
    if (refreshOutcome === "stale") {
      return null;
    }
    // Rejected, failed or unavailable: hand back what we have; the next request settles the session.
    return currentToken;
  }

  return { request, upload, uploadDownload, download, openStream, ensureFreshAccessToken };
}
