import type { ComponentProps, ReactElement } from "react";
import { cn } from "../utils/cn";

/** Card surface ported from NextAdmin's Tailgrids Card primitive. */
export const DashboardCard = ({
  children,
  className,
  ...props
}: ComponentProps<"div">): ReactElement => (
  <div
    {...props}
    className={cn(
      "rounded-xl border-[0.5px] border-[var(--shell-border)] bg-[var(--surface-card)] p-5",
      className,
    )}
  >
    {children}
  </div>
);
