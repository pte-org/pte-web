import type { ReactElement, ReactNode } from "react";
import { cn } from "../utils/cn";

interface EmptyStateProps {
  title: string;
  description?: string;
  /** A quiet picture above the title, such as an icon for what is missing. */
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export const EmptyState = ({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps): ReactElement => (
  <div
    className={cn(
      "flex flex-col items-center justify-center gap-3 rounded-lg border border-[var(--shell-border)] bg-[var(--surface-card)] px-6 py-10 text-center shadow-card",
      className,
    )}
  >
    {icon && <div className="text-[var(--ink-muted)]">{icon}</div>}
    <div>
      <h3 className="text-sm font-semibold text-[var(--ink-primary)]">{title}</h3>
      {description && <p className="mt-1 text-sm text-[var(--ink-secondary)]">{description}</p>}
    </div>
    {action}
  </div>
);
