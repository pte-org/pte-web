"use client";

import type { ReactElement } from "react";
import { Alert, DateInput, Input, Select, Textarea } from "@pte/ui";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import { CONTRACT_REFERENCE_MAX_LENGTH, GRANT_TEXT, NOTE_MAX_LENGTH } from "../constants";
import type { GrantLicenseFlow } from "../types";
import { startDayBounds } from "../utils";

interface GrantDetailsStepProps {
  flow: GrantLicenseFlow;
}

/** Step 3: plan, contract start, contract number and note. */
export const GrantDetailsStep = ({ flow }: GrantDetailsStepProps): ReactElement => {
  const T = useAdminCopy(GRANT_TEXT);
  const bounds = startDayBounds();
  const capacityPlan = flow.selectedPlan !== null && !flow.examPackage;

  return (
    <div className="flex flex-col gap-4">
      <Select
        id="grant-plan"
        label={T.PLAN_LABEL}
        placeholder={T.PLAN_PLACEHOLDER}
        options={flow.activePlans.map((plan) => ({ label: plan.name, value: plan.publicId }))}
        value={flow.planId}
        onChange={(event) => flow.selectPlan(event.target.value)}
        error={flow.errors.plan ? T.PLAN_REQUIRED : undefined}
        disabled={flow.plansLoading}
        required
      />
      {flow.examPackage && (
        <DateInput
          id="grant-start"
          label={T.START_LABEL}
          helperText={T.START_HELP}
          value={flow.chosenDay}
          min={bounds.min}
          max={bounds.max}
          onChange={(event) => flow.setStartDay(event.target.value)}
        />
      )}
      {capacityPlan && <Alert tone="warning">{T.CAPACITY_WARNING}</Alert>}
      <Input
        id="grant-contract"
        label={T.CONTRACT_LABEL}
        value={flow.contractReference}
        maxLength={CONTRACT_REFERENCE_MAX_LENGTH}
        onChange={(event) => flow.setContractReference(event.target.value)}
        error={flow.errors.contract ? T.CONTRACT_REQUIRED : undefined}
        required
      />
      <Textarea
        id="grant-note"
        label={T.NOTE_LABEL}
        value={flow.note}
        maxLength={NOTE_MAX_LENGTH}
        onChange={(event) => flow.setNote(event.target.value)}
      />
    </div>
  );
};
