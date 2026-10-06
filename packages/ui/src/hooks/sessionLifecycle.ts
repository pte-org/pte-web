import { decodeAccessTokenClaims } from "@pte/api-client";
import type { PteSession } from "./sessionStorage";

type SessionLifecycleListener = () => void;

let generation = 0;
let identity: string | null = null;
const listeners = new Set<SessionLifecycleListener>();

function sessionIdentity(session: PteSession): string | null {
  const claims = decodeAccessTokenClaims(session.accessToken);
  if (!claims) return null;
  return `${claims.sub}|${claims.tenantId ?? ""}|${[...claims.roles].sort().join(",")}`;
}

function notify(): void {
  for (const listener of listeners) listener();
}

/** Advances only when the protected actor/tenant changes, not on token refresh. */
export function noteSessionSaved(session: PteSession): void {
  const nextIdentity = sessionIdentity(session);
  if (nextIdentity === identity) return;
  identity = nextIdentity;
  generation += 1;
  notify();
}

export function noteSessionCleared(): void {
  if (identity === null) {
    generation += 1;
    notify();
    return;
  }
  identity = null;
  generation += 1;
  notify();
}

export function getSessionGeneration(): number {
  return generation;
}

export function subscribeSessionLifecycle(listener: SessionLifecycleListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
