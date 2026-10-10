import type { ReactElement } from "react";
import type { StudentDetailResponse } from "@pte/api-client";
import { Badge, DescriptionList, StatusBadge, type DescriptionItem } from "@pte/ui";
import type { StudentDetailText } from "../hooks/useStudentDetailText";

interface StudentAccountDescriptionProps {
  account: StudentDetailResponse;
  text: StudentDetailText;
  includeEditableFields?: boolean;
}

/** Keeps read-only fields identical in display and edit modes. */
export const StudentAccountDescription = ({
  account,
  text,
  includeEditableFields = true,
}: StudentAccountDescriptionProps): ReactElement => {
  const items: DescriptionItem[] = [
    ...(includeEditableFields
      ? [
          { label: text.account.fullName, value: account.fullName || text.emptyValue },
          { label: text.account.email, value: account.email || text.emptyValue },
          { label: text.account.phone, value: account.phone || text.emptyValue },
          { label: text.account.dateOfBirth, value: account.dateOfBirth || text.emptyValue },
        ]
      : []),
    { label: text.account.username, value: account.username },
    { label: text.account.studentCode, value: account.studentCode || text.emptyValue },
    { label: text.account.roles, value: account.roles.join(", ") || text.emptyValue },
    {
      label: text.account.status,
      value: (
        <StatusBadge
          label={account.status === "ACTIVE" ? text.status.active : text.status.suspended}
          variant={account.status === "ACTIVE" ? "success" : "warning"}
        />
      ),
    },
    { label: text.account.className, value: account.assignment?.className || text.account.noClass },
    {
      label: text.account.programName,
      value: account.assignment?.programName || text.account.noProgram,
    },
    {
      label: text.account.passwordChange,
      value: (
        <Badge variant={account.mustChangePassword ? "warning" : "neutral"}>
          {account.mustChangePassword ? text.account.required : text.account.notRequired}
        </Badge>
      ),
    },
  ];
  return <DescriptionList items={items} />;
};
