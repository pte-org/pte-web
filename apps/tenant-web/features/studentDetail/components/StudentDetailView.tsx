"use client";

import { useState, type ReactElement } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getUserFacingApiErrorMessage } from "@pte/api-client";
import { Alert, LoadingState, ProfileLayout, TabPanel, useDashboardBreadcrumbLabel } from "@pte/ui";
import type { StudentDetailTab } from "../constants";
import { useStudentDetail } from "../api";
import { useStudentDetailActions } from "../hooks/useStudentDetailActions";
import { useStudentDetailText } from "../hooks/useStudentDetailText";
import { StudentAccountTab } from "./StudentAccountTab";
import { StudentActionDialogs } from "./StudentActionDialogs";
import { StudentDetailHeader } from "./StudentDetailHeader";
import { StudentHistoryTab } from "./StudentHistoryTab";
import { StudentOverviewTab } from "./StudentOverviewTab";

interface StudentDetailViewProps { studentPublicId: string }

export const StudentDetailView = ({ studentPublicId }: StudentDetailViewProps): ReactElement => {
  const text = useStudentDetailText();
  const detail = useStudentDetail(studentPublicId);
  const [activeTab, setActiveTab] = useState<StudentDetailTab>("overview");
  const account = detail.data;
  const actions = useStudentDetailActions(studentPublicId, account, text);
  const pathname = usePathname();
  useDashboardBreadcrumbLabel(pathname, account?.fullName || account?.username);
  if (detail.isLoading) return <LoadingState rows={8} />;
  if (detail.isError || !account) return (
    <div className="rounded-xl border border-[var(--shell-border)] bg-[var(--surface-card)] p-6">
      <Alert tone="error">{getUserFacingApiErrorMessage(detail.error, text.profileLoadFailed)}</Alert>
      <Link href="/host/students">{text.backToStudents}</Link>
    </div>
  );
  return (
    <div className="flex flex-col gap-5">
      {actions.error && <Alert tone="error">{actions.error}</Alert>}
      <StudentDetailHeader account={account} text={text} actionItems={actions.items} />
      <ProfileLayout id="student-detail-tabs" items={[
        { id: "overview", label: text.tabs.overview },
        { id: "account", label: text.tabs.account },
        { id: "history", label: text.tabs.history },
      ]} value={activeTab} ariaLabel={text.tabs.ariaLabel} onChange={(value) => {
        if (value === "account" || value === "overview" || value === "history") setActiveTab(value);
      }}>
        <TabPanel id="student-detail-tabs-panel-account" labelledBy="student-detail-tabs-tab-account"
          active={activeTab === "account"} keepMounted className="mt-6">
          <StudentAccountTab key={account.publicId} account={account} studentPublicId={studentPublicId} text={text} />
        </TabPanel>
        <TabPanel id="student-detail-tabs-panel-overview" labelledBy="student-detail-tabs-tab-overview"
          active={activeTab === "overview"} keepMounted className="mt-6">
          <StudentOverviewTab studentPublicId={studentPublicId} active={activeTab === "overview"} text={text} />
        </TabPanel>
        <TabPanel id="student-detail-tabs-panel-history" labelledBy="student-detail-tabs-tab-history"
          active={activeTab === "history"} keepMounted className="mt-6">
          <StudentHistoryTab studentPublicId={studentPublicId} active={activeTab === "history"} text={text} />
        </TabPanel>
      </ProfileLayout>
      <StudentActionDialogs name={account.fullName || account.username} text={text} actions={actions} />
    </div>
  );
};
