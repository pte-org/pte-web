"use client";

import type { ReactElement } from "react";
import { Alert, Badge, DescriptionList, Modal, StatusBadge } from "@pte/ui";
import type { AccountDetails } from "../types";
import { useUserManagementText } from "../hooks/useUserManagementText";

interface AccountDetailsModalProps {
  account: AccountDetails | null;
  open: boolean;
  onClose: () => void;
}

export const AccountDetailsModal = ({
  account,
  open,
  onClose,
}: AccountDetailsModalProps): ReactElement | null => {
  const T = useUserManagementText();
  if (!account) return null;

  const valueOrDash = (value: string | null | undefined): string => value || T.emptyValue;

  const isSuspended = account.status === "SUSPENDED";

  return (
    <Modal open={open} onClose={onClose} title={T.accountDetailsTitle} size="lg">
      <div className="flex flex-col gap-5">
        <Alert tone="info">
          {T.passwordsNotShown}
        </Alert>
        <DescriptionList
          items={[
            { label: T.username, value: <code>{account.username}</code> },
            { label: T.email, value: valueOrDash(account.email) },
            { label: T.fullName, value: valueOrDash(account.fullName) },
            {
              label: T.roles,
              value: account.roles.length > 0 ? account.roles.join(", ") : T.emptyValue,
            },
            {
              label: T.status,
              value: (
                <StatusBadge
                  label={isSuspended ? T.suspended : T.active}
                  variant={isSuspended ? "warning" : "success"}
                />
              ),
            },
            {
              label: T.passwordChange,
              value: account.mustChangePassword ? (
                <Badge variant="warning">{T.required}</Badge>
              ) : (
                <Badge variant="neutral">{T.notRequired}</Badge>
              ),
            },
            { label: T.studentCode, value: valueOrDash(account.studentCode) },
            { label: T.className, value: valueOrDash(account.className) },
            { label: T.phone, value: valueOrDash(account.phone) },
            { label: T.dateOfBirth, value: valueOrDash(account.dateOfBirth) },
          ]}
        />
      </div>
    </Modal>
  );
};
