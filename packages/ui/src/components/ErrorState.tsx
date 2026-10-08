import type { ReactElement, ReactNode } from "react";

interface ErrorStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export const ErrorState = ({ title, description, action }: ErrorStateProps): ReactElement => (
  <div className="rounded-md border border-[var(--blush-action)]/40 bg-[var(--blush-tint)] px-4 py-4 text-[var(--blush-action)]">
    <h3 className="text-sm font-semibold">{title}</h3>
    {description && <p className="mt-1 text-sm">{description}</p>}
    {action && <div className="mt-3">{action}</div>}
  </div>
);
