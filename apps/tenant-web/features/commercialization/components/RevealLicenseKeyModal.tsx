"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import { Alert, Button, Modal, PasswordInput } from "@pte/ui";
import { ApiError } from "@pte/api-client";
import { useRevealLicenseKey } from "../api";
import { BILLING_TEXT as T } from "../constants";

interface RevealLicenseKeyModalProps {
  open: boolean;
  subscriptionPublicId: string | null;
  onClose: () => void;
  onRevealed: (subscriptionPublicId: string, licenseKey: string) => void;
}

const FORM_ID = "reveal-license-key-form";

export const RevealLicenseKeyModal = ({
  open,
  subscriptionPublicId,
  onClose,
  onRevealed,
}: RevealLicenseKeyModalProps): ReactElement => {
  const [password, setPassword] = useState("");
  const reveal = useRevealLicenseKey();

  const handleClose = (): void => {
    setPassword("");
    reveal.reset();
    onClose();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!subscriptionPublicId || !password) return;
    reveal.mutate(
      { subscriptionPublicId, password },
      {
        onSuccess: (data) => {
          onRevealed(subscriptionPublicId, data.licenseKey);
          setPassword("");
          reveal.reset();
          onClose();
        },
      },
    );
  };

  const errorMessage =
    reveal.error instanceof ApiError && reveal.error.code === "LICENSE_KEY_REVEAL_INVALID_PASSWORD"
      ? T.REVEAL_INVALID_PASSWORD
      : reveal.error
        ? T.REVEAL_ERROR
        : undefined;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={T.REVEAL_MODAL_TITLE}
      size="sm"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={handleClose}>
            {T.CANCEL}
          </Button>
          <Button type="submit" form={FORM_ID} isLoading={reveal.isPending} disabled={!password}>
            {reveal.isPending ? T.REVEAL_SUBMITTING : T.REVEAL_SUBMIT}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit} className="flex flex-col gap-4">
        <p className="text-sm text-gray-600">{T.REVEAL_MODAL_DESCRIPTION}</p>
        {errorMessage && <Alert tone="error">{errorMessage}</Alert>}
        <PasswordInput
          id="reveal-license-key-password"
          label={T.REVEAL_PASSWORD_LABEL}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoFocus
          required
        />
      </form>
    </Modal>
  );
};
