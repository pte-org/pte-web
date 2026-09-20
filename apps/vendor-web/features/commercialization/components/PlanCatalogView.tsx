"use client";

import { useMemo, useState, type FormEvent, type ReactElement } from "react";
import {
  Alert,
  ActionMenu,
  Button,
  CollapsibleSection,
  DataTable,
  Input,
  PageHeader,
  Select,
  StatCard,
  CheckCircleIcon,
  PencilIcon,
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

type CatalogFilter = PlanType | "ALL";

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
  const [message, setMessage] = useState("");
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
    setMessage("");
    setIsFormOpen(true);
  };

  const save = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setMessage("");
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
      setMessage(T.UPDATED);
    } else {
      await createPlan.mutateAsync(payload);
      setMessage(T.CREATED);
    }
    resetForm();
  };

  const transition = async (plan: PlanResponse): Promise<void> => {
    if (plan.status === "DRAFT") await activatePlan.mutateAsync(plan.publicId);
    if (plan.status === "ACTIVE") await archivePlan.mutateAsync(plan.publicId);
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={T.TITLE}
        subtitle={T.SUBTITLE}
        actions={
          !isFormOpen && (
            <Button type="button" onClick={beginCreate}>
              {T.ADD}
            </Button>
          )
        }
      />
      {errorMessage && <Alert tone="error">{errorMessage}</Alert>}
      {message && <Alert tone="success">{message}</Alert>}
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
      {isFormOpen && (
        <CommercialPanel
          title={editing ? T.EDIT_TITLE : T.CREATE_TITLE}
          subtitle={T.FORM_SUBTITLE}
        >
          <form className="grid gap-4 md:grid-cols-2" onSubmit={(event) => void save(event)}>
            <Input
              id="plan-name"
              label={T.PLAN_NAME}
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              required
            />
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
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                id="plan-price"
                label={T.PRICE}
                type="number"
                min="0"
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
                  value={form.durationDays ?? ""}
                  onChange={(event) =>
                    setForm({ ...form, durationDays: Number(event.target.value) || null })
                  }
                />
                <Input
                  id="plan-max-students"
                  label={T.STUDENTS_PER_SESSION}
                  type="number"
                  min="1"
                  value={form.maxStudentsPerSession ?? ""}
                  onChange={(event) =>
                    setForm({ ...form, maxStudentsPerSession: Number(event.target.value) || null })
                  }
                />
              </div>
            ) : (
              <Input
                id="plan-extra-slots"
                label={T.EXTRA_STUDENT_SLOTS}
                type="number"
                min="1"
                value={form.extraStudentSlots ?? ""}
                onChange={(event) =>
                  setForm({ ...form, extraStudentSlots: Number(event.target.value) || null })
                }
              />
            )}
            <div className="flex items-end gap-2">
              <Button type="submit" isLoading={createPlan.isPending || updatePlan.isPending}>
                {editing ? T.SAVE_CHANGES : T.CREATE_DRAFT}
              </Button>
              <Button type="button" variant="secondary" onClick={resetForm}>
                {T.CANCEL}
              </Button>
            </div>
          </form>
        </CommercialPanel>
      )}
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
    </div>
  );
};
