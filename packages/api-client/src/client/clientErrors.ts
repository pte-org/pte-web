import type { ApiErrorKind } from "./apiError";
import type { ApiResponseEnvelope } from "./clientTypes";
import { isMachineErrorCode } from "./errorMessage";

export const NETWORK_ERROR_MESSAGE =
  "Unable to connect to the server. Please check your connection and try again.";

const STATUS_KIND: Record<number, ApiErrorKind> = {
  400: "validation",
  401: "unauthorized",
  403: "forbidden",
  409: "conflict",
};

export const DEFAULT_MESSAGE: Record<ApiErrorKind, string> = {
  validation: "The submitted data is invalid.",
  unauthorized: "Your session is invalid or has expired.",
  forbidden: "You do not have permission to access this resource.",
  conflict: "The request conflicts with existing data.",
  network: NETWORK_ERROR_MESSAGE,
  server: "The server encountered a problem. Please try again later.",
  unknown: "An unknown error occurred.",
};

export function kindForStatus(status: number): ApiErrorKind {
  return STATUS_KIND[status] ?? (status >= 500 ? "server" : "unknown");
}

export async function parseJsonSafely(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return undefined;
  }
}

function isEnvelope<T>(body: unknown): body is ApiResponseEnvelope<T> {
  return typeof body === "object" && body !== null && "success" in body && "data" in body;
}

export function unwrapResponse<T>(body: unknown): T {
  if (isEnvelope<T>(body)) {
    if (body.meta !== undefined && Array.isArray(body.data)) {
      // A paged envelope keeps its meta next to the rows; T is the caller's PagedResult shape.
      return { data: body.data, meta: body.meta } as T;
    }
    return body.data;
  }
  // A bare (non-envelope) body is already the payload the caller typed.
  return body as T;
}

export interface ExtractedErrorDetails {
  message?: string;
  code?: string;
  userMessage?: string;
}

export function extractServerErrorDetails(body: unknown): ExtractedErrorDetails {
  if (typeof body !== "object" || body === null) return {};

  // Narrowed to an object above; each field is checked before use.
  const candidate = body as {
    code?: unknown;
    message?: unknown;
    userMessage?: unknown;
  };
  const message = typeof candidate.message === "string" ? candidate.message : undefined;
  const explicitCode =
    typeof candidate.code === "string" && candidate.code.trim() ? candidate.code : undefined;
  const code = explicitCode ?? (isMachineErrorCode(message) ? message : undefined);
  const userMessage =
    typeof candidate.userMessage === "string" && candidate.userMessage.trim()
      ? candidate.userMessage
      : undefined;

  return { message, code, userMessage };
}

export function filenameFromDisposition(disposition: string | null): string | undefined {
  if (!disposition) return undefined;
  const match = /filename="?([^";]+)"?/i.exec(disposition);
  return match?.[1];
}
