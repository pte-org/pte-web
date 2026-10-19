import type { ReactElement } from "react";
import { cn } from "../utils/cn";

export interface PteOrbitPanelProps {
  className?: string;
  title?: string;
  src?: string;
}

const DEFAULT_PTE_ORBIT_SRC = "/illustrations/pte-orbit/index.html?embed=1";

/** Shared login artwork panel used by the tenant and vendor portals. */
export const PteOrbitPanel = ({
  className,
  title = "PTE Orbit 3D",
  src = DEFAULT_PTE_ORBIT_SRC,
}: PteOrbitPanelProps): ReactElement => (
  <div
    className={cn("relative hidden min-h-[36rem] overflow-hidden bg-[#edf2f8] md:block", className)}
  >
    <iframe
      title={title}
      src={src}
      loading="eager"
      className="absolute inset-0 h-full w-full border-0"
    />
  </div>
);
