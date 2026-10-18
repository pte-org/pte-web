"use client";

import { useCallback, useEffect, useState, type ReactElement } from "react";
import { useSearchParams } from "next/navigation";
import { TabPanel, Tabs, useLocale, type TabItem } from "@pte/ui";
import type { ExamSession } from "../types";
import { AddExamStudentsModal } from "./AddExamStudentsModal";
import { ExaminerTab } from "./ExaminerTab";
import { ExamOverviewTab, type ExamOverviewLifecycle } from "./ExamOverviewTab";
import { ExamParticipantsTab } from "./ExamParticipantsTab";
import { ExamAttendanceTab } from "./ExamAttendanceTab";
import { ExamQuestionsTab } from "./ExamQuestionsTab";
import { ExamResultsTab } from "./ExamResultsTab";
import { ExamSubmissionsTab } from "./ExamSubmissionsTab";

type ExamDetailTab =
  | "overview"
  | "questions"
  | "participants"
  | "attendance"
  | "submissions"
  | "examiner"
  | "results";

const TAB_IDS: readonly ExamDetailTab[] = [
  "overview",
  "questions",
  "participants",
  "attendance",
  "submissions",
  "examiner",
  "results",
];

interface ExamDetailTabsProps {
  session: ExamSession;
  sessionPublicId: string;
  lifecycle: ExamOverviewLifecycle;
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

export const ExamDetailTabs = ({
  session,
  sessionPublicId,
  lifecycle,
}: ExamDetailTabsProps): ReactElement => {
  const { t } = useLocale();
  const searchParams = useSearchParams();
  const initialTab = parseTab(searchParams.get("tab"));
  const [activeTab, setActiveTab] = useState<ExamDetailTab>(initialTab);
  const [visitedTabs, setVisitedTabs] = useState<Set<ExamDetailTab>>(() => new Set([initialTab]));
  const [studentAssignmentOpen, setStudentAssignmentOpen] = useState(false);

  const activateTab = useCallback((nextTab: ExamDetailTab): void => {
    setActiveTab(nextTab);
    setStudentAssignmentOpen(false);
    setVisitedTabs((current) => {
      if (current.has(nextTab)) return current;
      return new Set(current).add(nextTab);
    });
  }, []);

  const selectTab = useCallback(
    (nextTab: ExamDetailTab): void => {
      activateTab(nextTab);

      if (typeof window === "undefined") return;
      const url = new URL(window.location.href);
      if (nextTab === "overview") {
        url.searchParams.delete("tab");
      } else {
        url.searchParams.set("tab", nextTab);
      }
      const nextUrl = url.pathname + url.search + url.hash;
      const currentUrl = window.location.pathname + window.location.search + window.location.hash;
      if (nextUrl !== currentUrl) window.history.pushState(window.history.state, "", nextUrl);
    },
    [activateTab],
  );

  useEffect(() => {
    const syncTabFromLocation = (): void => {
      activateTab(readTabFromLocation());
    };
    syncTabFromLocation();
    window.addEventListener("popstate", syncTabFromLocation);
    return () => window.removeEventListener("popstate", syncTabFromLocation);
  }, [activateTab]);

  const keepPanelMounted = (tab: ExamDetailTab): boolean =>
    tab === "overview" ||
    (visitedTabs.has(tab) &&
      (tab === "questions" ||
        tab === "submissions" ||
        tab === "examiner" ||
        tab === "attendance"));

  const items: TabItem[] = [
    { id: "overview", label: t("tenant.examTabs.overview", "Overview") },
    { id: "questions", label: t("tenant.examTabs.questions", "Questions") },
    { id: "participants", label: t("tenant.examTabs.participants", "Participants & proctors") },
    { id: "attendance", label: t("tenant.examTabs.attendance", "Attendance") },
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
        variant="default"
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
        <ExamOverviewTab session={session} lifecycle={lifecycle} />
      </TabPanel>
      <TabPanel
        id="exam-detail-tabs-panel-questions"
        labelledBy="exam-detail-tabs-tab-questions"
        active={activeTab === "questions"}
        keepMounted={keepPanelMounted("questions")}
        className="mt-5 min-w-0"
      >
        <ExamQuestionsTab session={session} sessionPublicId={sessionPublicId} />
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
        />
      </TabPanel>
      <TabPanel
        id="exam-detail-tabs-panel-attendance"
        labelledBy="exam-detail-tabs-tab-attendance"
        active={activeTab === "attendance"}
        keepMounted={keepPanelMounted("attendance")}
        className="mt-5"
      >
        <ExamAttendanceTab sessionPublicId={sessionPublicId} sessionStatus={session.status} />
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
        <ExaminerTab sessionPublicId={sessionPublicId} sessionStatus={session.status} />
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

      <AddExamStudentsModal
        open={studentAssignmentOpen}
        onClose={() => setStudentAssignmentOpen(false)}
        sessionPublicId={sessionPublicId}
      />
    </section>
  );
};
