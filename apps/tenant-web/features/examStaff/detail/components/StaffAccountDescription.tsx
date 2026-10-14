import type { ReactElement, ReactNode } from "react";
import type { ExamStaffAccountResponse } from "@pte/api-client";
import {
  Badge,
  DetailGroup,
  ShieldIcon,
  StatusBadge,
  UserCircleIcon,
  type DescriptionItem,
} from "@pte/ui";
import type { StaffDetailText } from "../hooks/useStaffDetailText";

interface StaffAccountDescriptionProps {
  account: ExamStaffAccountResponse;
  text: StaffDetailText;
}

export const StaffAccountDescription = ({ account, text }: StaffAccountDescriptionProps): ReactElement => {
  const technicalValue = (value: string | null | undefined): ReactNode =>
    value ? <code className="break-all font-mono text-[13px]">{value}</code> : text.emptyValue;
  const roleValue = account.roles.length ? (
    <div className="flex flex-wrap gap-1.5">
      {account.roles.map((role) => (
        <Badge key={role}>{role === "PROCTOR" ? text.proctorRole : role === "EXAMINER" ? text.examinerRole : role}</Badge>
      ))}
    </div>
  ) : text.emptyValue;
  const identityItems: DescriptionItem[] = [
    { label: text.fullName, value: account.fullName || text.emptyValue },
    { label: text.email, value: technicalValue(account.email) },
    { label: text.phone, value: account.phone || text.emptyValue },
    { label: text.dateOfBirth, value: account.dateOfBirth || text.emptyValue },
  ];
  const accessItems: DescriptionItem[] = [
    { label: text.username, value: technicalValue(account.username) },
    { label: text.roles, value: roleValue },
    { label: text.status, value: <StatusBadge label={account.status === "ACTIVE" ? text.active : text.suspended}
      variant={account.status === "ACTIVE" ? "success" : "warning"} /> },
    { label: text.passwordChange, value: <Badge variant={account.mustChangePassword ? "warning" : "neutral"}>
      {account.mustChangePassword ? text.required : text.notRequired}</Badge> },
  ];
  return <div className="flex flex-col gap-6">
    <DetailGroup title={text.identitySection} icon={<UserCircleIcon className="h-4 w-4" />} items={identityItems} variant="inline" />
    <DetailGroup title={text.accessSection} icon={<ShieldIcon className="h-4 w-4" />} items={accessItems} variant="inline" />
  </div>;
};
