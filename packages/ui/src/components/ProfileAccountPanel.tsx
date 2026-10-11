import type { ReactElement, ReactNode } from "react";

export interface ProfileAccountPanelProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}

/** Shared account section composition extracted from the Learner inline editor. */
export const ProfileAccountPanel = ({
  title, description, actions, children,
}: ProfileAccountPanelProps): ReactElement => (
  <article className="overflow-hidden rounded-xl border border-[var(--shell-border)] bg-[var(--surface-card)]">
    <div className="flex flex-col gap-3 border-b border-[var(--divider)] p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
      <div>
        <h2 className="text-base font-semibold text-[var(--ink-primary)]">{title}</h2>
        {description && <p className="mt-1 text-sm text-[var(--ink-secondary)]">{description}</p>}
      </div>
      {actions}
    </div>
    <div className="flex flex-col gap-5 p-4 sm:p-5">{children}</div>
  </article>
);
