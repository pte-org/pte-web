"use client";

import { useState, type ReactElement } from "react";
import { Alert, Button, Input, Modal } from "@pte/ui";
import { getUserFacingApiErrorMessage } from "@pte/api-client";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import { SUSPEND_MODAL_TEXT as RAW_SUSPEND_MODAL_TEXT } from "../constants";
import { useTenantSuspensionImpact } from "../api";
import type { Tenant } from "../types";

interface SuspendTenantModalProps {
  /**
   * The tenant to suspend; `null` keeps the modal closed. Callers should key
   * this component by `tenant.id` so the confirmation input resets per tenant.
   */
  tenant: Tenant | null;
  onCancel: () => void;
  onConfirm: (tenant: Tenant, days?: number) => void;
  isSubmitting?: boolean;
}

export const SuspendTenantModal = ({
  tenant,
  onCancel,
  onConfirm,
  isSubmitting = false,
}: SuspendTenantModalProps): ReactElement => {
  const T = useAdminCopy(RAW_SUSPEND_MODAL_TEXT);
  const [typedName, setTypedName] = useState("");
  const [duration, setDuration] = useState("");

  const confirmed = tenant !== null && typedName.trim() === tenant.name;
  const normalizedDuration = duration.trim();
  const durationDays = normalizedDuration === "" ? undefined : Number(normalizedDuration);
  const durationIsValid =
    normalizedDuration === "" ||
    (durationDays !== undefined &&
      Number.isSafeInteger(durationDays) &&
      durationDays >= 0 &&
      durationDays <= 2_147_483_647);
  const impact = useTenantSuspensionImpact(
    tenant?.id ?? "",
    durationDays,
    durationIsValid,
  );
  const impactData = impact.data;
  const impactReady = impact.isSuccess && !impact.isFetching;

  return (
    <Modal
      open={tenant !== null}
      onClose={onCancel}
      title={T.TITLE}
      isDismissDisabled={isSubmitting}
      footer={
        <>
          <Button
            variant="secondary"
            appearance="outline"
            onClick={onCancel}
            isDisabled={isSubmitting}
          >
            {T.CANCEL}
          </Button>
          <Button
            variant="danger"
            onClick={() => tenant && onConfirm(tenant, durationDays)}
            isPending={isSubmitting}
            loadingText={T.CONFIRM}
            isDisabled={!confirmed || !durationIsValid || !impactReady}
          >
            {T.CONFIRM}
          </Button>
        </>
      }
    >
      <p className="text-sm text-gray-600">{T.WARNING}</p>
      <div className="mt-4">
        <Input
          id="suspend-tenant-duration"
          type="number"
          min={0}
          step={1}
          label={T.DURATION_LABEL}
          value={duration}
          onChange={(event) => setDuration(event.target.value)}
          helperText={T.DURATION_HELPER}
          error={!durationIsValid ? T.DURATION_INVALID : undefined}
        />
      </div>
      <div className="mt-4">
        {impact.isPending && <p className="text-sm text-gray-500">{T.IMPACT_LOADING}</p>}
        {impact.isError && <Alert tone="error">{getUserFacingApiErrorMessage(impact.error, T.IMPACT_ERROR)}</Alert>}
        {impactData && (
          <Alert tone="warning" title={T.IMPACT_TITLE}>
            {impactData.activeSubscriptionCount === 0 ? (
              T.IMPACT_NONE
            ) : (
              <>
                <p>
                  {impactData.suspensionDays === 0
                    ? T.IMPACT_INDEFINITE(
                        impactData.activeSubscriptionCount,
                        impactData.totalDaysLost,
                      )
                    : T.IMPACT_SUMMARY(
                        impactData.activeSubscriptionCount,
                        impactData.totalDaysLost,
                      )}
                </p>
                {impactData.expiringSubscriptions.length > 0 && (
                  <div className="mt-2">
                    <p>{T.IMPACT_EXPIRING}</p>
                    <ul className="mt-1 list-disc pl-5">
                      {impactData.expiringSubscriptions.slice(0, 5).map((subscription) => (
                        <li key={subscription.subscriptionPublicId}>
                          {T.IMPACT_EXPIRING_ITEM(
                            subscription.daysLost,
                            new Date(subscription.expiresAt).toLocaleDateString(),
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </Alert>
        )}
      </div>
      <div className="mt-4 rounded-lg bg-gray-50 p-3">
        <p className="text-sm text-gray-600">{T.CONFIRM_PROMPT}</p>
        <p className="mt-1 font-semibold text-gray-900">{tenant?.name}</p>
      </div>
      <div className="mt-4">
        <Input
          id="suspend-tenant-name"
          type="text"
          label={T.INPUT_LABEL}
          value={typedName}
          onChange={(event) => setTypedName(event.target.value)}
          placeholder={T.INPUT_PLACEHOLDER}
        />
      </div>
    </Modal>
  );
};
