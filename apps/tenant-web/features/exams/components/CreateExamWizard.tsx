"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import Link from "next/link";
import type { AudienceSourceRequest, ScoreTemplateResponse } from "@pte/api-client";
import { Alert, Input, Modal, Select } from "@pte/ui";
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
  FORM_MODE_OPTIONS,
  REUSE_POLICY_OPTIONS,
} from "../constants";
import type { CreateExamWorkflowInput } from "../types";
import {
  validateCreateExamWorkflow,
  type CreateExamWorkflowErrors,
} from "../utils/validateCreateExamWorkflow";

interface CreateExamWizardProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: CreateExamWorkflowInput) => void;
  activeTemplate?: ScoreTemplateResponse;
  templateLoading?: boolean;
  templateError?: unknown;
  error?: unknown;
  isSubmitting?: boolean;
}

const FORM_ID = "create-exam-workflow-form";

function emptyForm(): CreateExamWorkflowInput {
  return {
    name: "",
    templatePublicId: "",
    subscriptionPublicId: "",
    opensAt: "",
    closesAt: "",
    examMode: "PRACTICE",
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
  templateLoading = false,
  templateError,
  error,
  isSubmitting = false,
}: CreateExamWizardProps): ReactElement => {
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<CreateExamWorkflowInput>(emptyForm);
  const [errors, setErrors] = useState<CreateExamWorkflowErrors>({});
  const [sourceType, setSourceType] = useState<AudienceSourceRequest["sourceType"]>("STUDENT");
  const [sourcePublicId, setSourcePublicId] = useState("");
  const [sourceSearch, setSourceSearch] = useState("");

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
      formMode: practice ? "SHARED_FORM" : "UNIQUE_FORM_PER_STUDENT",
      reusePolicy: practice ? "ALLOW" : "EXCLUDE_STARTED_IN_SERIES",
      seriesKey: practice ? "" : previous.seriesKey,
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
    const nextErrors = validateCreateExamWorkflow(effectiveForm, undefined, requireAudience);
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const goToReview = (): void => {
    if (validate(false)) setStep(2);
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
      size="xl"
      footer={
        <>
          <button
            type="button"
            onClick={step === 1 ? onClose : () => setStep(1)}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {step === 1 ? CREATE_EXAM_WIZARD_TEXT.CANCEL : CREATE_EXAM_WIZARD_TEXT.BACK}
          </button>
          {step === 1 ? (
            <button
              type="button"
              onClick={goToReview}
              className="rounded-lg bg-action px-4 py-2 text-sm font-semibold text-white hover:bg-action-hover"
            >
              {CREATE_EXAM_WIZARD_TEXT.NEXT}
            </button>
          ) : (
            <button
              type="submit"
              form={FORM_ID}
              disabled={isSubmitting}
              className="rounded-lg bg-action px-4 py-2 text-sm font-semibold text-white hover:bg-action-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? CREATE_EXAM_WIZARD_TEXT.SUBMITTING : CREATE_EXAM_WIZARD_TEXT.SUBMIT}
            </button>
          )}
        </>
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {submitMessage && <Alert tone="error">{submitMessage}</Alert>}
        {step === 1 ? (
          <>
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              {CREATE_EXAM_WIZARD_TEXT.STEP_BASIC}
            </div>
            <Input
              label={CREATE_EXAM_WIZARD_TEXT.NAME_LABEL}
              placeholder={CREATE_EXAM_WIZARD_TEXT.NAME_PLACEHOLDER}
              value={form.name}
              error={errors.name}
              onChange={(event) => update("name", event.target.value)}
            />
            <Select
              label={CREATE_EXAM_WIZARD_TEXT.TEMPLATE_LABEL}
              placeholder={CREATE_EXAM_WIZARD_TEXT.TEMPLATE_PLACEHOLDER}
              helperText={templateMessage ?? CREATE_EXAM_WIZARD_TEXT.TEMPLATE_HELPER}
              value={effectiveForm.templatePublicId}
              error={errors.templatePublicId}
              disabled={templateLoading || !activeTemplate}
              onChange={(event) => update("templatePublicId", event.target.value)}
              options={
                activeTemplate
                  ? [
                      {
                        label: `${activeTemplate.name} (v${activeTemplate.version})`,
                        value: activeTemplate.publicId,
                      },
                    ]
                  : []
              }
            />
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
            </div>
          </>
        ) : (
          <>
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              {CREATE_EXAM_WIZARD_TEXT.STEP_AUDIENCE}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label={CREATE_EXAM_WIZARD_TEXT.FORM_MODE_LABEL}
                value={form.formMode}
                onChange={(event) =>
                  update("formMode", event.target.value as CreateExamWorkflowInput["formMode"])
                }
                options={FORM_MODE_OPTIONS}
              />
              <Select
                label={CREATE_EXAM_WIZARD_TEXT.REUSE_POLICY_LABEL}
                value={form.reusePolicy}
                error={errors.seriesKey}
                onChange={(event) =>
                  update(
                    "reusePolicy",
                    event.target.value as CreateExamWorkflowInput["reusePolicy"],
                  )
                }
                options={REUSE_POLICY_OPTIONS}
              />
            </div>
            {form.reusePolicy !== "ALLOW" && (
              <Input
                label={CREATE_EXAM_WIZARD_TEXT.SERIES_LABEL}
                placeholder={CREATE_EXAM_WIZARD_TEXT.SERIES_PLACEHOLDER}
                value={form.seriesKey}
                error={errors.seriesKey}
                onChange={(event) => update("seriesKey", event.target.value)}
              />
            )}
            <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="text-sm font-semibold text-gray-900">
                  {CREATE_EXAM_WIZARD_TEXT.SOURCES_TITLE}
                </div>
                {sourceType === "CLASS" && (
                  <Link
                    href="/host/programs"
                    className="text-xs font-medium text-blue-700 hover:underline"
                  >
                    {CREATE_EXAM_WIZARD_TEXT.MANAGE_CLASSES}
                  </Link>
                )}
              </div>
              <p className="mb-3 text-sm text-gray-600">{CREATE_EXAM_WIZARD_TEXT.SOURCES_HELPER}</p>
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
                  helperText={CREATE_EXAM_WIZARD_TEXT.SOURCE_HELPER}
                  value={sourcePublicId}
                  disabled={sourceLoading || sourceOptions.length === 0}
                  onChange={(event) => setSourcePublicId(event.target.value)}
                  options={sourceOptions}
                />
                <button
                  type="button"
                  onClick={addSource}
                  disabled={!sourcePublicId}
                  className="rounded-lg border border-action px-3 py-2.5 text-sm font-medium text-action hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {CREATE_EXAM_WIZARD_TEXT.ADD_SOURCE}
                </button>
              </div>
              {errors.sources && <p className="mt-2 text-sm text-red-600">{errors.sources}</p>}
              {effectiveForm.sources.length === 0 ? (
                <p className="mt-3 text-sm text-gray-500">{CREATE_EXAM_WIZARD_TEXT.NO_SOURCES}</p>
              ) : (
                <ul className="mt-3 flex flex-col gap-2">
                  {effectiveForm.sources.map((source, index) => (
                    <li
                      key={`${source.sourceType}-${source.sourcePublicId}`}
                      className="flex items-center justify-between rounded bg-white px-3 py-2 text-sm"
                    >
                      <span className="text-gray-700">
                        {source.sourceType}:{" "}
                        {sourceLabels.get(`${source.sourceType}:${source.sourcePublicId}`) ??
                          source.sourcePublicId}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeSource(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        {CREATE_EXAM_WIZARD_TEXT.REMOVE_SOURCE}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="rounded-md border border-blue-100 bg-blue-50 p-4">
              <div className="mb-2 text-sm font-semibold text-blue-900">
                {CREATE_EXAM_WIZARD_TEXT.REVIEW_TITLE}
              </div>
              <dl className="grid gap-2 text-sm text-blue-900 sm:grid-cols-2">
                <div>
                  <dt className="font-medium">{CREATE_EXAM_WIZARD_TEXT.REVIEW_TEMPLATE}</dt>
                  <dd>{activeTemplate?.name ?? CREATE_EXAM_WIZARD_TEXT.EMPTY_VALUE}</dd>
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
