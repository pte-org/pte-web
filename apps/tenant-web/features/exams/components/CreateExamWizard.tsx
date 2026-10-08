"use client";

import { useMemo, useState, type FormEvent, type ReactElement } from "react";
import Link from "next/link";
import {
  resolveExamLockdownMode,
  type AudienceSourceRequest,
  type ScoreTemplateResponse,
} from "@pte/api-client";
import { Alert, Input, Modal, Select, Stepper } from "@pte/ui";
import { useAllTenantClasses } from "@/features/classes/api";
import { useSubscriptionsQuery, useTenantPlansQuery } from "@/features/commercialization/api";
import { errorMessage } from "@/features/examoperations/errorMessage";
import { useTenantStudents } from "@/features/examoperations/api";
import { useMyOrganizations, usePrograms } from "@/features/programs/api";
import {
  AUDIENCE_SOURCE_OPTIONS,
  CREATE_EXAM_WIZARD_ERRORS,
  CREATE_EXAM_WIZARD_TEXT,
  EXAM_MODE_OPTIONS,
  EXAM_SKILL_OPTIONS,
  REUSE_POLICY_OPTIONS,
} from "../constants";
import type { CreateExamWorkflowInput, ExamSkill } from "../types";
import {
  validateCreateExamWorkflow,
  type CreateExamWorkflowErrors,
} from "../utils/validateCreateExamWorkflow";
import { getExamPolicyLabel } from "../utils/examPolicy";

interface CreateExamWizardProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: CreateExamWorkflowInput) => void;
  activeTemplate?: ScoreTemplateResponse;
  templateError?: unknown;
  error?: unknown;
  isSubmitting?: boolean;
}

const FORM_ID = "create-exam-workflow-form";
type CreateExamStep = 1 | 2 | 3 | 4;

function getTemplateSkills(items?: ScoreTemplateResponse["items"]): ExamSkill[] {
  return EXAM_SKILL_OPTIONS.filter((option) =>
    items?.some((item) => item.section === option.value),
  ).map((option) => option.value);
}

function emptyForm(activeTemplate?: ScoreTemplateResponse): CreateExamWorkflowInput {
  return {
    name: "",
    templatePublicId: activeTemplate?.publicId ?? "",
    subscriptionPublicId: "",
    opensAt: "",
    closesAt: "",
    examMode: "PRACTICE",
    practiceAntiCheatEnabled: false,
    selectedSkills: getTemplateSkills(activeTemplate?.items),
    maxRetriesPerStudent: "0",
    formMode: "SHARED_FORM",
    reusePolicy: "ALLOW",
    seriesKey: "",
    capacity: "",
    sources: [],
  };
}

export const CreateExamWizard = ({
  open,
  onClose,
  onSubmit,
  activeTemplate,
  templateError,
  error,
  isSubmitting = false,
}: CreateExamWizardProps): ReactElement => {
  const [step, setStep] = useState<CreateExamStep>(1);
  const [form, setForm] = useState<CreateExamWorkflowInput>(() => emptyForm(activeTemplate));
  const [errors, setErrors] = useState<CreateExamWorkflowErrors>({});
  const [sourceType, setSourceType] = useState<AudienceSourceRequest["sourceType"]>("STUDENT");
  const [sourcePublicId, setSourcePublicId] = useState("");
  const [sourceSearch, setSourceSearch] = useState("");

  const templateSkills = useMemo<ExamSkill[]>(
    () => getTemplateSkills(activeTemplate?.items),
    [activeTemplate?.items],
  );

  const { data: subscriptions = [], isLoading: subscriptionsLoading } = useSubscriptionsQuery();
  const { data: plans = [] } = useTenantPlansQuery();
  const { data: tenantClasses = [], isLoading: classesLoading } = useAllTenantClasses(open);
  const { data: tenantStudents = [], isLoading: studentsLoading } = useTenantStudents(open);
  const { data: organizations = [] } = useMyOrganizations(open);
  const organizationPublicId = organizations[0]?.publicId ?? "";
  const { data: programs = [], isLoading: programsLoading } = usePrograms(
    organizationPublicId,
    open,
  );
  const activeSubscriptions = subscriptions.filter(
    (subscription) => subscription.status === "ACTIVE",
  );
  const planNameById = new Map(plans.map((plan) => [plan.publicId, plan.name]));
  const templateMessage = templateError
    ? errorMessage(templateError, CREATE_EXAM_WIZARD_TEXT.NO_TEMPLATE)
    : undefined;
  const submitMessage = error ? errorMessage(error) : undefined;
  const effectiveForm: CreateExamWorkflowInput = {
    ...form,
    templatePublicId: form.templatePublicId || activeTemplate?.publicId || "",
  };
  const effectiveLockdownMode = resolveExamLockdownMode(
    effectiveForm.examMode,
    effectiveForm.practiceAntiCheatEnabled,
  );

  const normalizedSourceSearch = sourceSearch.trim().toLowerCase();
  const sourceMatchesSearch = (values: string[]): boolean =>
    !normalizedSourceSearch ||
    values.some((value) => value.toLowerCase().includes(normalizedSourceSearch));

  const allSourceOptions = [
    ...(sourceType === "STUDENT"
      ? tenantStudents
          .filter((student) => student.status === "ACTIVE")
          .map((student) => ({
            label: `${student.fullName} (${student.email})${student.studentCode ? ` · ${student.studentCode}` : ""}`,
            value: student.publicId,
            searchValues: [
              student.fullName,
              student.email,
              student.username,
              student.studentCode ?? "",
            ],
          }))
      : []),
    ...(sourceType === "CLASS"
      ? tenantClasses
          .filter((studentClass) => studentClass.status === "ACTIVE")
          .map((studentClass) => ({
            label: `${studentClass.className} (${studentClass.programName})`,
            value: studentClass.classPublicId,
            searchValues: [studentClass.className, studentClass.programName],
          }))
      : []),
    ...(sourceType === "PROGRAM"
      ? programs
          .filter((program) => program.status === "ACTIVE")
          .map((program) => ({
            label: program.name,
            value: program.publicId,
            searchValues: [program.name],
          }))
      : []),
  ];
  const sourceOptions = allSourceOptions
    .filter((option) => sourceMatchesSearch(option.searchValues))
    .map(({ label, value }) => ({ label, value }));
  const sourceLabels = new Map<string, string>();
  tenantStudents.forEach((student) =>
    sourceLabels.set(`STUDENT:${student.publicId}`, `${student.fullName} (${student.email})`),
  );
  tenantClasses.forEach((studentClass) =>
    sourceLabels.set(
      `CLASS:${studentClass.classPublicId}`,
      `${studentClass.className} (${studentClass.programName})`,
    ),
  );
  programs.forEach((program) => sourceLabels.set(`PROGRAM:${program.publicId}`, program.name));
  const sourceLoading =
    sourceType === "STUDENT"
      ? studentsLoading
      : sourceType === "CLASS"
        ? classesLoading
        : programsLoading;

  const update = <K extends keyof CreateExamWorkflowInput>(
    field: K,
    value: CreateExamWorkflowInput[K],
  ): void => {
    setForm((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: undefined }));
  };

  const changeExamMode = (value: CreateExamWorkflowInput["examMode"]): void => {
    const practice = value === "PRACTICE";
    setForm((previous) => ({
      ...previous,
      examMode: value,
      practiceAntiCheatEnabled: practice ? previous.practiceAntiCheatEnabled : false,
      selectedSkills: practice ? previous.selectedSkills : templateSkills,
      formMode: "SHARED_FORM",
      reusePolicy: "ALLOW",
      seriesKey: "",
      maxRetriesPerStudent: practice ? previous.maxRetriesPerStudent : "0",
    }));
    setErrors((previous) => ({ ...previous, seriesKey: undefined }));
  };

  const addSource = (): void => {
    const normalizedId = sourcePublicId.trim();
    if (!normalizedId) {
      setErrors((previous) => ({
        ...previous,
        sources: CREATE_EXAM_WIZARD_ERRORS.SOURCE_REQUIRED,
      }));
      return;
    }
    if (
      effectiveForm.sources.some(
        (source) => source.sourceType === sourceType && source.sourcePublicId === normalizedId,
      )
    ) {
      setErrors((previous) => ({
        ...previous,
        sources: CREATE_EXAM_WIZARD_ERRORS.SOURCE_DUPLICATE,
      }));
      return;
    }
    update("sources", [...effectiveForm.sources, { sourceType, sourcePublicId: normalizedId }]);
    setSourcePublicId("");
    setSourceSearch("");
  };

  const removeSource = (index: number): void => {
    update(
      "sources",
      effectiveForm.sources.filter((_, sourceIndex) => sourceIndex !== index),
    );
  };

  const validate = (requireAudience = true): boolean => {
    const nextErrors = validateCreateExamWorkflow(
      effectiveForm,
      undefined,
      requireAudience,
      templateSkills,
      requireAudience,
    );
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateStep = (currentStep: Exclude<CreateExamStep, 4>): boolean => {
    const allErrors = validateCreateExamWorkflow(
      effectiveForm,
      undefined,
      currentStep === 3,
      templateSkills,
      currentStep === 3,
    );
    const fields: ReadonlyArray<keyof CreateExamWorkflowErrors> =
      currentStep === 1
        ? ["name", "templatePublicId", "subscriptionPublicId", "capacity", "selectedSkills"]
        : currentStep === 2
          ? ["opensAt", "closesAt", "maxRetriesPerStudent", "seriesKey"]
          : ["sources"];
    const nextErrors: CreateExamWorkflowErrors = {};
    fields.forEach((field) => {
      const message = allErrors[field];
      if (message) nextErrors[field] = message;
    });
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const goToNextStep = (): void => {
    if (step === 4 || !validateStep(step)) return;
    setStep((currentStep) =>
      currentStep < 4 ? ((currentStep + 1) as CreateExamStep) : currentStep,
    );
  };

  const goToPreviousStep = (): void => {
    setStep((currentStep) =>
      currentStep > 1 ? ((currentStep - 1) as CreateExamStep) : currentStep,
    );
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (validate()) onSubmit(effectiveForm);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={CREATE_EXAM_WIZARD_TEXT.TITLE}
      size="full"
      stickyFooter
      footer={
        <>
          <button
            type="button"
            onClick={step === 1 ? onClose : goToPreviousStep}
            className="rounded-lg border border-[var(--shell-border)] px-4 py-2 text-sm font-medium text-[var(--ink-primary)] transition-colors hover:bg-[var(--surface-subtle)]"
          >
            {step === 1 ? CREATE_EXAM_WIZARD_TEXT.CANCEL : CREATE_EXAM_WIZARD_TEXT.BACK}
          </button>
          {step < 4 ? (
            <button
              type="button"
              onClick={goToNextStep}
              className="rounded-lg bg-action px-4 py-2 text-sm font-semibold text-[var(--action-foreground)] transition-colors hover:bg-action-hover"
            >
              {step === 3
                ? CREATE_EXAM_WIZARD_TEXT.REVIEW_AND_CREATE
                : CREATE_EXAM_WIZARD_TEXT.NEXT}
            </button>
          ) : (
            <button
              type="submit"
              form={FORM_ID}
              disabled={isSubmitting}
              className="rounded-lg bg-action px-4 py-2 text-sm font-semibold text-[var(--action-foreground)] transition-colors hover:bg-action-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? CREATE_EXAM_WIZARD_TEXT.SUBMITTING : CREATE_EXAM_WIZARD_TEXT.SUBMIT}
            </button>
          )}
        </>
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <Stepper
          steps={[
            { id: "details", label: CREATE_EXAM_WIZARD_TEXT.STEP_DETAILS },
            { id: "schedule", label: CREATE_EXAM_WIZARD_TEXT.STEP_SCHEDULE_POLICY },
            { id: "audience", label: CREATE_EXAM_WIZARD_TEXT.STEP_AUDIENCE },
            { id: "review", label: CREATE_EXAM_WIZARD_TEXT.STEP_REVIEW },
          ]}
          currentStep={["details", "schedule", "audience", "review"][step - 1]}
        />
        {submitMessage && <Alert tone="error">{submitMessage}</Alert>}
        {step === 1 ? (
          <>
            <div className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-secondary)]">
              {CREATE_EXAM_WIZARD_TEXT.STEP_DETAILS}
            </div>
            <Input
              label={CREATE_EXAM_WIZARD_TEXT.NAME_LABEL}
              placeholder={CREATE_EXAM_WIZARD_TEXT.NAME_PLACEHOLDER}
              value={form.name}
              error={errors.name}
              onChange={(event) => update("name", event.target.value)}
            />
            {templateMessage && <Alert tone="error">{templateMessage}</Alert>}
            <Select
              label={CREATE_EXAM_WIZARD_TEXT.SUBSCRIPTION_LABEL}
              placeholder={
                !subscriptionsLoading && activeSubscriptions.length === 0
                  ? CREATE_EXAM_WIZARD_TEXT.NO_ACTIVE_SUBSCRIPTIONS
                  : CREATE_EXAM_WIZARD_TEXT.SUBSCRIPTION_PLACEHOLDER
              }
              value={form.subscriptionPublicId}
              error={errors.subscriptionPublicId}
              disabled={subscriptionsLoading || activeSubscriptions.length === 0}
              onChange={(event) => update("subscriptionPublicId", event.target.value)}
              options={activeSubscriptions.map((subscription) => ({
                label: `${planNameById.get(subscription.planId) ?? CREATE_EXAM_WIZARD_TEXT.PLAN_FALLBACK} — ${subscription.licenseKey}`,
                value: subscription.publicId,
              }))}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label={CREATE_EXAM_WIZARD_TEXT.MODE_LABEL}
                value={form.examMode}
                onChange={(event) =>
                  changeExamMode(event.target.value as CreateExamWorkflowInput["examMode"])
                }
                options={EXAM_MODE_OPTIONS}
              />
              <Input
                type="number"
                min={1}
                step={1}
                label={CREATE_EXAM_WIZARD_TEXT.CAPACITY_LABEL}
                value={form.capacity}
                error={errors.capacity}
                onChange={(event) => update("capacity", event.target.value)}
              />
            </div>
            {form.examMode === "PRACTICE" ? (
              <fieldset className="rounded-xl border border-[var(--shell-border)] bg-[var(--surface-card)] p-5">
                <legend className="px-1 text-sm font-medium text-[var(--ink-primary)]">
                  {CREATE_EXAM_WIZARD_TEXT.SKILLS_LABEL}
                </legend>
                <div className="flex flex-wrap gap-x-6 gap-y-3">
                  {EXAM_SKILL_OPTIONS.map((option) => {
                    const isAvailable = templateSkills.includes(option.value);
                    const availabilityId = `exam-skill-${option.value.toLowerCase()}-availability`;

                    return (
                      <label
                        key={option.value}
                        className={`flex items-center gap-2 text-sm ${
                          isAvailable
                            ? "text-[var(--ink-primary)]"
                            : "text-[var(--ink-muted)]"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={form.selectedSkills.includes(option.value)}
                          disabled={!isAvailable}
                          aria-describedby={isAvailable ? undefined : availabilityId}
                          onChange={(event) => {
                            const nextSkills = event.target.checked
                              ? [...form.selectedSkills, option.value]
                              : form.selectedSkills.filter((skill) => skill !== option.value);
                            update("selectedSkills", nextSkills);
                          }}
                        />
                        <span>{option.label}</span>
                        {!isAvailable && (
                          <span id={availabilityId} className="text-xs">
                            ({CREATE_EXAM_WIZARD_TEXT.SKILL_UNAVAILABLE})
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
                {errors.selectedSkills && (
                  <p className="mt-2 text-sm text-[var(--blush-action)]">{errors.selectedSkills}</p>
                )}
              </fieldset>
            ) : (
              <div className="rounded-xl border border-[var(--shell-border)] bg-[var(--surface-subtle)] p-5">
                <div className="text-sm font-medium text-[var(--ink-primary)]">
                  {CREATE_EXAM_WIZARD_TEXT.FULL_TEMPLATE_SCOPE}
                </div>
                <p className="mt-1 text-sm text-[var(--ink-secondary)]">
                  {templateSkills
                    .map((skill) => EXAM_SKILL_OPTIONS.find((option) => option.value === skill)?.label)
                    .filter(Boolean)
                    .join(", ") || CREATE_EXAM_WIZARD_TEXT.EMPTY_VALUE}
                </p>
              </div>
            )}
          </>
        ) : step === 2 ? (
          <>
            <div className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-secondary)]">
              {CREATE_EXAM_WIZARD_TEXT.STEP_SCHEDULE_POLICY}
            </div>
            <div className="grid gap-4 rounded-xl border border-[var(--shell-border)] bg-[var(--surface-card)] p-5 sm:grid-cols-2">
              <Input
                type="datetime-local"
                label={CREATE_EXAM_WIZARD_TEXT.OPENS_AT_LABEL}
                value={form.opensAt}
                error={errors.opensAt}
                onChange={(event) => update("opensAt", event.target.value)}
              />
              <Input
                type="datetime-local"
                label={CREATE_EXAM_WIZARD_TEXT.CLOSES_AT_LABEL}
                value={form.closesAt}
                error={errors.closesAt}
                onChange={(event) => update("closesAt", event.target.value)}
              />
              {form.examMode === "PRACTICE" && (
                <Input
                  type="number"
                  min={0}
                  max={9}
                  step={1}
                  label={CREATE_EXAM_WIZARD_TEXT.RETRIES_LABEL}
                  value={form.maxRetriesPerStudent}
                  error={errors.maxRetriesPerStudent}
                  onChange={(event) => update("maxRetriesPerStudent", event.target.value)}
                />
              )}
            </div>
            {form.examMode === "PRACTICE" && (
              <fieldset className="rounded-xl border border-[var(--shell-border)] bg-[var(--surface-card)] p-5">
                <legend className="px-1 text-sm font-medium text-[var(--ink-primary)]">
                  {CREATE_EXAM_WIZARD_TEXT.PRACTICE_ANTI_CHEAT_LABEL}
                </legend>
                <div className="flex items-start gap-3">
                  <input
                    id="practice-anti-cheat"
                    type="checkbox"
                    checked={form.practiceAntiCheatEnabled}
                    className="mt-1 h-4 w-4 rounded border-[var(--shell-border)] text-action focus:ring-action"
                    onChange={(event) =>
                      update("practiceAntiCheatEnabled", event.target.checked)
                    }
                  />
                  <label
                    htmlFor="practice-anti-cheat"
                    className="text-sm font-medium text-[var(--ink-primary)]"
                  >
                    {CREATE_EXAM_WIZARD_TEXT.PRACTICE_ANTI_CHEAT_CONTROL}
                  </label>
                </div>
              </fieldset>
            )}
            {form.reusePolicy !== "ALLOW" && (
              <Input
                label={CREATE_EXAM_WIZARD_TEXT.SERIES_LABEL}
                placeholder={CREATE_EXAM_WIZARD_TEXT.SERIES_PLACEHOLDER}
                value={form.seriesKey}
                error={errors.seriesKey}
                onChange={(event) => update("seriesKey", event.target.value)}
              />
            )}
          </>
        ) : step === 3 ? (
          <>
            <div className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-secondary)]">
              {CREATE_EXAM_WIZARD_TEXT.STEP_AUDIENCE}
            </div>
            <div className="rounded-xl border border-[var(--shell-border)] bg-[var(--surface-subtle)] p-5">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="text-sm font-semibold text-[var(--ink-primary)]">
                  {CREATE_EXAM_WIZARD_TEXT.SOURCES_TITLE}
                </div>
                {sourceType === "CLASS" && (
                  <Link
                    href="/host/programs"
                    className="text-xs font-medium text-[var(--brand-ink)] hover:underline"
                  >
                    {CREATE_EXAM_WIZARD_TEXT.MANAGE_CLASSES}
                  </Link>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Select
                  label={CREATE_EXAM_WIZARD_TEXT.SOURCE_TYPE_LABEL}
                  value={sourceType}
                  onChange={(event) => {
                    setSourceType(event.target.value as AudienceSourceRequest["sourceType"]);
                    setSourcePublicId("");
                    setSourceSearch("");
                  }}
                  options={[...AUDIENCE_SOURCE_OPTIONS]}
                />
                <Input
                  label={CREATE_EXAM_WIZARD_TEXT.SOURCE_SEARCH_LABEL}
                  placeholder={CREATE_EXAM_WIZARD_TEXT.SOURCE_SEARCH_PLACEHOLDER}
                  value={sourceSearch}
                  onChange={(event) => {
                    setSourceSearch(event.target.value);
                    setSourcePublicId("");
                  }}
                />
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                <Select
                  label={CREATE_EXAM_WIZARD_TEXT.SOURCE_OPTION_LABEL}
                  placeholder={
                    sourceLoading
                      ? CREATE_EXAM_WIZARD_TEXT.SOURCE_LOADING
                      : sourceOptions.length === 0
                        ? CREATE_EXAM_WIZARD_TEXT.SOURCE_EMPTY
                        : CREATE_EXAM_WIZARD_TEXT.SOURCE_PLACEHOLDER
                  }
                  value={sourcePublicId}
                  disabled={sourceLoading || sourceOptions.length === 0}
                  onChange={(event) => setSourcePublicId(event.target.value)}
                  options={sourceOptions}
                />
                <button
                  type="button"
                  onClick={addSource}
                  disabled={!sourcePublicId}
                  className="rounded-lg border border-action px-3 py-2.5 text-sm font-medium text-action transition-colors hover:bg-[var(--action-tint)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {CREATE_EXAM_WIZARD_TEXT.ADD_SOURCE}
                </button>
              </div>
              {errors.sources && (
                <p className="mt-2 text-sm text-[var(--blush-action)]">{errors.sources}</p>
              )}
              {effectiveForm.sources.length === 0 ? (
                <p className="mt-3 text-sm text-[var(--ink-muted)]">
                  {CREATE_EXAM_WIZARD_TEXT.NO_SOURCES}
                </p>
              ) : (
                <ul className="mt-3 flex flex-col gap-2">
                  {effectiveForm.sources.map((source, index) => (
                    <li
                      key={`${source.sourceType}-${source.sourcePublicId}`}
                      className="flex items-center justify-between rounded-lg border border-[var(--shell-border)] bg-[var(--surface-card)] px-3 py-2 text-sm"
                    >
                      <span className="text-[var(--ink-primary)]">
                        {source.sourceType}:{" "}
                        {sourceLabels.get(`${source.sourceType}:${source.sourcePublicId}`) ??
                          source.sourcePublicId}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeSource(index)}
                        className="text-[var(--blush-action)] hover:underline"
                      >
                        {CREATE_EXAM_WIZARD_TEXT.REMOVE_SOURCE}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-secondary)]">
              {CREATE_EXAM_WIZARD_TEXT.STEP_REVIEW}
            </div>
            <div className="rounded-xl border border-[var(--brand-soft)] bg-[var(--brand-tint)] p-5">
              <div className="mb-2 text-sm font-semibold text-[var(--brand-deep)]">
                {CREATE_EXAM_WIZARD_TEXT.REVIEW_TITLE}
              </div>
              <dl className="grid gap-4 text-sm text-[var(--ink-primary)] sm:grid-cols-2">
                <div>
                  <dt className="font-medium">{CREATE_EXAM_WIZARD_TEXT.REVIEW_TEMPLATE}</dt>
                  <dd>{activeTemplate?.name ?? CREATE_EXAM_WIZARD_TEXT.EMPTY_VALUE}</dd>
                </div>
                <div>
                  <dt className="font-medium">{CREATE_EXAM_WIZARD_TEXT.REVIEW_MODE}</dt>
                  <dd>{EXAM_MODE_OPTIONS.find((option) => option.value === form.examMode)?.label}</dd>
                </div>
                <div>
                  <dt className="font-medium">{CREATE_EXAM_WIZARD_TEXT.REVIEW_SECURITY_POLICY}</dt>
                  <dd>{getExamPolicyLabel(form.examMode, effectiveLockdownMode)}</dd>
                </div>
                <div>
                  <dt className="font-medium">{CREATE_EXAM_WIZARD_TEXT.REVIEW_SKILLS}</dt>
                  <dd>
                    {form.selectedSkills
                      .map((skill) => EXAM_SKILL_OPTIONS.find((option) => option.value === skill)?.label)
                      .filter(Boolean)
                      .join(", ") || CREATE_EXAM_WIZARD_TEXT.EMPTY_VALUE}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium">{CREATE_EXAM_WIZARD_TEXT.REVIEW_RETRIES}</dt>
                  <dd>{form.maxRetriesPerStudent}</dd>
                </div>
                <div>
                  <dt className="font-medium">{CREATE_EXAM_WIZARD_TEXT.REVIEW_AUDIENCE}</dt>
                  <dd>{effectiveForm.sources.length}</dd>
                </div>
                <div>
                  <dt className="font-medium">{CREATE_EXAM_WIZARD_TEXT.REVIEW_RULE}</dt>
                  <dd>
                    {
                      REUSE_POLICY_OPTIONS.find((option) => option.value === form.reusePolicy)
                        ?.label
                    }
                  </dd>
                </div>
                <div>
                  <dt className="font-medium">{CREATE_EXAM_WIZARD_TEXT.REVIEW_CAPACITY}</dt>
                  <dd>{form.capacity || CREATE_EXAM_WIZARD_TEXT.EMPTY_VALUE}</dd>
                </div>
              </dl>
            </div>
          </>
        )}
      </form>
    </Modal>
  );
};
