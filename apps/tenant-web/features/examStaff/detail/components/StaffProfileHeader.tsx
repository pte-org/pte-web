import type { ReactElement } from "react";
import type { ExamStaffAccountResponse } from "@pte/api-client";
import { ActionMenu, Badge, ProfileHeader, StatusBadge, type DropdownItem } from "@pte/ui";
import type { StaffDetailText } from "../hooks/useStaffDetailText";

interface StaffProfileHeaderProps { account: ExamStaffAccountResponse; text: StaffDetailText; items: DropdownItem[] }

export const StaffProfileHeader = ({ account, text, items }: StaffProfileHeaderProps): ReactElement => (
  <ProfileHeader name={account.fullName || account.username}
    status={<StatusBadge label={account.status === "ACTIVE" ? text.active : text.suspended}
      variant={account.status === "ACTIVE" ? "success" : "warning"} />}
    metadata={<>
      <span className="break-all">{account.email || text.emptyValue}</span>
      {account.roles.map((role) => <Badge key={role}>
        {role === "PROCTOR" ? text.proctorRole : role === "EXAMINER" ? text.examinerRole : role}
      </Badge>)}
    </>}
    actions={<ActionMenu items={items} label={text.actions} />} />
);
