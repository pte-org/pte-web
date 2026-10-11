import type { ReactElement, ReactNode } from "react";
import { Avatar } from "./Avatar";
import { DashboardCard } from "./DashboardCard";
import { PageHeader } from "./PageHeader";

export interface ProfileHeaderProps {
  name: string;
  status?: ReactNode;
  metadata?: ReactNode;
  actions?: ReactNode;
}

/** Presentation slots only: account roles, identifiers and commands stay feature-owned. */
export const ProfileHeader = ({ name, status, metadata, actions }: ProfileHeaderProps): ReactElement => (
  <DashboardCard>
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-4">
        <Avatar name={name} />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <PageHeader title={name} />
            {status}
          </div>
          {metadata && (
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[var(--ink-secondary)]">
              {metadata}
            </div>
          )}
        </div>
      </div>
      {actions}
    </div>
  </DashboardCard>
);
