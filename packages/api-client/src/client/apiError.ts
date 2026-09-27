export type ApiErrorKind =
  "validation" | "unauthorized" | "forbidden" | "conflict" | "network" | "server" | "unknown";

export interface ApiErrorMetadata {
  /** Machine-readable business code used for branch logic. */
  code?: string;
  /** Server-provided copy explicitly approved for direct user display. */
  userMessage?: string;
}

/**
 * Typed error thrown by the API client so callers can branch on `kind`
 * (e.g. show a field error on `validation`, force logout on `unauthorized`)
 * without parsing HTTP status codes at every call site.
 */
export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  /** HTTP status, or 0 when the request never reached the server. */
  readonly status: number;
  readonly details?: unknown;
  /** Use this for branch logic; do not render it directly. */
  readonly code?: string;
  /** Use only through the shared user-facing formatter. */
  readonly userMessage?: string;

  constructor(
    kind: ApiErrorKind,
    status: number,
    message: string,
    details?: unknown,
    metadata: ApiErrorMetadata = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
    this.details = details;
    this.code = metadata.code;
    this.userMessage = metadata.userMessage;
  }
}
