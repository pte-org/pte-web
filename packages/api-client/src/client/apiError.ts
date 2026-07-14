export type ApiErrorKind =
  | "validation"
  | "unauthorized"
  | "forbidden"
  | "conflict"
  | "network"
  | "server"
  | "unknown";

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

  constructor(
    kind: ApiErrorKind,
    status: number,
    message: string,
    details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
    this.details = details;
  }
}
