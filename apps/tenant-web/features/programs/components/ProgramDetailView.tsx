"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Alert,
  Button,
  ConfirmDialog,
  LoadingState,
  Tabs,
  TabPanel,
  useToast,
  useDashboardBreadcrumbLabel,
} from "@pte/ui";
import { ClassesSection } from "@/features/classes/components";
import { useProgram, useProgramDashboard, useProgramStatusMutations } from "../api";
import { useProgramDetailText } from "../hooks/useProgramDetailText";
import { ProgramDashboard } from "./ProgramDashboard";
import { ProgramInformation } from "./ProgramInformation";

interface ProgramDetailViewProps {
  organizationPublicId: string;
  programPublicId: string;
}
type ProgramCommand = "activate" | "suspend" | "archive";

export const ProgramDetailView = ({
  organizationPublicId,
  programPublicId,
}: ProgramDetailViewProps) => {
  const text = useProgramDetailText();
  if (!organizationPublicId) return <Alert tone="error">{text.missingOrganization}</Alert>;
  return (
    <ProgramDetailContent
      organizationPublicId={organizationPublicId}
      programPublicId={programPublicId}
    />
  );
};

const ProgramDetailContent = ({
  organizationPublicId,
  programPublicId,
}: ProgramDetailViewProps) => {
  const router = useRouter();
  const text = useProgramDetailText();
  const { showToast } = useToast();
  const query = useProgram(organizationPublicId, programPublicId);
  const pathname = usePathname();
  useDashboardBreadcrumbLabel(pathname, query.data?.name);
  const dashboard = useProgramDashboard(organizationPublicId, programPublicId);
  const mutations = useProgramStatusMutations(organizationPublicId, programPublicId);
  const [activeTab, setActiveTab] = useState("overview");
  const [command, setCommand] = useState<ProgramCommand | null>(null);
  const pending =
    mutations.activate.isPending || mutations.suspend.isPending || mutations.archive.isPending;
  const program = query.data;
  if (query.isError)
    return (
      <Alert tone="error">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span>{text.loadFailed}</span>
          <Button variant="secondary" onClick={() => void query.refetch()}>
            {text.retry}
          </Button>
        </div>
      </Alert>
    );
  if (!program) return <LoadingState rows={4} />;

  const confirm = () => {
    if (!command || (command === "archive" && !dashboard.data)) return;
    mutations[command].mutate(undefined, {
      onSuccess: () => {
        setCommand(null);
        showToast(
          command === "archive"
            ? text.archived
            : command === "suspend"
              ? text.suspendedSuccess
              : text.activated,
          { tone: "success" },
        );
        if (command === "archive") router.push("/host/programs");
      },
      onError: () => showToast(text.failed, { tone: "error" }),
    });
  };
  const confirmLabel =
    command === "archive" ? text.archive : command === "suspend" ? text.suspend : text.activate;

  return (
    <div className="flex flex-col gap-5">
      <Tabs
        id="program-detail-tabs"
        value={activeTab}
        onChange={setActiveTab}
        ariaLabel={text.sections}
        items={[
          { id: "overview", label: text.overview },
          { id: "classes", label: text.classList, count: dashboard.data?.classCount },
        ]}
      />
      <TabPanel
        id="program-detail-tabs-panel-overview"
        active={activeTab === "overview"}
        labelledBy="program-detail-tabs-tab-overview"
        keepMounted
      >
        <div className="flex flex-col gap-5">
          <ProgramDashboard
            organizationPublicId={organizationPublicId}
            programPublicId={programPublicId}
          />
          <ProgramInformation
            organizationPublicId={organizationPublicId}
            program={program}
            dashboardAvailable={Boolean(dashboard.data)}
            pending={pending}
            onCommand={setCommand}
          />
        </div>
      </TabPanel>
      <TabPanel
        id="program-detail-tabs-panel-classes"
        active={activeTab === "classes"}
        labelledBy="program-detail-tabs-tab-classes"
      >
        <ClassesSection
          organizationPublicId={organizationPublicId}
          programPublicId={programPublicId}
          classLabel={text.classes}
          studentCountByClassPublicId={
            dashboard.data
              ? new Map(dashboard.data.classes.map((row) => [row.classPublicId, row.studentCount]))
              : undefined
          }
        />
      </TabPanel>
      <ConfirmDialog
        open={command !== null}
        title={confirmLabel}
        confirmLabel={confirmLabel}
        cancelLabel={text.cancel}
        tone={command === "activate" ? "primary" : "danger"}
        description={
          command === "archive" && dashboard.data
            ? text.archiveImpact(dashboard.data.classCount, dashboard.data.studentCount)
            : command === "suspend"
              ? text.suspendDescription
              : text.activate
        }
        isConfirming={pending}
        onConfirm={confirm}
        onClose={() => setCommand(null)}
      />
    </div>
  );
};
