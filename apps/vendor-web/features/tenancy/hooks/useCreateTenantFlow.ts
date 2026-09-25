import { useState } from "react";
import { ApiError, getUserFacingApiErrorMessage } from "@pte/api-client";
import { CREATE_TENANT_CONFLICT_TEXT } from "../constants";
import { useCreateTenant, useTenants } from "../api";
import { validateCreateConflict } from "../utils/validateCreateConflict";
import type { CreateTenantInput, Tenant } from "../types";

function mutationErrorMessage(error: unknown): string | undefined {
  if (!error) return undefined;
  if (error instanceof ApiError && error.kind === "conflict") {
    if (error.code === "TENANT_CODE_ALREADY_USED" || error.code === "REQUESTED_CODE_ALREADY_USED") {
      return CREATE_TENANT_CONFLICT_TEXT.DUPLICATE_CODE;
    }
    if (error.code === "TENANT_NAME_ALREADY_USED") {
      return CREATE_TENANT_CONFLICT_TEXT.DUPLICATE_NAME;
    }
    return getUserFacingApiErrorMessage(error, CREATE_TENANT_CONFLICT_TEXT.TENANT_CONFLICT);
  }
  return getUserFacingApiErrorMessage(error);
}

interface UseCreateTenantFlowOptions {
  /** Called once the "created" confirmation modal is dismissed, e.g. to redirect. */
  onCreated?: (tenant: Tenant) => void;
}

interface UseCreateTenantFlowResult {
  open: boolean;
  openModal: () => void;
  closeModal: () => void;
  confirmCreate: (input: CreateTenantInput) => void;
  error: string | undefined;
  isSubmitting: boolean;
  createdTenant: Tenant | null;
  closeCreatedModal: () => void;
}

export function useCreateTenantFlow(
  options: UseCreateTenantFlowOptions = {},
): UseCreateTenantFlowResult {
  const { data: tenants } = useTenants();
  const create = useCreateTenant();

  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [createdTenant, setCreatedTenant] = useState<Tenant | null>(null);

  const openModal = (): void => setOpen(true);

  const closeModal = (): void => {
    create.reset();
    setError(undefined);
    setOpen(false);
  };

  const confirmCreate = (input: CreateTenantInput): void => {
    setError(undefined);
    const conflictMessage = validateCreateConflict(input, tenants ?? []);
    if (conflictMessage) {
      setError(conflictMessage);
      return;
    }

    create.mutate(input, {
      onSuccess: (tenant) => {
        setOpen(false);
        setError(undefined);
        setCreatedTenant(tenant);
      },
    });
  };

  const closeCreatedModal = (): void => {
    const tenant = createdTenant;
    setCreatedTenant(null);
    if (tenant) options.onCreated?.(tenant);
  };

  return {
    open,
    openModal,
    closeModal,
    confirmCreate,
    error: error ?? mutationErrorMessage(create.error),
    isSubmitting: create.isPending,
    createdTenant,
    closeCreatedModal,
  };
}
