import { ApiError, type ApiErrorKind } from "./apiError";
import { isMachineErrorCode } from "./errorMessage";

export type TokenGetter = () => string | null;

export interface RefreshedTokens {
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
}

export interface ApiClientOptions {
  /** Absolute origin of pte-api, e.g. `https://api.pte.vn` (no trailing slash). */
  baseUrl: string;
  /** Returns the current access token for Bearer injection, or null when signed out. */
  getToken?: TokenGetter;
  /** Returns the current refresh token, or null when signed out / none stored. */
  getRefreshToken?: TokenGetter;
  /**
   * Exchanges a refresh token for a new access/refresh token pair. Injected
   * (rather than this package calling its own `/auth/refresh` request)
   * so `client.ts` never depends on `requests/auth` — that module already
   * depends on `ApiClient` (a type-only import today, but a value import
   * here would be circular).
   */
  refreshAccessToken?: (refreshToken: string) => Promise<RefreshedTokens>;
  /** Called after a successful refresh so the app can persist the new tokens (e.g. sessionStorage). */
  onTokenRefreshed?: (tokens: RefreshedTokens) => void;
  /**
   * Called when a 401 could not be resolved by a refresh — either no
   * refresh is configured/available, or the refresh itself failed. The app
   * should clear its session here.
   */
  onUnauthorized?: () => void;
  /** Injectable fetch implementation; defaults to the global fetch. */
  fetchFn?: typeof fetch;
}

export interface RequestOptions extends Omit<RequestInit, "body"> {
  /** Plain object serialized to a JSON request body. */
  body?: unknown;
}

export interface DownloadResponse {
  blob: Blob;
  filename?: string;
}

export interface ApiResponseEnvelope<T> {
  success: boolean;
  data: T;
  status?: number;
  code?: string;
  message?: string | null;
  userMessage?: string | null;
  meta?: unknown;
  errors?: Record<string, string>;
  path?: string;
  requestId?: string;
  timestamp?: string;
}

export interface PageMeta {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PagedResult<T> {
  data: T[];
  meta: PageMeta;
}

export interface ApiClient {
  request<T>(path: string, options?: RequestOptions): Promise<T>;
  upload<T>(path: string, formData: FormData, options?: RequestInit): Promise<T>;
  uploadDownload(
    path: string,
    formData: FormData,
    options?: RequestInit,
  ): Promise<DownloadResponse>;
  download(path: string, options?: RequestOptions): Promise<DownloadResponse>;
}

const NETWORK_ERROR_MESSAGE =
  "Unable to connect to the server. Please check your connection and try again.";

const STATUS_KIND: Record<number, ApiErrorKind> = {
  400: "validation",
  401: "unauthorized",
  403: "forbidden",
  409: "conflict",
};

const DEFAULT_MESSAGE: Record<ApiErrorKind, string> = {
  validation: "The submitted data is invalid.",
  unauthorized: "Your session is invalid or has expired.",
  forbidden: "You do not have permission to access this resource.",
  conflict: "The request conflicts with existing data.",
  network: NETWORK_ERROR_MESSAGE,
  server: "The server encountered a problem. Please try again later.",
  unknown: "An unknown error occurred.",
};

function kindForStatus(status: number): ApiErrorKind {
  return STATUS_KIND[status] ?? (status >= 500 ? "server" : "unknown");
}

async function parseJsonSafely(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return undefined;
  }
}

function isEnvelope<T>(body: unknown): body is ApiResponseEnvelope<T> {
  return typeof body === "object" && body !== null && "success" in body && "data" in body;
}

function unwrapResponse<T>(body: unknown): T {
  if (isEnvelope<T>(body)) {
    if (body.meta !== undefined && Array.isArray(body.data)) {
      return { data: body.data, meta: body.meta } as T;
    }
    return body.data;
  }
  return body as T;
}

interface ExtractedErrorDetails {
  message?: string;
  code?: string;
  userMessage?: string;
}

function extractServerErrorDetails(body: unknown): ExtractedErrorDetails {
  if (typeof body !== "object" || body === null) return {};

  const candidate = body as {
    code?: unknown;
    message?: unknown;
    userMessage?: unknown;
  };
  const message = typeof candidate.message === "string" ? candidate.message : undefined;
  const explicitCode = typeof candidate.code === "string" && candidate.code.trim()
    ? candidate.code
    : undefined;
  const code = explicitCode ?? (isMachineErrorCode(message) ? message : undefined);
  const userMessage =
    typeof candidate.userMessage === "string" && candidate.userMessage.trim()
      ? candidate.userMessage
      : undefined;

  return { message, code, userMessage };
}

function filenameFromDisposition(disposition: string | null): string | undefined {
  if (!disposition) return undefined;
  const match = /filename="?([^";]+)"?/i.exec(disposition);
  return match?.[1];
}

export function createApiClient(options: ApiClientOptions): ApiClient {
  const {
    baseUrl,
    getToken,
    getRefreshToken,
    refreshAccessToken,
    onTokenRefreshed,
    onUnauthorized,
    fetchFn = fetch,
  } = options;

  // Dedups concurrent 401s into a single in-flight refresh — e.g. several
  // widgets each mid-request when the access token expires must not each
  // fire their own `/auth/refresh` call.
  let refreshingPromise: Promise<boolean> | null = null;

  async function tryRefresh(): Promise<boolean> {
    if (!refreshAccessToken) return false;
    const refreshToken = getRefreshToken?.() ?? null;
    if (!refreshToken) return false;

    if (!refreshingPromise) {
      refreshingPromise = refreshAccessToken(refreshToken)
        .then((tokens) => {
          onTokenRefreshed?.(tokens);
          return true;
        })
        .catch(() => false)
        .finally(() => {
          refreshingPromise = null;
        });
    }
    return refreshingPromise;
  }

  function buildHeaders(customHeaders?: HeadersInit, hasJsonBody = false): Headers {
    const headers = new Headers(customHeaders);
    const token = getToken?.() ?? null;
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

  async function request<T>(
    path: string,
    requestOptions: RequestOptions = {},
    isRetry = false,
  ): Promise<T> {
    const { body, headers: customHeaders, ...rest } = requestOptions;
    const response = await send(path, {
      ...rest,
      headers: buildHeaders(customHeaders, body !== undefined),
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    if (response.status === 401 && !isRetry && (await tryRefresh())) {
      return request<T>(path, requestOptions, true);
    }
    await assertOk(response);
    return unwrapResponse<T>(await parseJsonSafely(response));
  }

  async function upload<T>(
    path: string,
    formData: FormData,
    requestOptions: RequestInit = {},
    isRetry = false,
  ): Promise<T> {
    const { headers: customHeaders, ...rest } = requestOptions;
    const response = await send(path, {
      ...rest,
      method: rest.method ?? "POST",
      headers: buildHeaders(customHeaders, false),
      body: formData,
    });

    if (response.status === 401 && !isRetry && (await tryRefresh())) {
      return upload<T>(path, formData, requestOptions, true);
    }
    await assertOk(response);
    return unwrapResponse<T>(await parseJsonSafely(response));
  }

  async function uploadDownload(
    path: string,
    formData: FormData,
    requestOptions: RequestInit = {},
    isRetry = false,
  ): Promise<DownloadResponse> {
    const { headers: customHeaders, ...rest } = requestOptions;
    const response = await send(path, {
      ...rest,
      method: rest.method ?? "POST",
      headers: buildHeaders(customHeaders, false),
      body: formData,
    });

    if (response.status === 401 && !isRetry && (await tryRefresh())) {
      return uploadDownload(path, formData, requestOptions, true);
    }
    await assertOk(response);
    return {
      blob: await response.blob(),
      filename: filenameFromDisposition(response.headers.get("Content-Disposition")),
    };
  }

  async function download(
    path: string,
    requestOptions: RequestOptions = {},
    isRetry = false,
  ): Promise<DownloadResponse> {
    const { body, headers: customHeaders, ...rest } = requestOptions;
    const response = await send(path, {
      ...rest,
      headers: buildHeaders(customHeaders, body !== undefined),
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    if (response.status === 401 && !isRetry && (await tryRefresh())) {
      return download(path, requestOptions, true);
    }
    await assertOk(response);
    return {
      blob: await response.blob(),
      filename: filenameFromDisposition(response.headers.get("Content-Disposition")),
    };
  }

  return { request, upload, uploadDownload, download };
}
