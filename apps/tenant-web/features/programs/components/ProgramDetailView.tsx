"use client";

import { useState, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Badge,
  ConfirmDialog,
  LoadingState,
  PageHeader,
  useToast,
} from "@pte/ui";
import { AppBackButton } from "@/features/navigation/components/AppBackButton";
import { ClassesSection } from "@/features/classes/components";
import { errorMessage } from "@/features/examoperations/errorMessage";
import { useOrgLabels } from "@/features/orgLabels/useOrgLabels";
import {
  PROGRAM_DASHBOARD_TEXT,
  PROGRAM_DETAIL_TEXT,
  PROGRAM_STATUS_LABELS,
  PROGRAM_STATUS_VARIANT,
} from "../constants";
import { useProgram, useProgramDashboard, useProgramStatusMutations } from "../api";
import { ProgramDashboard } from "./ProgramDashboard";

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
        <AppBackButton href="/host/programs" label={T.backToList(labels.program)} />
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
  const router = useRouter();
  const T = PROGRAM_DETAIL_TEXT;
  const { showToast } = useToast();
  const [archiveConfirmOpen, setArchiveConfirmOpen] = useState(false);
  const {
    data: program,
    isLoading,
    isError,
    error,
  } = useProgram(organizationPublicId, programPublicId);
  const { data: dashboard, isLoading: dashboardLoading } = useProgramDashboard(
    organizationPublicId,
    programPublicId,
  );
  const statusMutations = useProgramStatusMutations(organizationPublicId, programPublicId);

  if (isError) {
    return (
      <div className="flex flex-col gap-4">
        <Alert tone="error">{errorMessage(error, T.loadFailed)}</Alert>
        <AppBackButton href="/host/programs" label={T.backToList(programLabel)} />
      </div>
    );
  }

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

  // Per-class counts come from the already-cached dashboard query (same query key
  // `ProgramDashboard` uses), so this adds no extra network request. Classes missing
  // from the map fall back to 0 in `ClassRowActions`.
  const classStudentCounts = new Map(
    (dashboard?.classes ?? []).map((row) => [row.classPublicId, row.studentCount]),
  );

  return (
    <div className="flex flex-col gap-5">
      <AppBackButton href="/host/programs" label={T.back(programLabel)} />

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
                onClick={() =>
                  statusMutations.activate.mutate(undefined, {
                    onSuccess: () =>
                      showToast(T.activateSuccess(programLabel), { tone: "success" }),
                    onError: (err) =>
                      showToast(errorMessage(err) ?? T.activateFailed(programLabel), { tone: "error" }),
                  })
                }
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {T.activate}
              </button>
            )}
            {program.status === "ACTIVE" && (
              <button
                type="button"
                disabled={lifecyclePending}
                onClick={() =>
                  statusMutations.suspend.mutate(undefined, {
                    onSuccess: () =>
                      showToast(T.suspendSuccess(programLabel), { tone: "success" }),
                    onError: (err) =>
                      showToast(errorMessage(err) ?? T.suspendFailed(programLabel), { tone: "error" }),
                  })
                }
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {T.suspend}
              </button>
            )}
            <button
              type="button"
              disabled={lifecyclePending}
              onClick={() => setArchiveConfirmOpen(true)}
              className="rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {T.archive}
            </button>
          </div>
        }
      />

      {lifecycleError && <Alert tone="error">{lifecycleError}</Alert>}

      <section className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-gray-900">{PROGRAM_DASHBOARD_TEXT.title}</h3>
        <ProgramDashboard
          organizationPublicId={organizationPublicId}
          programPublicId={programPublicId}
          classLabel={classLabel}
        />
      </section>

      <section className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-gray-900">{classLabel}</h3>
        <ClassesSection
          organizationPublicId={organizationPublicId}
          programPublicId={programPublicId}
          classLabel={classLabel}
          studentCountByClassPublicId={classStudentCounts}
        />
      </section>

      <ConfirmDialog
        open={archiveConfirmOpen}
        title={T.confirmArchiveTitle(programLabel)}
        description={
          dashboard
            ? T.archiveCascadeWarning(dashboard.classCount, dashboard.studentCount, programLabel)
            : T.archiveCountsLoading
        }
        confirmLabel={T.confirmArchiveButton}
        cancelLabel={T.cancel}
        tone="danger"
        isConfirming={statusMutations.archive.isPending || dashboardLoading}
        onConfirm={() =>
          statusMutations.archive.mutate(undefined, {
            onSuccess: () => {
              setArchiveConfirmOpen(false);
              showToast(T.archiveSuccess(programLabel), { tone: "success" });
              router.push("/host/programs");
            },
            onError: (err) => {
              showToast(errorMessage(err) ?? T.archiveFailed(programLabel), { tone: "error" });
            },
          })
        }
        onClose={() => setArchiveConfirmOpen(false)}
      />
    </div>
  );
};
