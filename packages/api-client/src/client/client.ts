import { ApiError, type ApiErrorKind } from "./apiError";

export type TokenGetter = () => string | null;

export interface ApiClientOptions {
  /** Absolute origin of aptis-api, e.g. `https://api.aptis.vn` (no trailing slash). */
  baseUrl: string;
  /** Returns the current access token for Bearer injection, or null when signed out. */
  getToken?: TokenGetter;
  /** Called whenever the server responds 401 so the app can clear its session. */
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
  status: number;
  code: string;
  message: string;
  data: T;
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
  return (
    typeof body === "object" &&
    body !== null &&
    "success" in body &&
    "data" in body
  );
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

function extractServerMessage(body: unknown): string | undefined {
  if (
    typeof body === "object" &&
    body !== null &&
    "message" in body &&
    typeof (body as { message: unknown }).message === "string"
  ) {
    return (body as { message: string }).message;
  }
  return undefined;
}

function filenameFromDisposition(disposition: string | null): string | undefined {
  if (!disposition) return undefined;
  const match = /filename="?([^";]+)"?/i.exec(disposition);
  return match?.[1];
}

export function createApiClient(options: ApiClientOptions): ApiClient {
  const { baseUrl, getToken, onUnauthorized, fetchFn = fetch } = options;

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
    const message = extractServerMessage(errorBody) ?? DEFAULT_MESSAGE[kind];
    if (response.status === 401) onUnauthorized?.();
    throw new ApiError(kind, response.status, message, errorBody);
  }

  async function request<T>(
    path: string,
    requestOptions: RequestOptions = {},
  ): Promise<T> {
    const { body, headers: customHeaders, ...rest } = requestOptions;
    const response = await send(path, {
      ...rest,
      headers: buildHeaders(customHeaders, body !== undefined),
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    await assertOk(response);
    return unwrapResponse<T>(await parseJsonSafely(response));
  }

  async function upload<T>(
    path: string,
    formData: FormData,
    requestOptions: RequestInit = {},
  ): Promise<T> {
    const { headers: customHeaders, ...rest } = requestOptions;
    const response = await send(path, {
      ...rest,
      method: rest.method ?? "POST",
      headers: buildHeaders(customHeaders, false),
      body: formData,
    });

    await assertOk(response);
    return unwrapResponse<T>(await parseJsonSafely(response));
  }

  async function download(
    path: string,
    requestOptions: RequestOptions = {},
  ): Promise<DownloadResponse> {
    const { body, headers: customHeaders, ...rest } = requestOptions;
    const response = await send(path, {
      ...rest,
      headers: buildHeaders(customHeaders, body !== undefined),
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    await assertOk(response);
    return {
      blob: await response.blob(),
      filename: filenameFromDisposition(response.headers.get("Content-Disposition")),
    };
  }

  return { request, upload, download };
}
