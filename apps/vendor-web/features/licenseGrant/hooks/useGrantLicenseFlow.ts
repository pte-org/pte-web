"use client";

import { useState } from "react";
import type { OrganizationResponse, PlanResponse } from "@pte/api-client";
import { usePlansQuery } from "@/features/commercialization/api";
import { useDebouncedSearch } from "@/features/i18n/useDebouncedSearch";
import { useGrantLicense, useLicenseGrantPreviewQuery, useTenantSearchQuery } from "../api";
import { GRANT_STEP_IDS, type GrantStepId } from "../constants";
import type { GrantFieldErrors, GrantLicenseFlow } from "../types";
import { buildGrantRequest, contractDayToIso, toContractDay } from "../utils";

/**
 * State for the four-step grant wizard; one Idempotency-Key per opened wizard makes a retry safe.
 * `initialCode` (e.g. a tenant just created) pre-fills the search and selects that exact organization.
 */
export function useGrantLicenseFlow(onGranted: () => void, initialCode = ""): GrantLicenseFlow {
  const [pickedStepIndex, setStepIndex] = useState(0);
  const [search, setSearch] = useState(initialCode);
  const [pickedTenant, setTenant] = useState<OrganizationResponse | null>(null);
  const [autoDismissed, setAutoDismissed] = useState(false);
  const [planId, setPlanId] = useState("");
  const [startDay, setStartDay] = useState("");
  const [contractReference, setContractReference] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<GrantFieldErrors>({});
  const [idempotencyKey, setIdempotencyKey] = useState(() => crypto.randomUUID());

  const debouncedSearch = useDebouncedSearch(search);
  const tenantSearch = useTenantSearchQuery(debouncedSearch);
  // Only an exact, active code match is preselected (derived, not stored, until the admin moves on).
  const autoTenant =
    initialCode && !autoDismissed && pickedTenant === null
      ? (tenantSearch.data?.find(
          (candidate) => candidate.code === initialCode && candidate.status === "ACTIVE",
        ) ?? null)
      : null;
  const tenant = pickedTenant ?? autoTenant;
  const stepIndex = autoTenant && pickedStepIndex === 0 ? 1 : pickedStepIndex;
  const { data: plans = [], isLoading: plansLoading } = usePlansQuery();
  const activePlans: PlanResponse[] = plans.filter((plan) => plan.status === "ACTIVE");
  const selectedPlan = activePlans.find((plan) => plan.publicId === planId) ?? null;
  const examPackage = selectedPlan?.type === "EXAM_PACKAGE";

  const tenantId = tenant?.publicId ?? "";
  const hostsPreview = useLicenseGrantPreviewQuery(tenantId, "", "");
  // The default preview fixes the default day; a changed day previews the admin's own start.
  const defaultPreview = useLicenseGrantPreviewQuery(tenantId, planId, "");
  const defaultStartDay = defaultPreview.data?.defaultStartsAt
    ? toContractDay(defaultPreview.data.defaultStartsAt)
    : "";
  const chosenDay = startDay || defaultStartDay;
  const changedStart = examPackage && chosenDay !== "" && chosenDay !== defaultStartDay;
  const chosenPreview = useLicenseGrantPreviewQuery(
    changedStart ? tenantId : "",
    planId,
    changedStart ? contractDayToIso(chosenDay) : "",
  );
  const preview = changedStart ? chosenPreview : defaultPreview;
  const grant = useGrantLicense();

  const step: GrantStepId = GRANT_STEP_IDS[stepIndex];

  const reset = (): void => {
    setStepIndex(0);
    setSearch("");
    setTenant(null);
    setPlanId("");
    setStartDay("");
    setContractReference("");
    setNote("");
    setErrors({});
    setIdempotencyKey(crypto.randomUUID());
    grant.reset();
  };

  const selectTenant = (next: OrganizationResponse): void => {
    setTenant(next);
    setStepIndex(1);
  };

  const selectPlan = (next: string): void => {
    setPlanId(next);
    setStartDay("");
    setErrors((current) => ({ ...current, plan: false }));
  };

  const validateDetails = (): boolean => {
    const next: GrantFieldErrors = {
      plan: !selectedPlan,
      contract: contractReference.trim().length === 0,
    };
    setErrors(next);
    return !next.plan && !next.contract;
  };

  const goNext = (): void => {
    if (step === "tenant" && !tenant) return;
    if (step === "details" && !validateDetails()) return;
    if (autoTenant) setTenant(autoTenant);
    setStepIndex(Math.min(stepIndex + 1, GRANT_STEP_IDS.length - 1));
  };

  const goBack = (): void => {
    // Going back to the search drops the preselection so the admin can pick another organization.
    if (stepIndex === 1) {
      setAutoDismissed(true);
      setTenant(null);
    }
    setStepIndex(Math.max(stepIndex - 1, 0));
  };

  const submit = async (): Promise<void> => {
    if (!tenant || !validateDetails()) return;
    const payload = buildGrantRequest({
      tenantId: tenant.publicId,
      planId,
      startDay: chosenDay,
      defaultStartDay,
      contractReference,
      note,
      examPackage,
    });
    try {
      await grant.mutateAsync({ payload, idempotencyKey });
      reset();
      onGranted();
    } catch {
      // The error is rendered; the same key keeps a retry from granting twice.
    }
  };

  return {
    step,
    search,
    setSearch,
    tenantSearch,
    tenant,
    selectTenant,
    hosts: hostsPreview.data?.hosts ?? [],
    hostsLoading: hostsPreview.isLoading,
    activePlans,
    plansLoading,
    selectedPlan,
    examPackage,
    planId,
    selectPlan,
    chosenDay,
    setStartDay,
    contractReference,
    setContractReference,
    note,
    setNote,
    errors,
    preview,
    grant,
    goNext,
    goBack,
    submit,
    reset,
  };
}
