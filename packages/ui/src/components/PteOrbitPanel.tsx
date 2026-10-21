import type { ReactElement } from "react";
import { cn } from "../utils/cn";

export interface PteOrbitPanelProps {
  className?: string;
  title?: string;
  src?: string;
}

const DEFAULT_PTE_ORBIT_SRC = "/illustrations/pte-orbit/index.html?embed=1&v=motion-2";

const OrbitPoster = (): ReactElement => (
  <div aria-hidden="true" className="absolute inset-0 overflow-hidden bg-[var(--surface-page)]">
    <div className="absolute left-1/2 top-1/2 h-72 w-[30rem] -translate-x-1/2 -translate-y-1/2 rotate-[24deg] rounded-[50%] border border-[var(--brand)]/25" />
    <div className="absolute left-1/2 top-1/2 h-60 w-[28rem] -translate-x-1/2 -translate-y-1/2 -rotate-[18deg] rounded-[50%] border border-[var(--action)]/20" />
    <div className="absolute left-1/2 top-1/2 flex h-44 w-44 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-br from-white via-[#82c9f1] to-[#176fbd] shadow-2xl shadow-action/25">
      <span className="text-5xl font-black italic tracking-[-0.12em] text-white drop-shadow-sm">
        P
      </span>
    </div>
  </div>
);

/** Shared login artwork panel used by the tenant and vendor portals. */
export const PteOrbitPanel = ({
  className,
  title = "PTE Orbit 3D",
  src = DEFAULT_PTE_ORBIT_SRC,
}: PteOrbitPanelProps): ReactElement => (
  <div
    className={cn(
      "relative hidden min-h-[36rem] overflow-hidden bg-[var(--surface-page)] md:block",
      className,
    )}
  >
    <OrbitPoster />
    <iframe
      title={title}
      src={src}
      loading="lazy"
      className="absolute inset-0 z-10 h-full w-full border-0"
    />
  </div>
);
