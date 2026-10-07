"use client";

import { useState, type ReactElement } from "react";
import { Alert, BackButton, Badge, LoadingState, PageHeader } from "@pte/ui";
import { errorMessage } from "@/features/examoperations/errorMessage";
import { useOrgLabels } from "@/features/orgLabels/useOrgLabels";
import {
  CLASS_ROSTER_TEXT,
  CLASS_STATUS_LABELS,
  CLASS_STATUS_VARIANT,
  LECTURER_SECTION_TEXT,
} from "../constants";
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
        <BackButton href="/host/programs" label={CLASS_ROSTER_TEXT.back(labels.program)} />
      </div>
    );
  }

  return (
    <ClassDetailContent
      organizationPublicId={organizationPublicId}
      programPublicId={programPublicId}
      classPublicId={classPublicId}
      classLabel={labels.class}
    />
  );
};

interface ClassDetailContentProps {
  organizationPublicId: string;
  programPublicId: string;
  classPublicId: string;
  classLabel: string;
}

const ClassDetailContent = ({
  organizationPublicId,
  programPublicId,
  classPublicId,
  classLabel,
}: ClassDetailContentProps): ReactElement => {
  const [importOpen, setImportOpen] = useState(false);
  // Classes aren't individually fetchable by id alone in this API surface
  // (`GET .../classes` is list-only) — find this Class in its Program's
  // list, same shared-data-source discipline as the roster table.
  const {
    data: classes,
    isLoading,
    isError,
    error,
  } = useClasses(organizationPublicId, programPublicId);
  const studentClass = classes?.find((candidate) => candidate.publicId === classPublicId);
  // Back from a Class detail page should land on the Classes list page,
  // not on the Program detail page. The Classes list page is the
  // sidebar-level entry point (`/host/classes`) and shows every class
  // across the current organization; the Program detail page is one
  // navigation level too high — landing there would force the user to
  // scroll back to the Classes section to continue managing classes.
  // Label it as "Back to {classLabel}" so it always matches the entity
  // we're returning to. While the page is loading the Class list, fall
  // back to a neutral "Back" so the label is always accurate.
  const backLabel = studentClass ? `Back to ${classLabel}` : "Back";
  const backHref = `/host/classes?organizationPublicId=${organizationPublicId}`;

  if (isError) {
    return <Alert tone="error">{errorMessage(error, CLASS_ROSTER_TEXT.loadFailed)}</Alert>;
  }

  if (isLoading || !studentClass) {
    return <LoadingState rows={4} />;
  }

  return (
    // `gap-4` on mobile keeps the page dense; `sm:gap-5` adds breathing
    // room once there's real horizontal space. Stacking order is
    // intentionally: BackButton → Roster → Lecturer — the action the
    // user came to do (manage the class roster) sits at the top of the
    // fold on small screens.
    <div className="flex flex-col gap-4 sm:gap-5">
      <BackButton href={backHref} label={backLabel} />

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
              className="rounded-md bg-action px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-action/25 hover:bg-action-hover"
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
        className={studentClass.name}
      />

      <section className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-4 sm:p-5">
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
