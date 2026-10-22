"use client";

import { useEffect, useRef, useState, type ReactElement } from "react";
import { cn } from "../utils/cn";

export interface PteOrbitPanelProps {
  className?: string;
  title?: string;
  src?: string;
}

const DEFAULT_PTE_ORBIT_SRC = "/illustrations/pte-orbit/index.html?embed=1&v=motion-10";
/** Show the iframe anyway if it never reports in (slow CDN, blocked WebGL) so Retry is reachable. */
const READY_FALLBACK_MS = 8000;

interface OrbitMessage {
  source?: unknown;
  type?: unknown;
}

/** Single lightweight placeholder in the scene's own tone while Three.js loads. */
const OrbitPoster = ({ visible }: { visible: boolean }): ReactElement => (
  <div
    aria-hidden="true"
    className={cn(
      "absolute inset-0 flex items-center justify-center bg-[var(--action-tint)] transition-opacity duration-700 ease-out",
      visible ? "opacity-100" : "opacity-0",
    )}
  >
    <div className="relative h-52 w-52">
      <div className="absolute inset-0 animate-pulse rounded-full bg-[radial-gradient(circle,var(--surface-card)_0%,transparent_70%)]" />
      <div className="absolute inset-8 animate-pulse rounded-full border border-[var(--action)]/20" />
    </div>
  </div>
);

/**
 * Shared login artwork panel used by the tenant and vendor portals. The 3D iframe stays hidden
 * behind the poster until it posts `{ source: "pte-orbit", type: "ready" | "error" }`, then the two
 * cross-fade; the scene plays its own glide-in at the same time.
 */
export const PteOrbitPanel = ({
  className,
  title = "PTE Orbit 3D",
  src = DEFAULT_PTE_ORBIT_SRC,
}: PteOrbitPanelProps): ReactElement => {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const onMessage = (event: MessageEvent<OrbitMessage | null>): void => {
      if (event.origin !== window.location.origin) return;
      if (event.source !== frameRef.current?.contentWindow) return;
      const { source, type } = event.data ?? {};
      if (source === "pte-orbit" && (type === "ready" || type === "error")) setReady(true);
    };
    window.addEventListener("message", onMessage);
    const timer = window.setTimeout(() => setReady(true), READY_FALLBACK_MS);
    return () => {
      window.removeEventListener("message", onMessage);
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <div
      className={cn(
        "relative hidden min-h-[36rem] overflow-hidden bg-[var(--action-tint)] md:block",
        className,
      )}
    >
      <OrbitPoster visible={!ready} />
      <iframe
        ref={frameRef}
        title={title}
        src={src}
        loading="eager"
        className={cn(
          "absolute inset-0 z-10 h-full w-full border-0 transition-opacity duration-700 ease-out",
          ready ? "opacity-100" : "opacity-0",
        )}
      />
    </div>
  );
};
