"use client";

import { useState, type ReactElement } from "react";
import Link from "next/link";
import { Alert, Badge, LoadingState, PageHeader } from "@pte/ui";
import { errorMessage } from "@/features/examoperations/errorMessage";
import { useOrgLabels } from "@/features/orgLabels/useOrgLabels";
import { CLASS_ROSTER_TEXT, CLASS_STATUS_LABELS, CLASS_STATUS_VARIANT, LECTURER_SECTION_TEXT } from "../constants";
import { useClasses } from "../api";
import { ClassRosterTable } from "./ClassRosterTable";
import { ImportOrAssignModal } from "./ImportOrAssignModal";
import { LecturerAssignmentSection } from "./LecturerAssignmentSection";

interface ClassDetailViewProps {
  organizationPublicId: string;
  programPublicId: string;
  classPublicId: string;
}

export const ClassDetailView = ({
  organizationPublicId,
  programPublicId,
  classPublicId,
}: ClassDetailViewProps): ReactElement => {
  const labels = useOrgLabels();

  if (!organizationPublicId || !programPublicId) {
    return (
      <div className="flex flex-col gap-4">
        <Alert tone="error">{CLASS_ROSTER_TEXT.missingContext}</Alert>
        <Link href="/host/programs" className="text-sm text-blue-700 hover:underline">
          {CLASS_ROSTER_TEXT.back(labels.program)}
        </Link>
      </div>
    );
  }

  return (
    <ClassDetailContent
      organizationPublicId={organizationPublicId}
      programPublicId={programPublicId}
      classPublicId={classPublicId}
      programLabel={labels.program}
      classLabel={labels.class}
    />
  );
};

interface ClassDetailContentProps {
  organizationPublicId: string;
  programPublicId: string;
  classPublicId: string;
  programLabel: string;
  classLabel: string;
}

const ClassDetailContent = ({
  organizationPublicId,
  programPublicId,
  classPublicId,
  programLabel,
  classLabel,
}: ClassDetailContentProps): ReactElement => {
  const [importOpen, setImportOpen] = useState(false);
  // Classes aren't individually fetchable by id alone in this API surface
  // (`GET .../classes` is list-only) — find this Class in its Program's
  // list, same shared-data-source discipline as the roster table.
  const { data: classes, isLoading, isError, error } = useClasses(organizationPublicId, programPublicId);
  const studentClass = classes?.find((candidate) => candidate.publicId === classPublicId);

  if (isError) {
    return <Alert tone="error">{errorMessage(error, CLASS_ROSTER_TEXT.loadFailed)}</Alert>;
  }

  if (isLoading || !studentClass) {
    return <LoadingState rows={4} />;
  }

  return (
    <div className="flex flex-col gap-5">
      <Link href={`/host/programs/${programPublicId}?organizationPublicId=${organizationPublicId}`} className="text-sm text-blue-700 hover:underline">
        {CLASS_ROSTER_TEXT.back(programLabel)}
      </Link>

      <PageHeader
        title={studentClass.name}
        actions={
          <div className="flex items-center gap-3">
            <Badge variant={CLASS_STATUS_VARIANT[studentClass.status]}>
              {CLASS_STATUS_LABELS[studentClass.status]}
            </Badge>
            <button
              type="button"
              onClick={() => setImportOpen(true)}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-200 hover:bg-blue-700"
            >
              {CLASS_ROSTER_TEXT.addButton}
            </button>
          </div>
        }
      />

      <ClassRosterTable
        organizationPublicId={organizationPublicId}
        programPublicId={programPublicId}
        classPublicId={classPublicId}
        classLabel={classLabel}
      />

      <section className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-gray-900">{LECTURER_SECTION_TEXT.title}</h3>
        <LecturerAssignmentSection
          organizationPublicId={organizationPublicId}
          programPublicId={programPublicId}
          classPublicId={classPublicId}
        />
      </section>

      <ImportOrAssignModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        organizationPublicId={organizationPublicId}
        programPublicId={programPublicId}
        classPublicId={classPublicId}
      />
    </div>
  );
};
