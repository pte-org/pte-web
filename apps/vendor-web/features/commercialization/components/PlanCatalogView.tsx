"use client";

import { useMemo, useState, type FormEvent, type ReactElement } from "react";
import {
  Alert,
  ActionMenu,
  Button,
  ConfirmDialog,
  DataTable,
  Input,
  Modal,
  PageHeader,
  Select,
  StatCard,
  CheckCircleIcon,
  PencilIcon,
  TrashIcon,
  useToast,
} from "@pte/ui";
import {
  ApiError,
  getUserFacingApiErrorMessage,
  type PlanRequest,
  type PlanResponse,
  type PlanType,
  type PlanUpdateRequest,
} from "@pte/api-client";
import {
  useActivatePlan,
  useArchivePlan,
  useDeletePlan,
  useCreatePlan,
  usePlansQuery,
  useUpdatePlan,
} from "../api";
import { PLAN_CATALOG_TEXT as T } from "../constants";
import { CommercialPanel } from "./CommercialPanel";
import { CommercialStatusBadge } from "./CommercialStatusBadge";

type PlanFormState = {
  name: string;
  description: string;
  type: PlanType;
  price: string;
  currency: string;
  durationDays: string;
  maxStudentsPerSession: string;
  extraStudentSlots: string;
};

type PlanFormErrors = Partial<Record<keyof PlanFormState, string>>;
type PlanAction = "create" | "update" | "activate" | "archive" | "delete" | null;

const INITIAL_FORM: PlanFormState = {
  name: "",
  description: "",
  type: "EXAM_PACKAGE",
  price: "0",
  currency: "VND",
  durationDays: "30",
  maxStudentsPerSession: "500",
  extraStudentSlots: "",
};

const MAX_STUDENT_COUNT = 2_000;
const MAX_EXAM_DURATION_DAYS = 3_650;

const formatMoney = (plan: PlanResponse): string => {
  const [integerPart, fractionPart] = String(plan.price).split(".");
  const groupedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${groupedInteger}${fractionPart ? `.${fractionPart}` : ""} ${plan.currency}`;
};

const formFromPlan = (plan: PlanResponse): PlanFormState => ({
  name: plan.name,
  description: plan.description ?? "",
  type: plan.type,
  price: String(plan.price),
  currency: plan.currency,
  durationDays: plan.durationDays === null ? "" : String(plan.durationDays),
  maxStudentsPerSession:
    plan.maxStudentsPerSession === null ? "" : String(plan.maxStudentsPerSession),
  extraStudentSlots: plan.extraStudentSlots === null ? "" : String(plan.extraStudentSlots),
});

const hasVersion = (plan: PlanResponse): boolean =>
  Number.isInteger(plan.version) && plan.version >= 0;

const isVersionConflict = (error: unknown): boolean =>
  error instanceof ApiError && error.kind === "conflict" && error.code === "PLAN_VERSION_CONFLICT";

const parseIntegerField = (raw: string, max: number): number | null => {
  const value = raw.trim();
  if (!/^\d+$/.test(value) || value.length > String(max).length) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed >= 1 && parsed <= max ? parsed : null;
};

const validateForm = (form: PlanFormState): PlanFormErrors => {
  const errors: PlanFormErrors = {};
  const name = form.name.trim();
  const description = form.description.trim();
  const price = form.price.trim();
  const currency = form.currency.trim().toUpperCase();

  if (!name) errors.name = "Plan name is required.";
  else if (name.length > 255) errors.name = T.NAME_MAX_ERROR;
  if (description.length > 255) errors.description = T.DESCRIPTION_MAX_ERROR;
  if (!/^\d+(\.\d{0,2})?$/.test(price)) {
    errors.price = T.PRICE_ERROR;
  } else {
    const [integerPart, fractionPart = ""] = price.split(".");
    const significantInteger = integerPart.replace(/^0+/, "") || "0";
    if (significantInteger.length > 17 || fractionPart.length > 2) errors.price = T.PRICE_ERROR;
  }
  if (currency !== "VND") errors.currency = T.CURRENCY_HELPER;

  if (form.type === "EXAM_PACKAGE") {
    if (parseIntegerField(form.durationDays, MAX_EXAM_DURATION_DAYS) === null) {
      errors.durationDays = T.INTEGER_ERROR(MAX_EXAM_DURATION_DAYS);
    }
    if (parseIntegerField(form.maxStudentsPerSession, MAX_STUDENT_COUNT) === null) {
      errors.maxStudentsPerSession = T.INTEGER_ERROR(MAX_STUDENT_COUNT);
    }
  } else if (parseIntegerField(form.extraStudentSlots, MAX_STUDENT_COUNT) === null) {
    errors.extraStudentSlots = T.INTEGER_ERROR(MAX_STUDENT_COUNT);
  }

  return errors;
};

const toPayload = (form: PlanFormState): PlanRequest => ({
  name: form.name.trim(),
  description: form.description.trim() || undefined,
  type: form.type,
  price: form.price.trim(),
  currency: form.currency.trim().toUpperCase(),
  durationDays:
    form.type === "EXAM_PACKAGE" ? parseIntegerField(form.durationDays, MAX_EXAM_DURATION_DAYS) : null,
  maxStudentsPerSession:
    form.type === "EXAM_PACKAGE"
      ? parseIntegerField(form.maxStudentsPerSession, MAX_STUDENT_COUNT)
      : null,
  extraStudentSlots:
    form.type === "STUDENT_CAPACITY" ? parseIntegerField(form.extraStudentSlots, MAX_STUDENT_COUNT) : null,
});

const serverSummary = (plan: PlanResponse): ReactElement => (
  <dl className="mt-3 grid gap-x-4 gap-y-1 text-xs text-slate-700 sm:grid-cols-2">
    <div>
      <dt className="text-slate-500">{T.PLAN_NAME}</dt>
      <dd className="font-medium">{plan.name}</dd>
    </div>
    <div>
      <dt className="text-slate-500">{T.PRICE}</dt>
      <dd className="font-medium">{formatMoney(plan)}</dd>
    </div>
    <div>
      <dt className="text-slate-500">{T.TABLE_STATUS}</dt>
      <dd className="font-medium">{plan.status}</dd>
    </div>
    <div>
      <dt className="text-slate-500">{T.VERSION_LABEL}</dt>
      <dd className="font-medium">{plan.version}</dd>
    </div>
  </dl>
);

type CatalogFilter = PlanType | "ALL";
const PLAN_FORM_ID = "plan-catalog-form";

export const PlanCatalogView = (): ReactElement => {
  const { data: plans = [], isLoading, isError } = usePlansQuery();
  const createPlan = useCreatePlan();
  const updatePlan = useUpdatePlan();
  const activatePlan = useActivatePlan();
  const archivePlan = useArchivePlan();
  const deletePlan = useDeletePlan();
  const [catalogFilter, setCatalogFilter] = useState<CatalogFilter>("ALL");
  const [form, setForm] = useState<PlanFormState>({ ...INITIAL_FORM });
  const [formErrors, setFormErrors] = useState<PlanFormErrors>({});
  const [editing, setEditing] = useState<PlanResponse | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [planToArchive, setPlanToArchive] = useState<PlanResponse | null>(null);
  const [planToDelete, setPlanToDelete] = useState<PlanResponse | null>(null);
  const [lastAction, setLastAction] = useState<PlanAction>(null);
  const [versionConflict, setVersionConflict] = useState(false);
  const isBusy =
    createPlan.isPending ||
    updatePlan.isPending ||
    activatePlan.isPending ||
    archivePlan.isPending ||
    deletePlan.isPending;
  const { showToast } = useToast();
  const visiblePlans = useMemo(
    () => (catalogFilter === "ALL" ? plans : plans.filter((plan) => plan.type === catalogFilter)),
    [catalogFilter, plans],
  );
  const activeCount = plans.filter((plan) => plan.status === "ACTIVE").length;
  const latestServerPlan = editing
    ? plans.find((plan) => plan.publicId === editing.publicId) ?? null
    : null;
  const actionError =
    lastAction === "create"
      ? createPlan.error
      : lastAction === "update"
        ? updatePlan.error
        : lastAction === "activate"
          ? activatePlan.error
          : lastAction === "archive"
            ? archivePlan.error
            : lastAction === "delete"
              ? deletePlan.error
              : null;
  const errorMessage = actionError
    ? getUserFacingApiErrorMessage(actionError, T.ERROR)
    : isError
      ? T.ERROR
      : undefined;

  const clearErrors = (): void => {
    createPlan.reset();
    updatePlan.reset();
    activatePlan.reset();
    archivePlan.reset();
    deletePlan.reset();
    setLastAction(null);
    setFormErrors({});
    setVersionConflict(false);
  };

  const beginEdit = (plan: PlanResponse): void => {
    if (isBusy || plan.status === "ARCHIVED" || !hasVersion(plan)) return;
    clearErrors();
    setEditing(plan);
    setIsFormOpen(true);
    setForm(formFromPlan(plan));
  };

  const resetForm = (): void => {
    if (isBusy) return;
    setEditing(null);
    setForm({ ...INITIAL_FORM });
    setFormErrors({});
    setVersionConflict(false);
    setIsFormOpen(false);
  };

  const beginCreate = (): void => {
    if (isBusy) return;
    clearErrors();
    setEditing(null);
    setForm({ ...INITIAL_FORM });
    setIsFormOpen(true);
  };

  const save = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (isBusy) return;
    clearErrors();
    const nextErrors = validateForm(form);
    if (Object.keys(nextErrors).length > 0) {
      setFormErrors(nextErrors);
      return;
    }

    const payload = toPayload(form);
    try {
      if (editing) {
        const updatePayload: PlanUpdateRequest = { ...payload, expectedVersion: editing.version };
        setLastAction("update");
        await updatePlan.mutateAsync({ publicId: editing.publicId, payload: updatePayload });
        showToast(T.UPDATED, { tone: "success" });
      } else {
        setLastAction("create");
        await createPlan.mutateAsync(payload);
        showToast(T.CREATED, { tone: "success" });
      }
      resetForm();
    } catch (error) {
      if (isVersionConflict(error)) setVersionConflict(true);
      showToast(getUserFacingApiErrorMessage(error, T.ERROR), { tone: "error" });
    }
  };

  const transition = async (plan: PlanResponse): Promise<void> => {
    if (isBusy || !hasVersion(plan)) return;
    clearErrors();
    try {
      if (plan.status === "DRAFT") {
        setLastAction("activate");
        await activatePlan.mutateAsync({ publicId: plan.publicId, payload: { expectedVersion: plan.version } });
        showToast(T.ACTIVATED, { tone: "success" });
        return;
      }
      if (plan.canArchive === true) setPlanToArchive(plan);
    } catch (error) {
      showToast(getUserFacingApiErrorMessage(error, T.ERROR), { tone: "error" });
    }
  };

  const confirmArchive = async (): Promise<void> => {
    if (!planToArchive || isBusy || !hasVersion(planToArchive)) return;
    clearErrors();
    setLastAction("archive");
    try {
      await archivePlan.mutateAsync({
        publicId: planToArchive.publicId,
        payload: { expectedVersion: planToArchive.version },
      });
      setPlanToArchive(null);
      showToast(T.ARCHIVED_SUCCESS, { tone: "success" });
    } catch (error) {
      showToast(getUserFacingApiErrorMessage(error, T.ERROR), { tone: "error" });
    }
  };

  const confirmDelete = async (): Promise<void> => {
    if (!planToDelete || isBusy) return;
    clearErrors();
    setLastAction("delete");
    try {
      await deletePlan.mutateAsync(planToDelete.publicId);
      setPlanToDelete(null);
      showToast(T.DELETED_SUCCESS, { tone: "success" });
    } catch (error) {
      showToast(getUserFacingApiErrorMessage(error, T.ERROR), { tone: "error" });
    }
  };

  const reloadServerValues = (): void => {
    if (!latestServerPlan || isBusy) return;
    setEditing(latestServerPlan);
    setForm(formFromPlan(latestServerPlan));
    setFormErrors({});
    setVersionConflict(false);
    updatePlan.reset();
    setLastAction(null);
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={T.TITLE}
        actions={
          <Button type="button" onClick={beginCreate} disabled={isBusy}>
            {T.ADD}
          </Button>
        }
      />
      {!isFormOpen && errorMessage && <Alert tone="error">{errorMessage}</Alert>}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label={T.TOTAL} value={isLoading || isError ? T.EMPTY_VALUE : String(plans.length)} accent="blue" />
        <StatCard label={T.ACTIVE} value={isLoading || isError ? T.EMPTY_VALUE : String(activeCount)} accent="mint" />
        <StatCard
          label={T.DRAFT}
          value={isLoading || isError ? T.EMPTY_VALUE : String(plans.filter((plan) => plan.status === "DRAFT").length)}
          accent="cream"
        />
      </div>
      <Modal
        open={isFormOpen}
        onClose={resetForm}
        isDismissDisabled={isBusy}
        title={editing ? T.EDIT_TITLE : T.CREATE_TITLE}
        size="lg"
        footer={
          <>
            <Button type="button" variant="secondary" onClick={resetForm} disabled={isBusy}>
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
          {versionConflict && (
            <Alert tone="warning" title={T.STALE_VERSION_TITLE}>
              <p>{T.STALE_VERSION_DESCRIPTION}</p>
              {latestServerPlan ? serverSummary(latestServerPlan) : <p className="mt-2">{T.ERROR}</p>}
              <div className="mt-4 flex flex-wrap gap-2">
                <Button type="button" onClick={reloadServerValues} disabled={!latestServerPlan || isBusy}>
                  {T.RELOAD_SERVER}
                </Button>
                <Button type="button" variant="secondary" onClick={() => setVersionConflict(false)} disabled={isBusy}>
                  {T.KEEP_MY_CHANGES}
                </Button>
              </div>
            </Alert>
          )}
          <section className="flex flex-col gap-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              {T.SECTION_GENERAL}
            </h3>
            <Input
              id="plan-name"
              label={T.PLAN_NAME}
              value={form.name}
              error={formErrors.name}
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
                value={form.type}
                disabled={editing?.status === "ACTIVE"}
                onChange={(event) => setForm({ ...form, type: event.target.value as PlanType })}
              />
              <Input
                id="plan-description"
                label={T.DESCRIPTION}
                value={form.description}
                error={formErrors.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
              />
            </div>
          </section>

          <section className="flex flex-col gap-4 border-t border-gray-100 pt-6">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              {T.SECTION_PRICING}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                id="plan-price"
                label={T.PRICE}
                type="text"
                inputMode="decimal"
                value={form.price}
                error={formErrors.price}
                onChange={(event) => setForm({ ...form, price: event.target.value })}
                required
              />
              <Input
                id="plan-currency"
                label={T.CURRENCY}
                helperText={T.CURRENCY_HELPER}
                maxLength={3}
                value={form.currency}
                error={formErrors.currency}
                onChange={(event) => setForm({ ...form, currency: event.target.value.toUpperCase() })}
                required
              />
            </div>
            {form.type === "EXAM_PACKAGE" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  id="plan-duration"
                  label={T.DURATION}
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  value={form.durationDays}
                  error={formErrors.durationDays}
                  onChange={(event) => setForm({ ...form, durationDays: event.target.value })}
                />
                <Input
                  id="plan-max-students"
                  label={T.STUDENTS_PER_SESSION}
                  helperText={T.MAX_STUDENT_COUNT_HELPER}
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  value={form.maxStudentsPerSession}
                  error={formErrors.maxStudentsPerSession}
                  onChange={(event) => setForm({ ...form, maxStudentsPerSession: event.target.value })}
                />
              </div>
            ) : (
              <Input
                id="plan-extra-slots"
                label={T.EXTRA_STUDENT_SLOTS}
                helperText={T.MAX_STUDENT_COUNT_HELPER}
                type="text"
                inputMode="numeric"
                maxLength={4}
                value={form.extraStudentSlots}
                error={formErrors.extraStudentSlots}
                onChange={(event) => setForm({ ...form, extraStudentSlots: event.target.value })}
              />
            )}
          </section>
        </form>
      </Modal>
      <CommercialPanel
        title={T.CATALOG_TITLE}
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
              cell: (row: PlanResponse) => <span className="font-semibold">{formatMoney(row)}</span>,
            },
            {
              key: "term",
              header: T.TABLE_TERM,
              cell: (row: PlanResponse) =>
                row.durationDays !== null ? T.DAYS(row.durationDays) : T.PERMANENT,
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
                    disabled: isBusy || !hasVersion(row),
                  },
                  {
                    label:
                      row.status === "DRAFT"
                        ? T.ACTIVATE
                        : row.canArchive === true
                          ? T.ARCHIVE
                          : row.archiveBlockReason === "PLAN_HAS_OUTSTANDING_CODES"
                            ? T.ARCHIVE_BLOCKED
                            : T.CAPABILITIES_UNAVAILABLE,
                    icon: CheckCircleIcon,
                    onSelect: () => void transition(row),
                    disabled:
                      isBusy ||
                      !hasVersion(row) ||
                      (row.status === "ACTIVE" && row.canArchive !== true),
                  },
                  ...(row.status === "DRAFT"
                    ? [
                        {
                          label:
                            row.canDeleteDraft === true
                              ? T.DELETE_DRAFT
                              : row.deleteBlockReason === "PLAN_HAS_REFERENCES"
                                ? T.DELETE_BLOCKED
                                : T.CAPABILITIES_UNAVAILABLE,
                          icon: TrashIcon,
                          danger: true,
                          disabled: isBusy || row.canDeleteDraft !== true,
                          onSelect: () => {
                            clearErrors();
                            setPlanToDelete(row);
                          },
                        },
                      ]
                    : []),
                ]}
              />
            )
          }
          rowActionsHeader=""
          emptyTitle={isLoading ? T.LOADING : isError ? T.ERROR : T.EMPTY}
        />
      </CommercialPanel>
      <ConfirmDialog
        open={planToArchive !== null}
        title={T.ARCHIVE_CONFIRM_TITLE}
        description={
          <>
            <p>{planToArchive?.name}</p>
            <p>{T.ARCHIVE_CONFIRM_DESCRIPTION}</p>
            {lastAction === "archive" && archivePlan.error && (
              <Alert tone="error">{getUserFacingApiErrorMessage(archivePlan.error, T.ERROR)}</Alert>
            )}
          </>
        }
        confirmLabel={T.ARCHIVE_CONFIRM_BUTTON}
        tone="danger"
        isConfirming={archivePlan.isPending}
        onConfirm={() => void confirmArchive()}
        onClose={() => {
          if (!isBusy) setPlanToArchive(null);
        }}
      />
      <ConfirmDialog
        open={planToDelete !== null}
        title={T.DELETE_CONFIRM_TITLE}
        description={
          <>
            <p>{planToDelete?.name}</p>
            <p>{T.DELETE_CONFIRM_DESCRIPTION}</p>
            {lastAction === "delete" && deletePlan.error && (
              <Alert tone="error">{getUserFacingApiErrorMessage(deletePlan.error, T.ERROR)}</Alert>
            )}
          </>
        }
        confirmLabel={T.DELETE_DRAFT}
        tone="danger"
        isConfirming={deletePlan.isPending}
        onConfirm={() => void confirmDelete()}
        onClose={() => {
          if (!isBusy) setPlanToDelete(null);
        }}
      />
    </div>
  );
};
