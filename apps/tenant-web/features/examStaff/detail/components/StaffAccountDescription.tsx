import { useId, type ReactElement } from "react";
import type { ExamStaffAccountResponse } from "@pte/api-client";
import { Badge, DescriptionList, Input, StatusBadge, type DescriptionItem } from "@pte/ui";
import type { useStaffAccountForm } from "../hooks/useStaffAccountForm";
import type { StaffDetailText } from "../hooks/useStaffDetailText";
import type { StaffProfileForm } from "../types";

interface StaffAccountDescriptionProps {
  account: ExamStaffAccountResponse;
  editor: ReturnType<typeof useStaffAccountForm>;
  text: StaffDetailText;
}

export const StaffAccountDescription = ({ account, editor, text }: StaffAccountDescriptionProps): ReactElement => {
  const id = useId();
  const editable: { key: keyof StaffProfileForm; label: string; type?: string }[] = [
    { key: "fullName", label: text.fullName }, { key: "email", label: text.email, type: "email" },
    { key: "phone", label: text.phone, type: "tel" }, { key: "dateOfBirth", label: text.dateOfBirth, type: "date" },
  ];
  const items: DescriptionItem[] = editable.map(({ key, label, type }) => ({
    label, value: editor.editing ? <Input id={`${id}-${key}`} aria-label={label} type={type}
      value={editor.form[key]} disabled={editor.pending} maxLength={255}
      onChange={(event) => editor.change(key, event.target.value)} />
      : <span className="break-all">{account[key] || text.emptyValue}</span>,
  }));
  items.push(
    { label: text.username, value: <span className="break-all">{account.username}</span> },
    { label: text.roles, value: <div className="flex flex-wrap gap-2">{account.roles.map((role) =>
      <Badge key={role}>{role === "PROCTOR" ? text.proctorRole : role === "EXAMINER" ? text.examinerRole : role}</Badge>,
    )}</div> },
    { label: text.status, value: <StatusBadge label={account.status === "ACTIVE" ? text.active : text.suspended}
      variant={account.status === "ACTIVE" ? "success" : "warning"} /> },
    { label: text.passwordChange, value: <Badge variant={account.mustChangePassword ? "warning" : "neutral"}>
      {account.mustChangePassword ? text.required : text.notRequired}</Badge> },
  );
  return <DescriptionList items={items} />;
};
