"use client";

import type { ReactElement } from "react";
import { Alert, Button, CredentialDisplay, Modal } from "@pte/ui";
import type { GeneratedCredentials } from "../types";
import { USER_MANAGEMENT_TEXT as T } from "../constants";

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
  if (!credentials) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={T.CREDENTIALS_TITLE}
      footer={
        <Button type="button" onClick={onClose}>
          {T.DONE}
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <Alert tone="success">
          {credentials.email ? T.EMAIL_DELIVERY(credentials.email) : T.NO_EMAIL_DELIVERY}
        </Alert>
        <DescriptionRow label={T.USERNAME} value={credentials.username} />
        <DescriptionRow label={T.EMAIL} value={credentials.email} />
        <CredentialDisplay credential={credentials.temporaryPassword} label={T.TEMPORARY_PASSWORD} />
      </div>
    </Modal>
  );
};

const DescriptionRow = ({
  label,
  value,
}: {
  label: string;
  value: string | null;
}): ReactElement => (
  <div>
    <p className="text-xs font-semibold uppercase text-gray-500">{label}</p>
    <p className="mt-1 text-sm text-gray-900">{value || T.EMPTY_VALUE}</p>
  </div>
);
