"use client";
import type { ReactElement } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, EmptyState, ErrorState, LoadingState, PageHeader, TableRoot, TableHeader, TableHead, TableBody, TableCell, TableRow, useLocale } from "@pte/ui";
import { useRubricTaskTypes, useRubricVersions } from "../api";
import { useCreateRubricVersion } from "../versionApi";
import { parametersFromRubrics } from "../versionEditing";
import { RUBRIC_EDIT_CONFIG, RUBRIC_EDIT_TEXT } from "../versionConstants";

export const RubricVersionListView = (): ReactElement => {
  const { locale } = useLocale();
  const T = RUBRIC_EDIT_TEXT[locale === "vi" ? "vi" : "en"];
  const router = useRouter();
  const versions = useRubricVersions();
  const active = useRubricTaskTypes();
  const create = useCreateRubricVersion();
  return <div className="space-y-6"><PageHeader title={T.title} actions={<Button disabled={!active.data || create.isPending}
    onClick={() => active.data && create.mutate({ parameters: parametersFromRubrics(active.data) }, {
      onSuccess: (version) => router.push(`${RUBRIC_EDIT_CONFIG.basePath}/${version.publicId}`),
    })}>{T.create}</Button>} />
    {versions.isLoading && <LoadingState rows={4} />}
    {(versions.isError || active.isError || create.isError) && <ErrorState title={T.error} />}
    {versions.data?.length === 0 && <EmptyState title={T.empty} />}
    {Boolean(versions.data?.length) && <TableRoot><TableHeader><TableRow><TableHead>{T.version}</TableHead><TableHead>{T.status}</TableHead><TableHead>{T.open}</TableHead></TableRow></TableHeader>
      <TableBody>{versions.data?.map((version) => <TableRow key={version.publicId}><TableCell>{version.versionNo}</TableCell><TableCell>{version.status}</TableCell>
        <TableCell><Link href={`${RUBRIC_EDIT_CONFIG.basePath}/${version.publicId}`}>{T.open}</Link></TableCell></TableRow>)}</TableBody>
    </TableRoot>}
  </div>;
};
