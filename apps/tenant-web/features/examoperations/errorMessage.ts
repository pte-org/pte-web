/** Undefined only when `error` itself is falsy (no error) — so `errorMessage(x) && <Alert>`
 * and `{!!x && <Alert>{errorMessage(x, fallback)}</Alert>}` both work correctly. */
export function errorMessage(error: unknown, fallback = "An unknown error occurred."): string | undefined {
  if (!error) return undefined;
  return error instanceof Error ? error.message : fallback;
}
