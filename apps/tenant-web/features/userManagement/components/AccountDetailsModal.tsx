"use client";

import type { ReactElement } from "react";
import { Alert, Badge, DescriptionList, Modal, StatusBadge } from "@pte/ui";
import type { AccountDetails } from "../types";
import { USER_MANAGEMENT_TEXT as T } from "../constants";

interface AccountDetailsModalProps {
  account: AccountDetails | null;
  open: boolean;
  onClose: () => void;
}

const valueOrDash = (value: string | null | undefined): string => value || T.EMPTY_VALUE;

export const AccountDetailsModal = ({
  account,
  open,
  onClose,
}: AccountDetailsModalProps): ReactElement | null => {
  if (!account) return null;

  const isSuspended = account.status === "SUSPENDED";

  return (
    <Modal open={open} onClose={onClose} title={T.ACCOUNT_DETAILS_TITLE} size="lg">
      <div className="flex flex-col gap-5">
        <Alert tone="info">
          {T.PASSWORDS_NOT_SHOWN}
        </Alert>
        <DescriptionList
          items={[
            { label: T.USERNAME, value: <code>{account.username}</code> },
            { label: T.EMAIL, value: valueOrDash(account.email) },
            { label: T.FULL_NAME, value: valueOrDash(account.fullName) },
            {
              label: T.ROLES,
              value: account.roles.length > 0 ? account.roles.join(", ") : T.EMPTY_VALUE,
            },
            {
              label: T.STATUS,
              value: (
                <StatusBadge
                  label={isSuspended ? T.SUSPENDED : T.ACTIVE}
                  variant={isSuspended ? "warning" : "success"}
                />
              ),
            },
            {
              label: T.PASSWORD_CHANGE,
              value: account.mustChangePassword ? (
                <Badge variant="warning">{T.REQUIRED}</Badge>
              ) : (
                <Badge variant="neutral">{T.NOT_REQUIRED}</Badge>
              ),
            },
            { label: T.STUDENT_CODE, value: valueOrDash(account.studentCode) },
            { label: T.CLASS, value: valueOrDash(account.className) },
            { label: T.PHONE, value: valueOrDash(account.phone) },
            { label: T.DATE_OF_BIRTH, value: valueOrDash(account.dateOfBirth) },
          ]}
        />
      </div>
    </Modal>
  );
};
