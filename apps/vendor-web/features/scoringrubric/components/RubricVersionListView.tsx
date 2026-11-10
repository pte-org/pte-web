"use client";
import { useState, type ReactElement } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ActionMenu, Badge, Button, CheckCircleIcon, ConfirmDialog, CopyIcon, DashboardCard, DataTable, ErrorState, EyeIcon, PencilIcon, TrashIcon, UploadIcon,
  useDashboardBreadcrumbLabel, useLocale, type ActionMenuItem, type DataTableColumn,
} from "@pte/ui";
import type { RubricVersionResponse } from "@pte/api-client";
import { useCurrentUser } from "@/features/auth/api";
import { useRubricTaskTypes, useRubricVersions } from "../api";
import { useCloneRubricVersion, useCreateRubricVersion, useRubricVersionStatusById } from "../versionApi";
import { RUBRIC_EDIT_TEXT, versionDetailHref, versionEditHref } from "../versionConstants";
import { versionRowActions, type VersionRowAction } from "../versionRowActions";
import { STATUS_VARIANTS, statusLabel, statusVariant } from "../versionStatus";
import { parametersFromRubrics, versionActions } from "../versionEditing";

const DATE_OPTIONS: Intl.DateTimeFormatOptions = { dateStyle: "medium", timeStyle: "short" };

/** When the version last changed; a version without it (an older answer) falls back to its newest milestone. */
const lastChange = (version: RubricVersionResponse): string | null =>
  version.updatedAt ?? version.activatedAt ?? version.retiredAt ?? version.decidedAt ?? version.submittedAt ?? version.createdAt ?? null;

/** Every version of the rubric; each row has the same kind of menu as the template list. */
export const RubricVersionListView = (): ReactElement => {
  const { locale } = useLocale();
  const T = RUBRIC_EDIT_TEXT[locale === "vi" ? "vi" : "en"];
  const router = useRouter();
  useDashboardBreadcrumbLabel(usePathname(), T.title);
  const current = useCurrentUser();
  const versions = useRubricVersions();
  const active = useRubricTaskTypes();
  const create = useCreateRubricVersion();
  const clone = useCloneRubricVersion();
  const statusChange = useRubricVersionStatusById();
  const [discarding, setDiscarding] = useState<RubricVersionResponse | null>(null);
  const roles = current.data?.roles ?? [];
  const mayEdit = versionActions("DRAFT", roles, false).edit;

  const createDraft = (): void => {
    if (!active.data) return;
    create.mutate({ parameters: parametersFromRubrics(active.data) }, { onSuccess: (created) => router.push(versionEditHref(created.publicId)) });
  };
  const columns: DataTableColumn<RubricVersionResponse>[] = [
    { key: "version", label: T.version, header: T.version, filterAccessor: (version) => `v${version.versionNo}`,
      cell: (version) => <span className="font-medium">{`v${version.versionNo}`}</span> },
    { key: "status", label: T.status, header: T.status, filterOptions: [{ value: "", label: T.allStatuses },
        ...Object.keys(STATUS_VARIANTS).map((status) => ({ value: status, label: statusLabel(status, T) }))],
      filterAccessor: (version) => version.status,
      cell: (version) => <Badge variant={statusVariant(version.status)}>{statusLabel(version.status, T)}</Badge> },
    { key: "updatedBy", label: T.updatedBy, header: T.updatedBy, filterAccessor: (version) => version.updatedByName ?? "",
      cell: (version) => version.updatedByName ?? version.authorName ?? "—" },
    { key: "lastChange", label: T.lastChange, header: T.lastChange, filterAccessor: (version) => lastChange(version) ?? "",
      cell: (version) => {
        const when = lastChange(version);
        return when ? new Intl.DateTimeFormat(locale, DATE_OPTIONS).format(new Date(when)) : "—";
      } },
  ];
  const itemFor = (action: VersionRowAction, version: RubricVersionResponse): ActionMenuItem => {
    switch (action) {
      case "VIEW":
        return { label: T.view, icon: EyeIcon, href: versionDetailHref(version.publicId) };
      case "EDIT":
        return { label: T.editVersion, icon: PencilIcon, href: versionEditHref(version.publicId) };
      case "REVIEW":
        return { label: T.review, icon: CheckCircleIcon, href: versionEditHref(version.publicId) };
      case "CLONE":
        return { label: T.cloneVersion, icon: CopyIcon, disabled: clone.isPending,
          onSelect: () => clone.mutate(version.publicId, { onSuccess: (created) => router.push(versionEditHref(created.publicId)) }) };
      case "SUBMIT":
        return { label: T.submit, icon: UploadIcon, disabled: statusChange.isPending,
          onSelect: () => statusChange.mutate({ id: version.publicId, request: { action: "SUBMIT" } }) };
      case "DISCARD":
        return { label: T.discard, icon: TrashIcon, danger: true, onSelect: () => setDiscarding(version) };
    }
  };
  const rowActions = (version: RubricVersionResponse): ReactElement =>
    <ActionMenu items={versionRowActions(version.status, roles).map((action) => itemFor(action, version))} label={T.rowActions} />;

  return <DashboardCard className="space-y-4">
    {(versions.isError || active.isError || create.isError || clone.isError || statusChange.isError) && <ErrorState title={T.error} />}
    <DataTable columns={columns} rows={versions.data ?? []} getRowKey={(version) => version.publicId} isLoading={versions.isLoading}
      emptyTitle={T.empty} searchPlaceholder={T.searchVersions} searchAriaLabel={T.searchVersions} density="compact" clientSidePagination
      rowActionsHeader={T.actionsHeader} rowActions={rowActions}
      toolbarActions={mayEdit ? <Button disabled={!active.data || create.isPending} onClick={createDraft}>{T.create}</Button> : undefined} />
    <ConfirmDialog open={discarding !== null} title={T.discardTitle} description={T.discardBody} confirmLabel={T.discard} tone="danger"
      isConfirming={statusChange.isPending} onClose={() => setDiscarding(null)}
      onConfirm={() => discarding && statusChange.mutate({ id: discarding.publicId, request: { action: "DISCARD" } }, { onSettled: () => setDiscarding(null) })} />
  </DashboardCard>;
};
