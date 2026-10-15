"use client";

import { usePathname, useRouter } from "next/navigation";

import { useState } from "react";
import {
  Alert,
  LoadingState,
  Tabs,
  TabPanel,
  useLocale,
  useDashboardBreadcrumbLabel,
} from "@pte/ui";
import { useOrgLabels } from "@/features/orgLabels/useOrgLabels";
import { useProgram } from "@/features/programs/api";
import { useClasses, useClassRoster } from "../api";
import { useClassActionText } from "../hooks/useClassActionText";
import { ClassInformation } from "./ClassInformation";
import { ClassRosterTable } from "./ClassRosterTable";
import { ImportOrAssignModal } from "./ImportOrAssignModal";

interface ClassDetailViewProps {
  organizationPublicId: string;
  programPublicId: string;
  classPublicId: string;
}

export const ClassDetailView = (props: ClassDetailViewProps) => {
  const text = useClassActionText();
  if (!props.organizationPublicId || !props.programPublicId) {
    return <Alert tone="error">{text.missingContext}</Alert>;
  }
  return <ClassDetailContent {...props} />;
};

const ClassDetailContent = ({
  organizationPublicId,
  programPublicId,
  classPublicId,
}: ClassDetailViewProps) => {
  const router = useRouter();
  const text = useClassActionText();
  const { t } = useLocale();
  const labels = useOrgLabels();
  const classLabel = t("nav.class", labels.class);
  const [activeTab, setActiveTab] = useState("overview");
  const [importOpen, setImportOpen] = useState(false);
  const query = useClasses(organizationPublicId, programPublicId);
  const program = useProgram(organizationPublicId, programPublicId);
  const studentClass = query.data?.find((candidate) => candidate.publicId === classPublicId);
  const roster = useClassRoster(programPublicId, classPublicId);
  const pathname = usePathname();
  useDashboardBreadcrumbLabel(pathname, studentClass?.name);

  if (query.isError) return <Alert tone="error">{text.loadFailed}</Alert>;
  if (query.isLoading) return <LoadingState rows={4} />;
  if (!studentClass) return <Alert tone="error">{text.notFound}</Alert>;

  return (
    <div className="flex flex-col gap-5">
      <Tabs
        id="class-detail-tabs"
        value={activeTab}
        onChange={setActiveTab}
        ariaLabel={text.sections}
        items={[
          { id: "overview", label: text.overview },
          { id: "students", label: text.roster },
        ]}
      />
      <TabPanel
        id="class-detail-tabs-panel-overview"
        active={activeTab === "overview"}
        labelledBy="class-detail-tabs-tab-overview"
      >
        <ClassInformation
          organizationPublicId={organizationPublicId}
          studentClass={studentClass}
          programName={program.data?.name}
          classLabel={classLabel}
          studentCount={roster.data?.length ?? 0}
          onArchived={() =>
            router.push(
              `/host/programs/${programPublicId}?organizationPublicId=${organizationPublicId}`,
            )
          }
        />
      </TabPanel>
      <TabPanel
        id="class-detail-tabs-panel-students"
        active={activeTab === "students"}
        labelledBy="class-detail-tabs-tab-students"
      >
        <div className="flex flex-col gap-4">
          <ClassRosterTable
            organizationPublicId={organizationPublicId}
            programPublicId={programPublicId}
            classPublicId={classPublicId}
            classLabel={classLabel}
            className={studentClass.name}
            onAddStudents={() => setImportOpen(true)}
          />
        </div>
      </TabPanel>
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
