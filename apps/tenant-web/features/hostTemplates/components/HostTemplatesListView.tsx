"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import type { ScoreTemplateResponse } from "@pte/api-client";
import {
  Alert,
  ActionMenu,
  Badge,
  Chip,
  Button,
  CheckCircleIcon,
  ConfirmDialog,
  CopyIcon,
  DataTable,
  EyeIcon,
  Input,
  Modal,
  PageHeader,
  TrashIcon,
  BanIcon,
  type ActionMenuItem,
  type BadgeVariant,
} from "@pte/ui";
import { errorMessage } from "@/features/examoperations/errorMessage";
import { useActiveScoreTemplate } from "@/features/exams/api";
import {
  useActivateHostTemplate,
  useCloneHostTemplate,
  useCreateHostTemplate,
  useDeleteHostTemplate,
  useHostTemplates,
  useRetireHostTemplate,
} from "../api";
import { HOST_TEMPLATES_ROUTE } from "../constants";
import { useListText } from "../hooks/useTemplateText";
import { templateActionError } from "../utils/actionError";

type TemplateRow = { template: ScoreTemplateResponse; isDefault: boolean };
type PendingAction = { kind: "delete" | "retire" | "activate"; template: ScoreTemplateResponse };

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  DRAFT: "neutral",
  ACTIVE: "success",
  RETIRED: "warning",
  PENDING_APPROVAL: "info",
};

export const HostTemplatesListView = (): ReactElement => {
  const text = useListText();
  const router = useRouter();
  const { data: templates, isLoading, error } = useHostTemplates();
  const { data: defaultTemplate } = useActiveScoreTemplate();
  const create = useCreateHostTemplate();
  const clone = useCloneHostTemplate();
  const activate = useActivateHostTemplate();
  const retire = useRetireHostTemplate();
  const remove = useDeleteHostTemplate();

  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [pending, setPending] = useState<PendingAction | null>(null);

  const statusLabels: Record<string, string> = {
    DRAFT: text.STATUS_DRAFT,
    ACTIVE: text.STATUS_ACTIVE,
    RETIRED: text.STATUS_RETIRED,
    PENDING_APPROVAL: text.STATUS_PENDING_APPROVAL,
  };
  const statusFilterOptions = [
    { value: "", label: text.STATUS_FILTER_ALL },
    ...Object.entries(statusLabels).map(([value, label]) => ({ value, label })),
  ];
  const rows: TemplateRow[] = [
    ...(defaultTemplate ? [{ template: defaultTemplate, isDefault: true }] : []),
    ...(templates ?? []).map((template) => ({ template, isDefault: false })),
  ];
  const openRow = (row: TemplateRow): void =>
    router.push(`${HOST_TEMPLATES_ROUTE}/${row.template.publicId}`);
  const buildActions = ({ template, isDefault }: TemplateRow): ActionMenuItem[] => {
    const actions: ActionMenuItem[] = [
      { label: text.OPEN, icon: EyeIcon, onSelect: () => openRow({ template, isDefault }) },
    ];
    if (isDefault) return actions;
    actions.push({
      label: text.CLONE,
      icon: CopyIcon,
      disabled: clone.isPending,
      onSelect: () => clone.mutate(template.publicId),
    });
    if (template.status === "DRAFT" || template.status === "RETIRED") {
      actions.push({
        label: text.ACTIVATE,
        icon: CheckCircleIcon,
        onSelect: () => setPending({ kind: "activate", template }),
      });
    }
    if (template.status === "ACTIVE") {
      actions.push({
        label: text.RETIRE,
        icon: BanIcon,
        danger: true,
        onSelect: () => setPending({ kind: "retire", template }),
      });
    }
    if (template.status === "DRAFT") {
      actions.push({
        label: text.DELETE,
        icon: TrashIcon,
        danger: true,
        onSelect: () => setPending({ kind: "delete", template }),
      });
    }
    return actions;
  };
  const actionError = [clone.error, activate.error, retire.error, remove.error]
    .map((error) => templateActionError(error, text))
    .find(Boolean);

  const closeCreate = (): void => {
    setCreateOpen(false);
    setName("");
    create.reset();
  };

  const handleCreate = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!name.trim()) return;
    create.mutate(name.trim(), {
      onSuccess: (created) => router.push(`${HOST_TEMPLATES_ROUTE}/${created.publicId}`),
    });
  };

  const confirmPending = (): void => {
    if (!pending) return;
    const mutation =
      pending.kind === "delete" ? remove : pending.kind === "retire" ? retire : activate;
    mutation.mutate(pending.template.publicId, { onSettled: () => setPending(null) });
  };

  const dialog = {
    delete: [text.CONFIRM_DELETE_TITLE, text.CONFIRM_DELETE_TEXT, text.DELETE],
    retire: [text.CONFIRM_RETIRE_TITLE, text.CONFIRM_RETIRE_TEXT, text.RETIRE],
    activate: [text.CONFIRM_ACTIVATE_TITLE, text.CONFIRM_ACTIVATE_TEXT, text.ACTIVATE],
  } as const;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title={text.TITLE} />

      {Boolean(error) && <Alert tone="error">{errorMessage(error, text.LOAD_FAILED)}</Alert>}
      {actionError && <Alert tone="error">{actionError}</Alert>}

      <DataTable
        searchPlaceholder={text.SEARCH_PLACEHOLDER}
        searchAriaLabel={text.SEARCH_PLACEHOLDER}
        columns={[
          {
            key: "name",
            label: text.COL_NAME,
            header: text.COL_NAME,
            filterAccessor: (row: TemplateRow) => row.template.name,
            cell: (row: TemplateRow) => (
              <div className="min-w-0">
                <span className="font-medium">{row.template.name}</span>
                {row.isDefault && (
                  <p className="mt-0.5 text-xs text-[var(--ink-muted)]">{text.DEFAULT_HINT}</p>
                )}
                {!row.isDefault && typeof row.template.pearsonStandard === "boolean" && (
                  <span
                    className="mt-1 block"
                    title={
                      row.template.pearsonStandard
                        ? undefined
                        : text.CUSTOMISED_HINT.replace(
                            "{reasons}",
                            (row.template.standardDeviations ?? []).join(", "),
                          )
                    }
                  >
                    <Chip tone={row.template.pearsonStandard ? "mint" : "cream"} size="sm">
                      {row.template.pearsonStandard ? text.STANDARD_BADGE : text.CUSTOMISED_BADGE}
                    </Chip>
                  </span>
                )}
              </div>
            ),
          },
          {
            key: "status",
            label: text.COL_STATUS,
            header: text.COL_STATUS,
            filterOptions: statusFilterOptions,
            filterAccessor: (row: TemplateRow) => (row.isDefault ? "DEFAULT" : row.template.status),
            cell: (row: TemplateRow) =>
              row.isDefault ? (
                <Badge variant="info">{text.DEFAULT_BADGE}</Badge>
              ) : (
                <Badge variant={STATUS_VARIANT[row.template.status] ?? "neutral"}>
                  {statusLabels[row.template.status] ?? row.template.status}
                </Badge>
              ),
          },
          {
            key: "tasks",
            label: text.COL_TASKS,
            header: text.COL_TASKS,
            filterAccessor: (row: TemplateRow) => row.template.items.length,
            cell: (row: TemplateRow) => row.template.items.length,
          },
        ]}
        rows={rows}
        getRowKey={(row) => row.template.publicId}
        isLoading={isLoading}
        emptyTitle={text.EMPTY_TITLE}
        toolbarActions={<Button onClick={() => setCreateOpen(true)}>{text.CREATE}</Button>}
        tableClassName="min-w-[640px]"
        rowActionsHeader={text.COL_ACTIONS}
        rowActions={(row) =>
          row.isDefault ? (
            <Button
              size="sm"
              variant="primary"
              appearance="ghost"
              iconOnly
              aria-label={text.OPEN}
              title={text.OPEN}
              onClick={() => openRow(row)}
            >
              <EyeIcon className="h-4 w-4" />
            </Button>
          ) : (
            <ActionMenu items={buildActions(row)} />
          )
        }
      />

      <Modal
        open={createOpen}
        onClose={closeCreate}
        title={text.CREATE_TITLE}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={closeCreate}>
              {text.CANCEL}
            </Button>
            <Button
              type="submit"
              form="create-host-template-form"
              disabled={!name.trim() || create.isPending}
            >
              {text.CREATE_SUBMIT}
            </Button>
          </>
        }
      >
        <form
          id="create-host-template-form"
          onSubmit={handleCreate}
          className="flex flex-col gap-3"
        >
          <p className="text-sm text-[var(--ink-secondary)]">{text.CREATE_HINT}</p>
          <Input
            label={text.NAME_LABEL}
            placeholder={text.NAME_PLACEHOLDER}
            value={name}
            maxLength={200}
            autoFocus
            onChange={(event) => setName(event.target.value)}
          />
          {Boolean(create.error) && <Alert tone="error">{errorMessage(create.error)}</Alert>}
        </form>
      </Modal>

      {pending && (
        <ConfirmDialog
          open
          title={dialog[pending.kind][0]}
          description={dialog[pending.kind][1]}
          confirmLabel={dialog[pending.kind][2]}
          cancelLabel={text.CANCEL}
          tone={pending.kind === "activate" ? "primary" : "danger"}
          isConfirming={activate.isPending || retire.isPending || remove.isPending}
          onConfirm={confirmPending}
          onClose={() => setPending(null)}
        />
      )}
    </div>
  );
};
