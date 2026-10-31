"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ScoreTemplateResponse } from "@pte/api-client";
import {
  Alert,
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  Input,
  LoadingState,
  Modal,
  PageHeader,
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
      <PageHeader
        title={text.TITLE}
        actions={<Button onClick={() => setCreateOpen(true)}>+ {text.CREATE}</Button>}
      />

      {Boolean(error) && <Alert tone="error">{errorMessage(error, text.LOAD_FAILED)}</Alert>}
      {actionError && <Alert tone="error">{actionError}</Alert>}

      {isLoading ? (
        <LoadingState rows={3} />
      ) : !defaultTemplate && (!templates || templates.length === 0) ? (
        <EmptyState title={text.EMPTY_TITLE} description={text.EMPTY_TEXT} />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[var(--shell-border)] bg-[var(--surface-card)]">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-[var(--shell-border)] text-xs uppercase text-[var(--ink-muted)]">
              <tr>
                <th className="px-4 py-2">{text.COL_NAME}</th>
                <th className="px-4 py-2">{text.COL_STATUS}</th>
                <th className="px-4 py-2">{text.COL_TASKS}</th>
                <th className="px-4 py-2 text-right">{text.COL_ACTIONS}</th>
              </tr>
            </thead>
            <tbody>
              {defaultTemplate && (
                <tr className="border-b border-[var(--shell-border)]">
                  <td className="px-4 py-3">
                    <Link
                      href={`${HOST_TEMPLATES_ROUTE}/${defaultTemplate.publicId}`}
                      className="font-medium text-[var(--action)] hover:underline"
                    >
                      {defaultTemplate.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-[var(--ink-muted)]">{text.DEFAULT_HINT}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="info">{text.DEFAULT_BADGE}</Badge>
                  </td>
                  <td className="px-4 py-3 text-[var(--ink-secondary)]">
                    {defaultTemplate.items.length}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-1">
                      <Button
                        size="sm"
                        variant="secondary"
                        appearance="ghost"
                        onClick={() =>
                          router.push(`${HOST_TEMPLATES_ROUTE}/${defaultTemplate.publicId}`)
                        }
                      >
                        {text.OPEN}
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
              {(templates ?? []).map((template) => (
                <tr
                  key={template.publicId}
                  className="border-b border-[var(--shell-border)] last:border-0"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`${HOST_TEMPLATES_ROUTE}/${template.publicId}`}
                      className="font-medium text-[var(--action)] hover:underline"
                    >
                      {template.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANT[template.status] ?? "neutral"}>
                      {statusLabels[template.status] ?? template.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-[var(--ink-secondary)]">{template.items.length}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-1">
                      <Button
                        size="sm"
                        variant="secondary"
                        appearance="ghost"
                        onClick={() => router.push(`${HOST_TEMPLATES_ROUTE}/${template.publicId}`)}
                      >
                        {text.OPEN}
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        appearance="ghost"
                        disabled={clone.isPending}
                        onClick={() => clone.mutate(template.publicId)}
                      >
                        {text.CLONE}
                      </Button>
                      {template.status === "DRAFT" && (
                        <Button
                          size="sm"
                          variant="primary"
                          appearance="ghost"
                          onClick={() => setPending({ kind: "activate", template })}
                        >
                          {text.ACTIVATE}
                        </Button>
                      )}
                      {template.status === "ACTIVE" && (
                        <Button
                          size="sm"
                          variant="danger"
                          appearance="ghost"
                          onClick={() => setPending({ kind: "retire", template })}
                        >
                          {text.RETIRE}
                        </Button>
                      )}
                      {template.status === "DRAFT" && (
                        <Button
                          size="sm"
                          variant="danger"
                          appearance="ghost"
                          onClick={() => setPending({ kind: "delete", template })}
                        >
                          {text.DELETE}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
        <form id="create-host-template-form" onSubmit={handleCreate} className="flex flex-col gap-3">
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
