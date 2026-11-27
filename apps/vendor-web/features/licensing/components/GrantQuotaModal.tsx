"use client";

import { useMemo, useState, type FormEvent, type ReactElement } from "react";
import { Alert, Modal, Select, useLocale } from "@pte/ui";
import { translateAdminText, useAdminCopy } from "@/features/i18n/adminCopy";
import { usePlansQuery } from "@/features/commercialization/api";
import { TenantFormField, fieldInputClass } from "../../tenancy/components/_TenantFormField";
import {
  EMPTY_GRANT_QUOTA,
  GRANT_QUOTA_ERRORS as RAW_GRANT_QUOTA_ERRORS,
  GRANT_QUOTA_TEXT as RAW_GRANT_QUOTA_TEXT,
} from "../constants";
import type { GrantQuotaErrors, GrantQuotaInput } from "../types";

interface GrantQuotaModalProps {
  open: boolean;
  tenantName?: string;
  onClose: () => void;
  onSubmit: (input: GrantQuotaInput) => void;
  error?: string;
  isSubmitting?: boolean;
}

const FORM_ID = "grant-quota-form";
const AMOUNT_PATTERN = /^[1-9]\d*$/;

export const GrantQuotaModal = ({
  open,
  tenantName,
  onClose,
  onSubmit,
  error,
  isSubmitting = false,
}: GrantQuotaModalProps): ReactElement => {
  const T = useAdminCopy(RAW_GRANT_QUOTA_TEXT);
  const E = useAdminCopy(RAW_GRANT_QUOTA_ERRORS);
  const { locale } = useLocale();
  const { data: plans = [], isLoading: isPlansLoading } = usePlansQuery();
  const [planType, setPlanType] = useState<"STUDENT_CAPACITY" | "EXAM_PACKAGE">("STUDENT_CAPACITY");

  const planOptions = useMemo(() => {
    return plans
      .filter((plan) => plan.status === "ACTIVE" && plan.type === planType)
      .map((plan) => ({
        value: plan.name,
        label: translateAdminText(plan.name, locale),
      }));
  }, [plans, locale, planType]);

  const grantingLabel = useAdminCopy("Granting...");
  const [form, setForm] = useState<GrantQuotaInput>(EMPTY_GRANT_QUOTA);
  const [errors, setErrors] = useState<GrantQuotaErrors>({});

  const handleClose = (): void => {
    setPlanType("STUDENT_CAPACITY");
    setForm(EMPTY_GRANT_QUOTA);
    setErrors({});
    onClose();
  };

  const handlePlanTypeChange = (nextType: "STUDENT_CAPACITY" | "EXAM_PACKAGE"): void => {
    if (nextType === planType) return;
    setPlanType(nextType);
    setForm((previous) => ({
      ...previous,
      packageName: "",
      amount: "",
    }));
    setErrors({});
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const nextErrors: GrantQuotaErrors = {};
    if (!form.packageName) nextErrors.packageName = E.REQUIRED;
    if (!form.amount.trim()) {
      nextErrors.amount = E.REQUIRED;
    } else if (!AMOUNT_PATTERN.test(form.amount.trim())) {
      nextErrors.amount = E.AMOUNT_INVALID;
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) onSubmit(form);
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={tenantName ? `${T.TITLE} — ${tenantName}` : T.TITLE}
      footer={
        <>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {T.CANCEL}
          </button>
          <button
            type="submit"
            form={FORM_ID}
            disabled={isSubmitting}
            className="rounded-lg bg-action px-4 py-2 text-sm font-semibold text-white hover:bg-action-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? grantingLabel : T.SUBMIT}
          </button>
        </>
      }
    >
      {error && (
        <div className="mb-4">
          <Alert tone="error">{error}</Alert>
        </div>
      )}
      <form id={FORM_ID} onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <TenantFormField
          label={translateAdminText("Plan type", locale)}
          htmlFor="grant-plan-type"
        >
          <div className="grid grid-cols-2 gap-2 rounded-lg bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => handlePlanTypeChange("STUDENT_CAPACITY")}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                planType === "STUDENT_CAPACITY"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {translateAdminText("Student capacity", locale)}
            </button>
            <button
              type="button"
              onClick={() => handlePlanTypeChange("EXAM_PACKAGE")}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                planType === "EXAM_PACKAGE"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {translateAdminText("Exam package", locale)}
            </button>
          </div>
        </TenantFormField>

        <TenantFormField
          label={T.PACKAGE_LABEL}
          htmlFor="grant-package"
          required
          error={errors.packageName}
        >
          <Select
            id="grant-package"
            value={form.packageName}
            onChange={(event) => {
              const selectedValue = event.target.value;
              const matchedPlan = plans.find(
                (p) =>
                  p.name === selectedValue ||
                  translateAdminText(p.name, locale) === selectedValue,
              );
              const slots =
                matchedPlan?.extraStudentSlots ?? (matchedPlan?.maxStudentsPerSession ?? null);
              setForm((previous) => ({
                ...previous,
                packageName: matchedPlan?.name ?? selectedValue,
                amount: slots ? String(slots) : previous.amount,
              }));
              setErrors((previous) => ({
                ...previous,
                packageName: undefined,
                ...(slots ? { amount: undefined } : {}),
              }));
            }}
            placeholder={
              isPlansLoading
                ? translateAdminText("Loading...", locale)
                : planOptions.length === 0
                  ? locale === "vi"
                    ? "Không có gói phù hợp"
                    : "No plans available"
                  : T.PACKAGE_PLACEHOLDER
            }
            options={planOptions}
            disabled={isPlansLoading || planOptions.length === 0}
            className={errors.packageName ? "!border-red-300 !bg-red-50/40" : undefined}
          />
        </TenantFormField>

        <TenantFormField
          label={T.AMOUNT_LABEL}
          htmlFor="grant-amount"
          required
          helper={
            planType === "EXAM_PACKAGE"
              ? translateAdminText("Students per session for this exam package.", locale)
              : T.AMOUNT_HELPER
          }
          error={errors.amount}
        >
          <input
            id="grant-amount"
            type="number"
            min="1"
            value={form.amount}
            onChange={(event) =>
              setForm((previous) => ({ ...previous, amount: event.target.value }))
            }
            placeholder={T.AMOUNT_PLACEHOLDER}
            className={fieldInputClass(errors.amount)}
          />
        </TenantFormField>

        <TenantFormField label={T.NOTE_LABEL} htmlFor="grant-note">
          <textarea
            id="grant-note"
            value={form.note}
            onChange={(event) => setForm((previous) => ({ ...previous, note: event.target.value }))}
            placeholder={T.NOTE_PLACEHOLDER}
            rows={3}
            className={fieldInputClass()}
          />
        </TenantFormField>
      </form>
    </Modal>
  );
};
