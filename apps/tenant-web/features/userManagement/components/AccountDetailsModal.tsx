"use client";

import type { ReactElement } from "react";
import { Alert, Badge, DescriptionList, Modal, StatusBadge } from "@pte/ui";
import type { AccountDetails } from "../types";

interface AccountDetailsModalProps {
  account: AccountDetails | null;
  open: boolean;
  onClose: () => void;
}

const valueOrDash = (value: string | null | undefined): string => value || "—";

export const AccountDetailsModal = ({
  account,
  open,
  onClose,
}: AccountDetailsModalProps): ReactElement | null => {
  if (!account) return null;

  const isSuspended = account.status === "SUSPENDED";

  return (
    <Modal open={open} onClose={onClose} title="Account details" size="lg">
      <div className="flex flex-col gap-5">
        <Alert tone="info">
          Existing passwords are never shown here. Use the available credential action to issue a
          fresh temporary password; it will be shown only once.
        </Alert>
        <DescriptionList
          items={[
            { label: "Username", value: <code>{account.username}</code> },
            { label: "Email", value: valueOrDash(account.email) },
            { label: "Full name", value: valueOrDash(account.fullName) },
            {
              label: "Roles",
              value: account.roles.length > 0 ? account.roles.join(", ") : "—",
            },
            {
              label: "Status",
              value: (
                <StatusBadge
                  label={isSuspended ? "Suspended" : "Active"}
                  variant={isSuspended ? "warning" : "success"}
                />
              ),
            },
            {
              label: "First-login password change",
              value: account.mustChangePassword ? (
                <Badge variant="warning">Required</Badge>
              ) : (
                <Badge variant="neutral">Not required</Badge>
              ),
            },
            { label: "Student code", value: valueOrDash(account.studentCode) },
            { label: "Class", value: valueOrDash(account.className) },
            { label: "Phone", value: valueOrDash(account.phone) },
            { label: "Date of birth", value: valueOrDash(account.dateOfBirth) },
          ]}
        />
      </div>
    </Modal>
  );
};
