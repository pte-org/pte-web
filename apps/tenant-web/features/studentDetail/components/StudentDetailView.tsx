"use client";

import { useState, type ReactElement } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { getUserFacingApiErrorMessage } from "@pte/api-client";
import {
  Alert,
  BanIcon,
  ConfirmDialog,
  LoadingState,
  ShieldIcon,
  TabPanel,
  Tabs,
  useDashboardBreadcrumbLabel,
  type DropdownItem,
} from "@pte/ui";
import {
  useGenerateStudentCredentials,
  type GeneratedCredentials,
} from "@/features/userManagement";
import { GeneratedCredentialsModal } from "@/features/userManagement/components";
import { useReactivateStudent, useSuspendStudent } from "@/features/studentSearch/api";
import type { StudentDetailTab } from "../constants";
import { STUDENT_DETAIL_QUERY_KEY, useStudentDetail } from "../api";
import { useStudentDetailText } from "../hooks/useStudentDetailText";
import { StudentAccountTab } from "./StudentAccountTab";
import { StudentDetailHeader } from "./StudentDetailHeader";
import { StudentHistoryTab } from "./StudentHistoryTab";
import { StudentOverviewTab } from "./StudentOverviewTab";

interface StudentDetailViewProps {
  studentPublicId: string;
}

export const StudentDetailView = ({ studentPublicId }: StudentDetailViewProps): ReactElement => {
  const text = useStudentDetailText();
  const detail = useStudentDetail(studentPublicId);
  const [activeTab, setActiveTab] = useState<StudentDetailTab>("overview");
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [credentials, setCredentials] = useState<GeneratedCredentials | null>(null);
  const suspend = useSuspendStudent();
  const reactivate = useReactivateStudent();
  const generateCredentials = useGenerateStudentCredentials();
  const queryClient = useQueryClient();

  const account = detail.data;
  const pathname = usePathname();
  useDashboardBreadcrumbLabel(pathname, account?.fullName || account?.username);
  const profileError = detail.error
    ? getUserFacingApiErrorMessage(detail.error, text.genericError)
    : null;
  const suspendError = suspend.error
    ? getUserFacingApiErrorMessage(suspend.error, text.genericError)
    : null;
  const reactivateError = reactivate.error
    ? getUserFacingApiErrorMessage(reactivate.error, text.genericError)
    : null;
  const credentialsError = generateCredentials.error
    ? getUserFacingApiErrorMessage(generateCredentials.error, text.genericError)
    : null;
  const actionError = suspendError ?? reactivateError ?? credentialsError;

  if (detail.isLoading) return <LoadingState rows={8} />;
  if (detail.isError || !account) {
    return (
      <div className="rounded-xl border border-[var(--shell-border)] bg-[var(--surface-card)] p-6">
        <p className="text-sm text-[var(--blush-action)]">
          {profileError ?? text.profileLoadFailed}
        </p>
        <Link
          href="/host/students"
          className="mt-4 inline-flex text-sm font-medium text-[var(--brand)] hover:underline"
        >
          {text.backToStudents}
        </Link>
      </div>
    );
  }

  const displayName = account.fullName || account.username;
  const resetActionErrors = (): void => {
    suspend.reset();
    reactivate.reset();
    generateCredentials.reset();
  };
  const invalidateStudentDetail = (): void => {
    void queryClient.invalidateQueries({
      queryKey: [...STUDENT_DETAIL_QUERY_KEY, studentPublicId],
    });
  };
  const actionItems: DropdownItem[] = [
    {
      label: text.actions.generatePassword,
      icon: ShieldIcon,
      disabled: generateCredentials.isPending,
      onSelect: () => {
        resetActionErrors();
        generateCredentials.mutate(studentPublicId, {
          onSuccess: (result) => setCredentials(result),
        });
      },
    },
    { separator: true, key: "student-detail-actions-separator" },
    account.status === "SUSPENDED"
      ? {
          label: text.actions.reactivate,
          icon: ShieldIcon,
          disabled: reactivate.isPending,
          onSelect: () => {
            resetActionErrors();
            reactivate.mutate(studentPublicId, { onSuccess: invalidateStudentDetail });
          },
        }
      : {
          label: text.actions.suspend,
          icon: BanIcon,
          danger: true,
          onSelect: () => {
            resetActionErrors();
            setSuspendOpen(true);
          },
        },
  ];

  return (
    <div className="flex flex-col gap-5">
      {actionError && <Alert tone="error">{actionError}</Alert>}
      <StudentDetailHeader account={account} text={text} actionItems={actionItems} />

      <section className="rounded-xl border border-[var(--shell-border)] bg-[var(--surface-card)] p-3 sm:p-4">
        <Tabs
          id="student-detail-tabs"
          items={[
            { id: "overview", label: text.tabs.overview },
            { id: "account", label: text.tabs.account },
            { id: "history", label: text.tabs.history },
          ]}
          value={activeTab}
          variant="minimal"
          onChange={(value) => {
            if (value === "account" || value === "overview" || value === "history") {
              setActiveTab(value);
            }
          }}
          ariaLabel={text.tabs.ariaLabel}
        />
        <TabPanel
          id="student-detail-tabs-panel-account"
          labelledBy="student-detail-tabs-tab-account"
          active={activeTab === "account"}
          keepMounted
          className="mt-6"
        >
          <StudentAccountTab
            key={account.publicId}
            account={account}
            studentPublicId={studentPublicId}
            text={text}
          />
        </TabPanel>
        <TabPanel
          id="student-detail-tabs-panel-overview"
          labelledBy="student-detail-tabs-tab-overview"
          active={activeTab === "overview"}
          keepMounted
          className="mt-6"
        >
          <StudentOverviewTab
            studentPublicId={studentPublicId}
            active={activeTab === "overview"}
            text={text}
          />
        </TabPanel>
        <TabPanel
          id="student-detail-tabs-panel-history"
          labelledBy="student-detail-tabs-tab-history"
          active={activeTab === "history"}
          keepMounted
          className="mt-6"
        >
          <StudentHistoryTab
            studentPublicId={studentPublicId}
            active={activeTab === "history"}
            text={text}
          />
        </TabPanel>
      </section>

      <ConfirmDialog
        open={suspendOpen}
        title={text.suspendDialog.title}
        description={
          <div className="flex flex-col gap-2">
            <span>{text.suspendDialog.description(displayName)}</span>
            {suspendError && <span className="text-[var(--blush-action)]">{suspendError}</span>}
          </div>
        }
        confirmLabel={text.suspendDialog.confirm}
        cancelLabel={text.suspendDialog.cancel}
        tone="danger"
        isConfirming={suspend.isPending}
        onConfirm={() => {
          resetActionErrors();
          suspend.mutate(studentPublicId, {
            onSuccess: () => {
              setSuspendOpen(false);
              invalidateStudentDetail();
            },
          });
        }}
        onClose={() => setSuspendOpen(false)}
      />
      <GeneratedCredentialsModal
        open={credentials !== null}
        credentials={credentials}
        onClose={() => setCredentials(null)}
      />
    </div>
  );
};
