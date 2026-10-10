import type { ReactElement } from "react";
import type { StudentDetailResponse } from "@pte/api-client";
import {
  ActionMenu,
  Avatar,
  CopyableId,
  DashboardCard,
  PageHeader,
  StatusBadge,
  type DropdownItem,
} from "@pte/ui";
import type { StudentDetailText } from "../hooks/useStudentDetailText";

interface StudentDetailHeaderProps {
  account: StudentDetailResponse;
  actionItems: DropdownItem[];
  text: StudentDetailText;
}

export const StudentDetailHeader = ({
  account,
  actionItems,
  text,
}: StudentDetailHeaderProps): ReactElement => {
  const displayName = account.fullName || account.username;
  const isSuspended = account.status === "SUSPENDED";

  return (
    <DashboardCard>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <Avatar name={displayName} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <PageHeader title={displayName} />
              <StatusBadge
                label={isSuspended ? text.status.suspended : text.status.active}
                variant={isSuspended ? "warning" : "success"}
              />
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[var(--ink-secondary)]">
              {account.studentCode ? (
                <CopyableId value={account.studentCode} />
              ) : (
                <span>{text.studentCodeMissing}</span>
              )}
              <span aria-hidden="true" className="text-[var(--ink-muted)]">
                •
              </span>
              <span className="break-all">{account.email || account.username}</span>
            </div>
          </div>
        </div>
        <ActionMenu items={actionItems} label={text.actions.menuLabel} />
      </div>
    </DashboardCard>
  );
};
