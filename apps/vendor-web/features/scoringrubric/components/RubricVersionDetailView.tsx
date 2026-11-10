"use client";
import type { ReactElement, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge, Button, ErrorState, LoadingState, useDashboardBreadcrumbLabel, useLocale } from "@pte/ui";
import { useCurrentUser } from "@/features/auth/api";
import { useRubricVersion } from "../versionApi";
import { RUBRIC_EDIT_TEXT, versionEditHref } from "../versionConstants";
import { versionActions } from "../versionEditing";
import { statusLabel, statusVariant } from "../versionStatus";
import { RubricTaskTypeListView } from "./RubricTaskTypeListView";

interface RubricVersionDetailViewProps {
  id: string;
  /** Shown under the skill tabs; the page supplies it so this feature does not depend on others. */
  sidePanel?: ReactNode;
}

/** One rubric version, read-only: its task types like the active rubric. Work on it (edit, review) starts from the button. */
export const RubricVersionDetailView = ({ id, sidePanel }: RubricVersionDetailViewProps): ReactElement => {
  const { locale } = useLocale();
  const T = RUBRIC_EDIT_TEXT[locale === "vi" ? "vi" : "en"];
  const version = useRubricVersion(id);
  const current = useCurrentUser();
  useDashboardBreadcrumbLabel(usePathname(), version.data ? `${T.title} ${version.data.versionNo}` : undefined);

  if (version.isLoading) return <LoadingState rows={5} />;
  if (!version.data || version.isError) return <ErrorState title={T.error} />;

  const status = version.data.status;
  const actions = versionActions(status, current.data?.roles ?? [], version.data.authorUserPublicId === current.data?.publicId);
  const edits = actions.edit;
  const works = edits || actions.activate || actions.reject;

  return (
    <RubricTaskTypeListView
      versionId={id}
      sidePanel={sidePanel}
      toolbar={<span className="flex items-center gap-3 text-sm font-medium">{`${T.title} ${version.data.versionNo}`}
        <Badge variant={statusVariant(status)}>{statusLabel(status, T)}</Badge></span>}
      toolbarActions={works ? <Link href={versionEditHref(id)}><Button>{edits ? T.editVersion : T.review}</Button></Link> : undefined}
    />
  );
};
