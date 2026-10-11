import { EXAM_STAFF_EMPTY_VALUE } from "../constants";
import type { UserResponse } from "@pte/api-client";
import { StatusBadge, type DataTableColumn } from "@pte/ui";
import type { useExamStaffListText } from "./useExamStaffListText";

function roleLabel(user: UserResponse, roleLabels: Record<string, string>): string {
  return (
    user.roles
      .filter((role) => roleLabels[role])
      .map((role) => roleLabels[role])
      .join(", ") || EXAM_STAFF_EMPTY_VALUE
  );
}


export const useExamStaffListColumns = (text: ReturnType<typeof useExamStaffListText>): DataTableColumn<UserResponse>[] => {
  const roleLabels = { PROCTOR: text.proctor, EXAMINER: text.examiner };
  const roleFilterOptions = [
    { label: text.allRoles, value: "" },
    { label: text.proctor, value: "PROCTOR" },
    { label: text.examiner, value: "EXAMINER" },
  ];
  const statusOptions = [
    { label: text.allStatuses, value: "" },
    { label: text.active, value: "ACTIVE" },
    { label: text.suspended, value: "SUSPENDED" },
  ];

  return [
    {
      key: "fullName",
      label: text.fullName,
      header: text.fullName,
      filterAccessor: (user) => user.fullName,
      cell: (user) => user.fullName,
    },
    {
      key: "account",
      label: text.account,
      header: text.account,
      filterAccessor: (user) => user.username,
      cell: (user) => user.username,
      cellClassName: "whitespace-nowrap",
    },
    {
      key: "email",
      label: text.email,
      header: text.email,
      filterAccessor: (user) => user.email,
      cell: (user) => user.email,
      cellClassName: "whitespace-nowrap",
    },
    {
      key: "role",
      label: text.role,
      header: text.role,
      filterOptions: roleFilterOptions,
      filterAccessor: (user) => roleLabel(user, roleLabels),
      cell: (user) => roleLabel(user, roleLabels),
    },
    {
      key: "status",
      label: text.status,
      header: text.status,
      filterOptions: statusOptions,
      filterAccessor: (user) => user.status,
      cell: (user) => (
        <StatusBadge
          label={user.status === "ACTIVE" ? text.active : text.suspended}
          variant={user.status === "ACTIVE" ? "success" : "warning"}
        />
      ),
    },
  ];

};
