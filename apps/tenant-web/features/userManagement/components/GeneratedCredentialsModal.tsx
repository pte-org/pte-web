"use client";

import type { ReactElement } from "react";
import { Alert, Button, CredentialDisplay, Modal } from "@pte/ui";
import type { GeneratedCredentials } from "../types";
import { useUserManagementText } from "../hooks/useUserManagementText";

interface GeneratedCredentialsModalProps {
  credentials: GeneratedCredentials | null;
  open: boolean;
  onClose: () => void;
}

export const GeneratedCredentialsModal = ({
  credentials,
  open,
  onClose,
}: GeneratedCredentialsModalProps): ReactElement | null => {
  const T = useUserManagementText();
  if (!credentials) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={T.credentialsTitle}
      footer={
        <Button type="button" onClick={onClose}>
          {T.done}
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <Alert tone="success">
          {credentials.email ? T.emailDelivery(credentials.email) : T.noEmailDelivery}
        </Alert>
        <DescriptionRow label={T.username} value={credentials.username} />
        <DescriptionRow label={T.email} value={credentials.email} />
        <CredentialDisplay credential={credentials.temporaryPassword} label={T.temporaryPassword} />
      </div>
    </Modal>
  );
};

const EMPTY_VALUE = "—";

const DescriptionRow = ({
  label,
  value,
}: {
  label: string;
  value: string | null;
}): ReactElement => (
  <div>
    <p className="text-xs font-semibold uppercase text-gray-500">{label}</p>
    <p className="mt-1 text-sm text-gray-900">{value || EMPTY_VALUE}</p>
  </div>
);
