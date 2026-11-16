export type TokenGetter = () => string | null;
export type SessionGenerationGetter = () => number;

export interface RefreshedTokens {
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
  /** Present on the live identity refresh response; optional for old clients. */
  mustChangePassword?: boolean;
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
   *
   * The three outcomes mean different things and must be kept apart:
   * - resolves with tokens: the session continues;
   * - resolves with `null`: the server REFUSED the refresh token (it is
   *   expired, revoked or malformed), so the session is over and
   *   `onUnauthorized` runs;
   * - rejects: the refresh could not be completed right now (network down,
   *   timeout, server error). The session is kept and the request fails
   *   with a network error, so a connection blip never signs the user out.
   */
  refreshAccessToken?: (refreshToken: string) => Promise<RefreshedTokens | null>;
  /**
   * Called after a successful refresh so the app can persist the new tokens (e.g. sessionStorage).
   * If it throws, the new tokens are lost and the old refresh token is already spent, so the
   * session ends through `onUnauthorized`.
   */
  onTokenRefreshed?: (tokens: RefreshedTokens) => void;
  /**
   * Called when a 401 could not be resolved by a refresh — either no
   * refresh is configured/available, or the server refused the refresh
   * token. The app should clear its session here. Not called when the
   * refresh merely failed to complete.
   */
  onUnauthorized?: () => void;
  /** Current protected-session generation; prevents an old refresh/result from touching a new account. */
  getSessionGeneration?: SessionGenerationGetter;
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

export const DEFAULT_PAGE_SIZE = 10;

export interface PagedResult<T> {
  data: T[];
  meta: PageMeta;
}

export interface EnsureFreshTokenOptions {
  /**
   * If provided, refresh early if remaining lifetime is less than this many seconds.
   * Default 0 (only refresh if already expired or missing, or if forced).
   */
  minValiditySeconds?: number;
  /** Force refresh even if token is still valid. Default false. */
  forceRefresh?: boolean;
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
  /**
   * Opens a long-lived response (server-sent events) with the same Bearer token and 401 refresh as `request`,
   * and returns its body unread. An error answer is thrown as an `ApiError` before any of it is read.
   */
  openStream(path: string, options?: RequestInit): Promise<ReadableStream<Uint8Array>>;
  ensureFreshAccessToken(options?: EnsureFreshTokenOptions): Promise<string | null>;
}

/** A request completed after logout or account/tenant switch and must not update protected state. */
export class StaleSessionRequestError extends Error {
  constructor() {
    super("The session changed while the request was in flight.");
    this.name = "StaleSessionRequestError";
  }
}
