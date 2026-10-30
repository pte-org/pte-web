"use client";

import type { ReactElement } from "react";
import { Button, Modal, Stepper, useToast } from "@pte/ui";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import { GRANT_STEPS, GRANT_TEXT, type GrantStepId } from "../constants";
import { useGrantLicenseFlow } from "../hooks/useGrantLicenseFlow";
import type { GrantLicenseFlow } from "../types";
import { GrantConfirmStep } from "./_GrantConfirmStep";
import { GrantDetailsStep } from "./_GrantDetailsStep";
import { GrantPreviewStep } from "./_GrantPreviewStep";
import { GrantTenantSearchStep } from "./_GrantTenantSearchStep";

interface GrantLicenseWizardProps {
  open: boolean;
  onClose: () => void;
  /** Organization code to pre-select, e.g. right after creating a tenant. Remount (key) per code. */
  initialCode?: string;
}

const STEP_CONTENT: Record<GrantStepId, (flow: GrantLicenseFlow) => ReactElement | null> = {
  tenant: (flow) => <GrantTenantSearchStep flow={flow} />,
  confirm: (flow) => <GrantConfirmStep flow={flow} />,
  details: (flow) => <GrantDetailsStep flow={flow} />,
  preview: (flow) => <GrantPreviewStep flow={flow} />,
};

/** Admin grant of a package to one organization under contract; activation is immediate. */
export const GrantLicenseWizard = ({
  open,
  onClose,
  initialCode,
}: GrantLicenseWizardProps): ReactElement => {
  const T = useAdminCopy(GRANT_TEXT);
  const steps = useAdminCopy(GRANT_STEPS);
  const { showToast } = useToast();
  const flow = useGrantLicenseFlow(() => {
    showToast(T.SUCCESS, { tone: "success" });
    onClose();
  }, initialCode);
  const pending = flow.grant.isPending;
  const close = (): void => {
    if (pending) return;
    flow.reset();
    onClose();
  };
  const isFirst = flow.step === "tenant";
  const isLast = flow.step === "preview";

  return (
    <Modal
      open={open}
      onClose={close}
      title={T.TITLE}
      size="full"
      stickyFooter
      isDismissDisabled={pending}
      footer={
        <>
          <Button type="button" variant="ghost" disabled={pending} onClick={isFirst ? close : flow.goBack}>
            {isFirst ? T.CANCEL : T.BACK}
          </Button>
          {isLast ? (
            <Button
              type="button"
              isLoading={pending}
              loadingText={T.SUBMITTING}
              disabled={!flow.preview.data}
              onClick={() => void flow.submit()}
            >
              {T.SUBMIT}
            </Button>
          ) : (
            <Button type="button" disabled={isFirst && !flow.tenant} onClick={flow.goNext}>
              {T.NEXT}
            </Button>
          )}
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Stepper steps={steps} currentStep={flow.step} />
        {STEP_CONTENT[flow.step](flow)}
      </div>
    </Modal>
  );
};
