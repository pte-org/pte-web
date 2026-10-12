import type { ReactElement } from "react";
import type { StudentDetailResponse } from "@pte/api-client";
import {
  ActionMenu,
  CopyableId,
  ProfileHeader,
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
    <ProfileHeader
      name={displayName}
      status={
              <StatusBadge
                label={isSuspended ? text.status.suspended : text.status.active}
                variant={isSuspended ? "warning" : "success"}
              />
      }
      metadata={
        <>
              {account.studentCode ? (
                <CopyableId value={account.studentCode} />
              ) : (
                <span>{text.studentCodeMissing}</span>
              )}
              <span aria-hidden="true" className="text-[var(--ink-muted)]">
                •
              </span>
              <span className="break-all">{account.email || account.username}</span>
        </>
      }
      actions={<ActionMenu items={actionItems} label={text.actions.menuLabel} />}
    />
  );
};
