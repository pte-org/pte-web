import type { ReactElement, ReactNode } from "react";
import type { StudentDetailResponse } from "@pte/api-client";
import {
  Badge,
  BookOpenIcon,
  DetailGroup,
  ShieldIcon,
  StatusBadge,
  UserCircleIcon,
  type DescriptionItem,
} from "@pte/ui";
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
  const technicalValue = (value: string | null | undefined): ReactNode =>
    value ? <code className="break-all font-mono text-[13px]">{value}</code> : text.emptyValue;

  const roleValue = account.roles.length ? (
    <div className="flex flex-wrap gap-1.5">
      {account.roles.map((role) => (
        <Badge key={role}>{role}</Badge>
      ))}
    </div>
  ) : (
    text.emptyValue
  );

  const identityItems: DescriptionItem[] = [
    { label: text.account.fullName, value: account.fullName || text.emptyValue },
    { label: text.account.email, value: technicalValue(account.email) },
    { label: text.account.phone, value: account.phone || text.emptyValue },
    { label: text.account.dateOfBirth, value: account.dateOfBirth || text.emptyValue },
  ];

  const accessItems: DescriptionItem[] = [
    { label: text.account.username, value: technicalValue(account.username) },
    { label: text.account.studentCode, value: technicalValue(account.studentCode) },
    { label: text.account.roles, value: roleValue },
    {
      label: text.account.status,
      value: (
        <StatusBadge
          label={account.status === "ACTIVE" ? text.status.active : text.status.suspended}
          variant={account.status === "ACTIVE" ? "success" : "warning"}
        />
      ),
    },
    {
      label: text.account.passwordChange,
      value: (
        <Badge variant={account.mustChangePassword ? "warning" : "neutral"}>
          {account.mustChangePassword ? text.account.required : text.account.notRequired}
        </Badge>
      ),
      fullWidth: true,
    },
  ];

  const learningItems: DescriptionItem[] = [
    { label: text.account.className, value: account.assignment?.className || text.account.noClass },
    {
      label: text.account.programName,
      value: account.assignment?.programName || text.account.noProgram,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {includeEditableFields && (
        <DetailGroup
          title={text.account.sections.identity}
          icon={<UserCircleIcon className="h-4 w-4" />}
          items={identityItems}
          variant="inline"
        />
      )}
      <DetailGroup
        title={text.account.sections.access}
        icon={<ShieldIcon className="h-4 w-4" />}
        items={accessItems}
        variant="inline"
      />
      <DetailGroup
        title={text.account.sections.learning}
        icon={<BookOpenIcon className="h-4 w-4" />}
        items={learningItems}
        variant="inline"
      />
    </div>
  );
};
