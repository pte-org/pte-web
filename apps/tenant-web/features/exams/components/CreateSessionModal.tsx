"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import { Alert, Checkbox, Input, Modal, Select } from "@pte/ui";
import { useSubscriptionsQuery, useTenantPlansQuery } from "@/features/commercialization/api";
import { CREATE_SESSION_TEXT, EMPTY_CREATE_SESSION, EXAM_SKILL_OPTIONS } from "../constants";
import { validateCreateSession } from "../utils/validateCreateSession";
import type { CreateSessionErrors, CreateSessionInput, ExamSkill } from "../types";

interface CreateSessionModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: CreateSessionInput) => void;
  error?: string;
  isSubmitting?: boolean;
}

const T = CREATE_SESSION_TEXT;
const FORM_ID = "create-session-form";

export const CreateSessionModal = ({
  open,
  onClose,
  onSubmit,
  error,
  isSubmitting = false,
}: CreateSessionModalProps): ReactElement => {
  const [form, setForm] = useState<CreateSessionInput>(EMPTY_CREATE_SESSION);
  const [errors, setErrors] = useState<CreateSessionErrors>({});

  const { data: subscriptions = [], isLoading: subscriptionsLoading } = useSubscriptionsQuery();
  const { data: plans = [] } = useTenantPlansQuery();
  const activeSubscriptions = subscriptions.filter((subscription) => subscription.status === "ACTIVE");
  const planNameById = new Map(plans.map((plan) => [plan.publicId, plan.name]));

  const handleChange = (
    field: "name" | "subscriptionPublicId" | "opensAt" | "closesAt" | "capacity",
    value: string,
  ): void => setForm((previous) => ({ ...previous, [field]: value }));

  const toggleSkill = (skill: ExamSkill, checked: boolean): void =>
    setForm((previous) => ({
      ...previous,
      skills: checked
        ? [...previous.skills, skill]
        : previous.skills.filter((existing) => existing !== skill),
    }));

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const nextErrors = validateCreateSession(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) onSubmit(form);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={T.TITLE}
      size="xl"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
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
            {isSubmitting ? T.SUBMITTING : T.SUBMIT}
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
        <Input
          label={T.NAME_LABEL}
          placeholder={T.NAME_PLACEHOLDER}
          value={form.name}
          error={errors.name}
          onChange={(event) => handleChange("name", event.target.value)}
        />
        <Select
          label={T.SUBSCRIPTION_LABEL}
          placeholder={
            !subscriptionsLoading && activeSubscriptions.length === 0
              ? T.NO_ACTIVE_SUBSCRIPTIONS
              : T.SUBSCRIPTION_PLACEHOLDER
          }
          helperText={T.SUBSCRIPTION_HELPER}
          value={form.subscriptionPublicId}
          error={errors.subscriptionPublicId}
          disabled={subscriptionsLoading || activeSubscriptions.length === 0}
          onChange={(event) => handleChange("subscriptionPublicId", event.target.value)}
          options={activeSubscriptions.map((subscription) => ({
            label: `${planNameById.get(subscription.planId) ?? "Plan"} — ${subscription.licenseKey}`,
            value: subscription.publicId,
          }))}
        />
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-gray-700">{T.SKILLS_LABEL}</span>
          <div className="grid grid-cols-2 gap-2">
            {EXAM_SKILL_OPTIONS.map((option) => (
              <Checkbox
                key={option.value}
                label={option.label}
                checked={form.skills.includes(option.value)}
                onChange={(event) => toggleSkill(option.value, event.target.checked)}
              />
            ))}
          </div>
          <span className="text-sm text-gray-500">{T.SKILLS_HELPER}</span>
          {errors.skills && <span className="text-sm text-red-600">{errors.skills}</span>}
        </div>
        <Input
          type="datetime-local"
          label={T.OPENS_AT_LABEL}
          value={form.opensAt}
          error={errors.opensAt}
          onChange={(event) => handleChange("opensAt", event.target.value)}
        />
        <Input
          type="datetime-local"
          label={T.CLOSES_AT_LABEL}
          value={form.closesAt}
          error={errors.closesAt}
          onChange={(event) => handleChange("closesAt", event.target.value)}
        />
        <Input
          type="number"
          min={1}
          step={1}
          label={T.CAPACITY_LABEL}
          placeholder={T.CAPACITY_PLACEHOLDER}
          value={form.capacity}
          error={errors.capacity}
          onChange={(event) => handleChange("capacity", event.target.value)}
        />
      </form>
    </Modal>
  );
};
