"use client";

import { useCallback, useEffect, useState, type ReactElement } from "react";
import { useSearchParams } from "next/navigation";
import { TabPanel, Tabs, useLocale, type TabItem } from "@pte/ui";
import {
  ExistingStudentAssignmentModal,
  ExistingStudentImportModal,
} from "@/features/examoperations/components";
import type { ExamSession } from "../types";
import { ExaminerTab } from "./ExaminerTab";
import { ExamOverviewTab } from "./ExamOverviewTab";
import { ExamParticipantsTab } from "./ExamParticipantsTab";
import { ExamResultsTab } from "./ExamResultsTab";
import { ExamSettingsTab } from "./ExamSettingsTab";
import { ExamSubmissionsTab } from "./ExamSubmissionsTab";

type ExamDetailTab = "overview" | "settings" | "participants" | "submissions" | "examiner" | "results";

const TAB_IDS: readonly ExamDetailTab[] = [
  "overview",
  "settings",
  "participants",
  "submissions",
  "examiner",
  "results",
];

interface ExamDetailTabsProps {
  session: ExamSession;
  sessionPublicId: string;
}

const isExamDetailTab = (value: string | null): value is ExamDetailTab =>
  value !== null && TAB_IDS.includes(value as ExamDetailTab);

const parseTab = (value: string | null): ExamDetailTab =>
  isExamDetailTab(value) ? value : "overview";

const readTabFromLocation = (): ExamDetailTab => {
  if (typeof window === "undefined") return "overview";
  const value = new URL(window.location.href).searchParams.get("tab");
  return parseTab(value);
};

export const ExamDetailTabs = ({ session, sessionPublicId }: ExamDetailTabsProps): ReactElement => {
  const { t } = useLocale();
  const searchParams = useSearchParams();
  const initialTab = parseTab(searchParams.get("tab"));
  const [activeTab, setActiveTab] = useState<ExamDetailTab>(initialTab);
  const [visitedTabs, setVisitedTabs] = useState<Set<ExamDetailTab>>(
    () => new Set([initialTab]),
  );
  const [studentAssignmentOpen, setStudentAssignmentOpen] = useState(false);
  const [studentImportOpen, setStudentImportOpen] = useState(false);

  const selectTab = useCallback((nextTab: ExamDetailTab): void => {
    setActiveTab(nextTab);
    setStudentAssignmentOpen(false);
    setStudentImportOpen(false);
    setVisitedTabs((current) => {
      if (current.has(nextTab)) return current;
      return new Set(current).add(nextTab);
    });

    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (nextTab === "overview") {
      url.searchParams.delete("tab");
    } else {
      url.searchParams.set("tab", nextTab);
    }
    const nextUrl = `${url.pathname}${url.search}${url.hash}`;
    const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (nextUrl !== currentUrl) window.history.pushState(window.history.state, "", nextUrl);
  }, []);

  useEffect(() => {
    const syncTabFromLocation = (): void => {
      selectTab(readTabFromLocation());
    };
    syncTabFromLocation();
    window.addEventListener("popstate", syncTabFromLocation);
    return () => window.removeEventListener("popstate", syncTabFromLocation);
  }, [selectTab]);

  const keepPanelMounted = (tab: ExamDetailTab): boolean =>
    tab === "overview" ||
    (visitedTabs.has(tab) && (tab === "submissions" || tab === "examiner"));

  const items: TabItem[] = [
    { id: "overview", label: t("tenant.examTabs.overview", "Overview") },
    { id: "settings", label: t("tenant.examTabs.settings", "Exam settings") },
    { id: "participants", label: t("tenant.examTabs.participants", "Participants & proctors") },
    { id: "submissions", label: t("tenant.examTabs.submissions", "Submissions") },
    { id: "examiner", label: t("tenant.examTabs.examiner", "Examiner") },
    { id: "results", label: t("tenant.examTabs.results", "Results & publication") },
  ];

  return (
    <section className="rounded-xl border border-[var(--shell-border)] bg-[var(--surface-card)] p-3 sm:p-4">
      <Tabs
        id="exam-detail-tabs"
        items={items}
        value={activeTab}
        onChange={(value) => {
          if (isExamDetailTab(value)) selectTab(value);
        }}
        ariaLabel={t("tenant.examTabs.ariaLabel", "Exam sections")}
      />

      <TabPanel
        id="exam-detail-tabs-panel-overview"
        labelledBy="exam-detail-tabs-tab-overview"
        active={activeTab === "overview"}
        keepMounted={keepPanelMounted("overview")}
        className="mt-5"
      >
        <ExamOverviewTab session={session} />
      </TabPanel>
      <TabPanel
        id="exam-detail-tabs-panel-settings"
        labelledBy="exam-detail-tabs-tab-settings"
        active={activeTab === "settings"}
        keepMounted={keepPanelMounted("settings")}
        className="mt-5"
      >
        <ExamSettingsTab session={session} />
      </TabPanel>
      <TabPanel
        id="exam-detail-tabs-panel-participants"
        labelledBy="exam-detail-tabs-tab-participants"
        active={activeTab === "participants"}
        keepMounted={keepPanelMounted("participants")}
        className="mt-5"
      >
        <ExamParticipantsTab
          session={session}
          sessionPublicId={sessionPublicId}
          onOpenStudentAssignment={() => setStudentAssignmentOpen(true)}
          onOpenStudentImport={() => setStudentImportOpen(true)}
        />
      </TabPanel>
      <TabPanel
        id="exam-detail-tabs-panel-submissions"
        labelledBy="exam-detail-tabs-tab-submissions"
        active={activeTab === "submissions"}
        keepMounted={keepPanelMounted("submissions")}
        className="mt-5"
      >
        <ExamSubmissionsTab sessionPublicId={sessionPublicId} />
      </TabPanel>
      <TabPanel
        id="exam-detail-tabs-panel-examiner"
        labelledBy="exam-detail-tabs-tab-examiner"
        active={activeTab === "examiner"}
        keepMounted={keepPanelMounted("examiner")}
        className="mt-5"
      >
        <ExaminerTab sessionPublicId={sessionPublicId} />
      </TabPanel>
      <TabPanel
        id="exam-detail-tabs-panel-results"
        labelledBy="exam-detail-tabs-tab-results"
        active={activeTab === "results"}
        keepMounted={keepPanelMounted("results")}
        className="mt-5"
      >
        <ExamResultsTab sessionPublicId={sessionPublicId} sessionStatus={session.status} />
      </TabPanel>

      <ExistingStudentAssignmentModal
        open={studentAssignmentOpen}
        onClose={() => setStudentAssignmentOpen(false)}
        sessionPublicId={sessionPublicId}
      />
      <ExistingStudentImportModal
        open={studentImportOpen}
        onClose={() => setStudentImportOpen(false)}
        sessionPublicId={sessionPublicId}
      />
    </section>
  );
};
