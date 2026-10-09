import type { ReactElement, ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export const EmptyState = ({ title, description, action }: EmptyStateProps): ReactElement => (
  <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-[var(--shell-border)] bg-[var(--surface-card)] px-6 py-10 text-center shadow-card">
    <div>
      <h3 className="text-sm font-semibold text-[var(--ink-primary)]">{title}</h3>
      {description && <p className="mt-1 text-sm text-[var(--ink-secondary)]">{description}</p>}
    </div>
    {action}
  </div>
);
