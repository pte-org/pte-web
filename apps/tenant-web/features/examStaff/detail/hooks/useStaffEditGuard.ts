"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/** Explicit tab/link discard dialog; browser reload/close uses its native beforeunload prompt. */
export const useStaffEditGuard = (dirty: boolean, pending: boolean): {
  open: boolean; request: (proceed: () => void) => void; confirm: () => void; close: () => void;
} => {
  const router = useRouter();
  const [continuation, setContinuation] = useState<(() => void) | null>(null);
  const request = (proceed: () => void): void => {
    if (pending) return;
    if (dirty) setContinuation(() => proceed);
    else proceed();
  };
  useEffect(() => {
    if (!dirty && !pending) return;
    const beforeUnload = (event: BeforeUnloadEvent): void => { event.preventDefault(); };
    const click = (event: MouseEvent): void => {
      if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const anchor = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!(anchor instanceof HTMLAnchorElement) || anchor.target || anchor.hasAttribute("download")) return;
      const destination = new URL(anchor.href);
      if (destination.origin !== window.location.origin || destination.pathname === window.location.pathname) return;
      event.preventDefault(); event.stopPropagation();
      if (!pending) setContinuation(() => () => router.push(destination.pathname + destination.search + destination.hash));
    };
    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", click, true);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("click", click, true);
    };
  }, [dirty, pending, router]);
  return {
    open: continuation !== null, request,
    confirm: () => { if (!pending) { setContinuation(null); continuation?.(); } },
    close: () => setContinuation(null),
  };
};
