"use client";

import { useMemo, useState, type FormEvent, type ReactElement } from "react";
import {
  Alert,
  ActionMenu,
  Button,
  CollapsibleSection,
  ConfirmDialog,
  DataTable,
  Input,
  Modal,
  PageHeader,
  Select,
  StatCard,
  CheckCircleIcon,
  PencilIcon,
  useToast,
} from "@pte/ui";
import {
  getUserFacingApiErrorMessage,
  type PlanRequest,
  type PlanResponse,
  type PlanType,
} from "@pte/api-client";
import {
  useActivatePlan,
  useArchivePlan,
  useCreatePlan,
  usePlansQuery,
  useUpdatePlan,
} from "../api";
import { PLAN_CATALOG_TEXT as T } from "../constants";
import { CommercialPanel } from "./CommercialPanel";
import { CommercialStatusBadge } from "./CommercialStatusBadge";

const INITIAL_FORM: PlanRequest = {
  name: "",
  description: "",
  type: "EXAM_PACKAGE",
  price: "0",
  currency: "VND",
  durationDays: 30,
  maxStudentsPerSession: 500,
  extraStudentSlots: null,
};

const formatMoney = (plan: PlanResponse): string =>
  `${Number(plan.price).toLocaleString()} ${plan.currency}`;

// Backend integer fields are Java `int` (max 2,147,483,647); reject anything a
// 10-digit typo could produce instead of letting the server 500 on overflow.
const MAX_INT_FIELD_VALUE = 2_000_000_000;
// Business rule: no plan needs more than 2,000 students per session or add-on slot.
const MAX_STUDENT_COUNT = 2_000;

const clampToIntField = (rawValue: string, maxValue: number = MAX_INT_FIELD_VALUE): number | null => {
  const parsed = Number(rawValue);
  if (!rawValue || Number.isNaN(parsed)) return null;
  return Math.min(parsed, maxValue);
};

type CatalogFilter = PlanType | "ALL";

const PLAN_FORM_ID = "plan-catalog-form";

export const PlanCatalogView = (): ReactElement => {
  const { data: plans = [], isLoading, isError } = usePlansQuery();
  const createPlan = useCreatePlan();
  const updatePlan = useUpdatePlan();
  const activatePlan = useActivatePlan();
  const archivePlan = useArchivePlan();
  const [formType, setFormType] = useState<PlanType>("EXAM_PACKAGE");
  const [catalogFilter, setCatalogFilter] = useState<CatalogFilter>("ALL");
  const [form, setForm] = useState<PlanRequest>(INITIAL_FORM);
  const [editing, setEditing] = useState<PlanResponse | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [planToArchive, setPlanToArchive] = useState<PlanResponse | null>(null);
  const { showToast } = useToast();
  const visiblePlans = useMemo(
    () => (catalogFilter === "ALL" ? plans : plans.filter((plan) => plan.type === catalogFilter)),
    [catalogFilter, plans],
  );
  const activeCount = plans.filter((plan) => plan.status === "ACTIVE").length;
  const error = createPlan.error ?? updatePlan.error ?? activatePlan.error ?? archivePlan.error;
  const errorMessage = error
    ? getUserFacingApiErrorMessage(error, T.ERROR)
    : isError
      ? T.ERROR
      : undefined;

  const beginEdit = (plan: PlanResponse): void => {
    if (plan.status === "ARCHIVED") return;
    setEditing(plan);
    setIsFormOpen(true);
    setForm({
      name: plan.name,
      description: plan.description ?? "",
      type: plan.type,
      price: plan.price,
      currency: plan.currency,
      durationDays: plan.durationDays,
      maxStudentsPerSession: plan.maxStudentsPerSession,
      extraStudentSlots: plan.extraStudentSlots,
    });
    setFormType(plan.type);
  };

  const resetForm = (): void => {
    setEditing(null);
    setForm({ ...INITIAL_FORM });
    setFormType(INITIAL_FORM.type);
    setIsFormOpen(false);
  };

  const beginCreate = (): void => {
    setEditing(null);
    setForm({ ...INITIAL_FORM });
    setFormType(INITIAL_FORM.type);
    setIsFormOpen(true);
  };

  const save = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const payload: PlanRequest = {
      ...form,
      name: form.name.trim(),
      description: form.description?.trim() || undefined,
      type: formType,
      durationDays: formType === "EXAM_PACKAGE" ? form.durationDays : null,
      maxStudentsPerSession: formType === "EXAM_PACKAGE" ? form.maxStudentsPerSession : null,
      extraStudentSlots: formType === "STUDENT_CAPACITY" ? form.extraStudentSlots : null,
    };
    if (editing) {
      await updatePlan.mutateAsync({ publicId: editing.publicId, payload });
      showToast(T.UPDATED, { tone: "success" });
    } else {
      await createPlan.mutateAsync(payload);
      showToast(T.CREATED, { tone: "success" });
    }
    resetForm();
  };

  const transition = async (plan: PlanResponse): Promise<void> => {
    if (plan.status === "DRAFT") {
      await activatePlan.mutateAsync(plan.publicId);
      showToast(T.ACTIVATED, { tone: "success" });
      return;
    }
    if (plan.status === "ACTIVE") setPlanToArchive(plan);
  };

  const confirmArchive = async (): Promise<void> => {
    if (!planToArchive) return;
    await archivePlan.mutateAsync(planToArchive.publicId);
    setPlanToArchive(null);
    showToast(T.ARCHIVED_SUCCESS, { tone: "success" });
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={T.TITLE}
        subtitle={T.SUBTITLE}
        actions={
          <Button type="button" onClick={beginCreate}>
            {T.ADD}
          </Button>
        }
      />
      {!isFormOpen && errorMessage && <Alert tone="error">{errorMessage}</Alert>}
      <CollapsibleSection
        title={T.OVERVIEW_TITLE}
        subtitle={T.OVERVIEW_SUBTITLE}
        contentClassName="grid gap-4 sm:grid-cols-3"
      >
        <StatCard label={T.TOTAL} value={String(plans.length)} accent="blue" />
        <StatCard label={T.ACTIVE} value={String(activeCount)} accent="mint" />
        <StatCard
          label={T.DRAFT}
          value={String(plans.filter((plan) => plan.status === "DRAFT").length)}
          accent="cream"
        />
      </CollapsibleSection>
      <Modal
        open={isFormOpen}
        onClose={resetForm}
        title={editing ? T.EDIT_TITLE : T.CREATE_TITLE}
        size="lg"
        footer={
          <>
            <Button type="button" variant="secondary" onClick={resetForm}>
              {T.CANCEL}
            </Button>
            <Button
              type="submit"
              form={PLAN_FORM_ID}
              isLoading={createPlan.isPending || updatePlan.isPending}
            >
              {editing ? T.SAVE_CHANGES : T.CREATE_DRAFT}
            </Button>
          </>
        }
      >
        <form
          id={PLAN_FORM_ID}
          className="flex flex-col gap-6"
          onSubmit={(event) => void save(event)}
        >
          {errorMessage && <Alert tone="error">{errorMessage}</Alert>}
          <section className="flex flex-col gap-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              {T.SECTION_GENERAL}
            </h3>
            <Input
              id="plan-name"
              label={T.PLAN_NAME}
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              required
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                id="plan-type"
                label={T.PLAN_TYPE}
                options={[
                  { label: T.EXAM_PACKAGE, value: "EXAM_PACKAGE" },
                  { label: T.STUDENT_CAPACITY, value: "STUDENT_CAPACITY" },
                ]}
                value={formType}
                onChange={(event) => {
                  const nextType = event.target.value as PlanType;
                  setFormType(nextType);
                  setForm({ ...form, type: nextType });
                }}
              />
              <Input
                id="plan-description"
                label={T.DESCRIPTION}
                value={form.description ?? ""}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
              />
            </div>
          </section>

          <section className="flex flex-col gap-4 border-t border-gray-100 pt-6">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              {T.SECTION_PRICING}
            </h3>
            <p className="-mt-2 text-xs text-gray-500">{T.FORM_SUBTITLE}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                id="plan-price"
                label={T.PRICE}
                helperText={T.PRICE_HELPER}
                type="number"
                min="0.01"
                step="0.01"
                value={form.price}
                onChange={(event) => setForm({ ...form, price: event.target.value })}
                required
              />
              <Input
                id="plan-currency"
                label={T.CURRENCY}
                maxLength={3}
                value={form.currency}
                onChange={(event) =>
                  setForm({ ...form, currency: event.target.value.toUpperCase() })
                }
                required
              />
            </div>
            {formType === "EXAM_PACKAGE" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  id="plan-duration"
                  label={T.DURATION}
                  type="number"
                  min="1"
                  max={MAX_INT_FIELD_VALUE}
                  value={form.durationDays ?? ""}
                  onChange={(event) =>
                    setForm({ ...form, durationDays: clampToIntField(event.target.value) })
                  }
                />
                <Input
                  id="plan-max-students"
                  label={T.STUDENTS_PER_SESSION}
                  helperText={T.MAX_STUDENT_COUNT_HELPER}
                  type="number"
                  min="1"
                  max={MAX_STUDENT_COUNT}
                  value={form.maxStudentsPerSession ?? ""}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      maxStudentsPerSession: clampToIntField(event.target.value, MAX_STUDENT_COUNT),
                    })
                  }
                />
              </div>
            ) : (
              <Input
                id="plan-extra-slots"
                label={T.EXTRA_STUDENT_SLOTS}
                helperText={T.MAX_STUDENT_COUNT_HELPER}
                type="number"
                min="1"
                max={MAX_STUDENT_COUNT}
                value={form.extraStudentSlots ?? ""}
                onChange={(event) =>
                  setForm({
                    ...form,
                    extraStudentSlots: clampToIntField(event.target.value, MAX_STUDENT_COUNT),
                  })
                }
              />
            )}
          </section>
        </form>
      </Modal>
      <CommercialPanel
        title={T.CATALOG_TITLE}
        subtitle={T.CATALOG_SUBTITLE}
        actions={
          <Select
            id="catalog-type"
            aria-label={T.FILTER_ARIA_LABEL}
            options={[
              { label: T.ALL, value: "ALL" },
              { label: T.EXAM_PACKAGE, value: "EXAM_PACKAGE" },
              { label: T.CAPACITY_ADD_ONS, value: "STUDENT_CAPACITY" },
            ]}
            value={catalogFilter}
            onChange={(event) => setCatalogFilter(event.target.value as CatalogFilter)}
          />
        }
      >
        <DataTable
          columns={[
            {
              key: "name",
              header: T.TABLE_PLAN,
              cell: (row: PlanResponse) => (
                <div>
                  <p className="font-medium text-slate-900">{row.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{row.description || T.EMPTY_VALUE}</p>
                </div>
              ),
            },
            {
              key: "price",
              header: T.TABLE_PRICE,
              cell: (row: PlanResponse) => (
                <span className="font-semibold">{formatMoney(row)}</span>
              ),
            },
            {
              key: "term",
              header: T.TABLE_TERM,
              cell: (row: PlanResponse) =>
                row.durationDays ? T.DAYS(row.durationDays) : T.PERMANENT,
            },
            {
              key: "capacity",
              header: T.TABLE_CAPACITY,
              cell: (row: PlanResponse) =>
                row.type === "EXAM_PACKAGE"
                  ? T.SESSION_CAPACITY(row.maxStudentsPerSession ?? T.EMPTY_VALUE)
                  : T.EXTRA_STUDENTS(row.extraStudentSlots ?? T.EMPTY_VALUE),
            },
            {
              key: "status",
              header: T.TABLE_STATUS,
              cell: (row: PlanResponse) => <CommercialStatusBadge status={row.status} />,
            },
          ]}
          rows={visiblePlans}
          getRowKey={(row) => row.publicId}
          rowActions={(row) =>
            row.status === "ARCHIVED" ? null : (
              <ActionMenu
                items={[
                  {
                    label: T.EDIT,
                    icon: PencilIcon,
                    onSelect: () => beginEdit(row),
                  },
                  {
                    label: row.status === "DRAFT" ? T.ACTIVATE : T.ARCHIVE,
                    icon: CheckCircleIcon,
                    onSelect: () => void transition(row),
                  },
                ]}
              />
            )
          }
          rowActionsHeader=""
          emptyTitle={isLoading ? T.LOADING : T.EMPTY}
        />
      </CommercialPanel>
      <ConfirmDialog
        open={planToArchive !== null}
        title={T.ARCHIVE_CONFIRM_TITLE}
        description={T.ARCHIVE_CONFIRM_DESCRIPTION}
        confirmLabel={T.ARCHIVE_CONFIRM_BUTTON}
        tone="danger"
        isConfirming={archivePlan.isPending}
        onConfirm={() => void confirmArchive()}
        onClose={() => setPlanToArchive(null)}
      />
    </div>
  );
};
