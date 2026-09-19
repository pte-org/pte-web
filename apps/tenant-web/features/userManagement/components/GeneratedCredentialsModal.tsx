"use client";

import type { ReactElement } from "react";
import { Alert, Button, CredentialDisplay, Modal } from "@pte/ui";
import type { GeneratedCredentials } from "../types";

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
      title="Temporary credentials"
      footer={
        <Button type="button" onClick={onClose}>
          Done
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <Alert tone="success">
          The temporary password was generated and queued to {credentials.email}. Save it now; it
          will not be shown again.
        </Alert>
        <DescriptionRow label="Username" value={credentials.username} />
        <DescriptionRow label="Email" value={credentials.email} />
        <CredentialDisplay credential={credentials.temporaryPassword} label="Temporary password" />
      </div>
    </Modal>
  );
};

const DescriptionRow = ({ label, value }: { label: string; value: string }): ReactElement => (
  <div>
    <p className="text-xs font-semibold uppercase text-gray-500">{label}</p>
    <p className="mt-1 text-sm text-gray-900">{value}</p>
  </div>
);
