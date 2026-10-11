"use client";

import type { ReactElement } from "react";
import { useRouter } from "next/navigation";
import type { UserResponse } from "@pte/api-client";
import { ActionMenu, Alert, EyeIcon } from "@pte/ui";
import type { ExamStaffListText } from "../hooks/useExamStaffListText";
import { useStaffAccountActions } from "../detail/hooks/useStaffAccountActions";
import { useStaffDetailText } from "../detail/hooks/useStaffDetailText";
import { STAFF_DETAIL_ROUTES } from "../detail/constants";
import { StaffActionDialogs } from "../detail/components/StaffActionDialogs";

interface ExamStaffRowActionsProps { user: UserResponse; text: ExamStaffListText }

export const ExamStaffRowActions = ({ user, text }: ExamStaffRowActionsProps): ReactElement => {
  const router = useRouter();
  const detailText = useStaffDetailText();
  const actions = useStaffAccountActions({ ...user, canSendCredentials: Boolean(user.email)
    && !user.roles.includes("STUDENT") }, detailText);
  return <>
    <ActionMenu label={`${text.actions}: ${user.fullName}`} items={[
      { label: text.viewDetails, icon: EyeIcon, onSelect: () => router.push(STAFF_DETAIL_ROUTES.detail(user.publicId)) },
      { separator: true, key: "staff-detail-separator" }, ...actions.items,
    ]} />
    {actions.error && actions.command === null && <Alert tone="error">{actions.error}</Alert>}
    <StaffActionDialogs actions={actions} text={detailText} name={user.fullName || user.username} />
  </>;
};
