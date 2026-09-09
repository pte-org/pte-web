"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { Alert, Badge, LoadingState, PageHeader } from "@pte/ui";
import { ClassesSection } from "@/features/classes/components";
import { errorMessage } from "@/features/examoperations/errorMessage";
import { useOrgLabels } from "@/features/orgLabels/useOrgLabels";
import { PROGRAM_DETAIL_TEXT, PROGRAM_STATUS_LABELS, PROGRAM_STATUS_VARIANT } from "../constants";
import { useProgram, useProgramStatusMutations } from "../api";

interface ProgramDetailViewProps {
  organizationPublicId: string;
  programPublicId: string;
}

export const ProgramDetailView = ({
  organizationPublicId,
  programPublicId,
}: ProgramDetailViewProps): ReactElement => {
  const labels = useOrgLabels();
  const T = PROGRAM_DETAIL_TEXT;

  if (!organizationPublicId) {
    return (
      <div className="flex flex-col gap-4">
        <Alert tone="error">{T.missingOrganization}</Alert>
        <Link href="/host/programs" className="text-sm text-blue-700 hover:underline">
          {T.backToList(labels.program)}
        </Link>
      </div>
    );
  }

  return (
    <ProgramDetailContent
      organizationPublicId={organizationPublicId}
      programPublicId={programPublicId}
      programLabel={labels.program}
      classLabel={labels.class}
    />
  );
};

interface ProgramDetailContentProps {
  organizationPublicId: string;
  programPublicId: string;
  programLabel: string;
  classLabel: string;
}

const ProgramDetailContent = ({
  organizationPublicId,
  programPublicId,
  programLabel,
  classLabel,
}: ProgramDetailContentProps): ReactElement => {
  const T = PROGRAM_DETAIL_TEXT;
  const { data: program, isLoading } = useProgram(organizationPublicId, programPublicId);
  const statusMutations = useProgramStatusMutations(organizationPublicId, programPublicId);

  if (isLoading || !program) {
    return <LoadingState rows={4} />;
  }

  const lifecycleError = errorMessage(
    statusMutations.activate.error ??
      statusMutations.deactivate.error ??
      statusMutations.suspend.error ??
      statusMutations.archive.error,
  );
  const lifecyclePending =
    statusMutations.activate.isPending ||
    statusMutations.deactivate.isPending ||
    statusMutations.suspend.isPending ||
    statusMutations.archive.isPending;

  return (
    <div className="flex flex-col gap-5">
      <Link href="/host/programs" className="text-sm text-blue-700 hover:underline">
        {T.back(programLabel)}
      </Link>

      <PageHeader
        title={program.name}
        actions={
          <div className="flex items-center gap-3">
            <Badge variant={PROGRAM_STATUS_VARIANT[program.status]}>
              {PROGRAM_STATUS_LABELS[program.status]}
            </Badge>
            {program.status !== "ACTIVE" && (
              <button
                type="button"
                disabled={lifecyclePending}
                onClick={() => statusMutations.activate.mutate()}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {T.activate}
              </button>
            )}
            {program.status === "ACTIVE" && (
              <button
                type="button"
                disabled={lifecyclePending}
                onClick={() => statusMutations.suspend.mutate()}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {T.suspend}
              </button>
            )}
            <button
              type="button"
              disabled={lifecyclePending}
              onClick={() => statusMutations.archive.mutate()}
              className="rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {T.archive}
            </button>
          </div>
        }
      />

      {lifecycleError && <Alert tone="error">{lifecycleError}</Alert>}

      <section className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-gray-900">{classLabel}</h3>
        <ClassesSection
          organizationPublicId={organizationPublicId}
          programPublicId={programPublicId}
          classLabel={classLabel}
        />
      </section>
    </div>
  );
};
