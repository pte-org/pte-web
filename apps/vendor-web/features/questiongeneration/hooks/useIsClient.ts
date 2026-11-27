import { useSyncExternalStore } from "react";

const subscribe = (): (() => void) => () => undefined;

/** True once rendering in the browser, false on the server and during hydration (no effect, no extra render). */
export function useIsClient(): boolean {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
