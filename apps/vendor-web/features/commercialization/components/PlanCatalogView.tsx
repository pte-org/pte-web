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
    ? getUserFacingApiErrorMessage(error, "Plans could not be loaded or saved.")
    : isError
      ? "Plans could not be loaded or saved."
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
      setMessage("Plan updated.");
    } else {
      await createPlan.mutateAsync(payload);
      setMessage("Plan draft created.");
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
        title="Plan catalog"
        subtitle="Configure packages available to approved tenants."
        actions={
          !isFormOpen && (
            <Button type="button" onClick={beginCreate}>
              + Add plan
            </Button>
          )
        }
      />
      {errorMessage && <Alert tone="error">{errorMessage}</Alert>}
      {message && <Alert tone="success">{message}</Alert>}
      <CollapsibleSection
        title="Plan overview"
        subtitle="Catalog status at a glance."
        contentClassName="grid gap-4 sm:grid-cols-3"
      >
        <StatCard label="Total plans" value={String(plans.length)} accent="blue" />
        <StatCard label="Active plans" value={String(activeCount)} accent="mint" />
        <StatCard
          label="Draft plans"
          value={String(plans.filter((plan) => plan.status === "DRAFT").length)}
          accent="cream"
        />
      </CollapsibleSection>
      {isFormOpen && (
        <CommercialPanel
          title={editing ? "Edit plan" : "Create plan"}
          subtitle="Only ACTIVE plans are visible to tenants."
        >
          <form className="grid gap-4 md:grid-cols-2" onSubmit={(event) => void save(event)}>
            <Input
              id="plan-name"
              label="Plan name"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              required
            />
            <Select
              id="plan-type"
              label="Plan type"
              options={[
                { label: "Exam package", value: "EXAM_PACKAGE" },
                { label: "Student capacity", value: "STUDENT_CAPACITY" },
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
              label="Description"
              value={form.description ?? ""}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                id="plan-price"
                label="Price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(event) => setForm({ ...form, price: event.target.value })}
                required
              />
              <Input
                id="plan-currency"
                label="Currency"
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
                  label="Duration (days)"
                  type="number"
                  min="1"
                  value={form.durationDays ?? ""}
                  onChange={(event) =>
                    setForm({ ...form, durationDays: Number(event.target.value) || null })
                  }
                />
                <Input
                  id="plan-max-students"
                  label="Students per session"
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
                label="Extra student slots"
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
                {editing ? "Save changes" : "Create draft"}
              </Button>
              <Button type="button" variant="secondary" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </CommercialPanel>
      )}
      <CommercialPanel
        title="Published catalog"
        subtitle="Separate exam access from permanent student capacity."
        actions={
          <Select
            id="catalog-type"
            aria-label="Filter plans by type"
            options={[
              { label: "All", value: "ALL" },
              { label: "Exam packages", value: "EXAM_PACKAGE" },
              { label: "Capacity add-ons", value: "STUDENT_CAPACITY" },
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
              header: "Plan",
              cell: (row: PlanResponse) => (
                <div>
                  <p className="font-medium text-slate-900">{row.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{row.description || "—"}</p>
                </div>
              ),
            },
            {
              key: "price",
              header: "Price",
              cell: (row: PlanResponse) => (
                <span className="font-semibold">{formatMoney(row)}</span>
              ),
            },
            {
              key: "term",
              header: "Term",
              cell: (row: PlanResponse) =>
                row.durationDays ? `${row.durationDays} days` : "Permanent",
            },
            {
              key: "capacity",
              header: "Capacity",
              cell: (row: PlanResponse) =>
                row.type === "EXAM_PACKAGE"
                  ? `${row.maxStudentsPerSession ?? "—"} / session`
                  : `+${row.extraStudentSlots ?? "—"} students`,
            },
            {
              key: "status",
              header: "Status",
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
                    label: "Edit",
                    icon: PencilIcon,
                    onSelect: () => beginEdit(row),
                  },
                  {
                    label: row.status === "DRAFT" ? "Activate" : "Archive",
                    icon: CheckCircleIcon,
                    onSelect: () => void transition(row),
                  },
                ]}
              />
            )
          }
          rowActionsHeader=""
          emptyTitle={isLoading ? "Loading plans..." : "No plans found"}
        />
      </CommercialPanel>
    </div>
  );
};
