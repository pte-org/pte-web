"use client";

import { useCallback, useState, type ReactElement } from "react";
import { usePathname } from "next/navigation";
import { ApiError } from "@pte/api-client";
import { Alert, ConfirmDialog, DashboardLoadingState, ProfileLayout, TabPanel, useDashboardBreadcrumbLabel } from "@pte/ui";
import { useStaffDetail } from "../api";
import { useStaffAccountActions } from "../hooks/useStaffAccountActions";
import { useStaffDetailText } from "../hooks/useStaffDetailText";
import { useStaffEditGuard } from "../hooks/useStaffEditGuard";
import type { StaffDetailTab } from "../types";
import { StaffAccountTab } from "./StaffAccountTab";
import { StaffActionDialogs } from "./StaffActionDialogs";
import { StaffProfileHeader } from "./StaffProfileHeader";
import { StaffProfileSnapshot } from "./StaffProfileSnapshot";
import { StaffWorkspaceError } from "./StaffWorkspaceError";
import { ProctorScheduleTab } from "../proctor/ProctorScheduleTab";
import { ExaminerTrackingTab } from "../examiner/ExaminerTrackingTab";

interface StaffDetailViewProps { staffPublicId: string }

export const StaffDetailView = ({ staffPublicId }: StaffDetailViewProps): ReactElement => {
  const text = useStaffDetailText();
  const query = useStaffDetail(staffPublicId);
  const account = query.data;
  const pathname = usePathname();
  useDashboardBreadcrumbLabel(pathname, account?.fullName || account?.username);
  const actions = useStaffAccountActions(account, text);
  const [tab, setTab] = useState<StaffDetailTab>("overview");
  const [editState, setEditState] = useState({ dirty: false, pending: false });
  const [editVersion, setEditVersion] = useState(0);
  const onEditState = useCallback((dirty: boolean, pending: boolean): void => {
    setEditState((previous) => previous.dirty === dirty && previous.pending === pending
      ? previous : { dirty, pending });
  }, []);
  const guard = useStaffEditGuard(editState.dirty, editState.pending);
  if (query.isPending) return <DashboardLoadingState variant="detail" />;
  const accessRevoked = query.error instanceof ApiError && [401, 403, 404].includes(query.error.status);
  if (accessRevoked || !account) return <StaffWorkspaceError error={query.error} text={text}
    retry={() => { void query.refetch(); }} />;
  const tabs = [
    { id: "overview", label: text.overview },
    ...(account.roles.includes("PROCTOR") ? [{ id: "proctor", label: text.proctor }] : []),
    ...(account.roles.includes("EXAMINER") ? [{ id: "examiner", label: text.examiner }] : []),
    { id: "account", label: text.account },
  ];
  return <div className="flex flex-col gap-5">
    {query.isError && <StaffWorkspaceError error={query.error} text={text}
      retry={() => { void query.refetch(); }} />}
    {actions.error && actions.command === null && <Alert tone="error">{actions.error}</Alert>}
    {actions.sent && <Alert tone="success">{text.sent}</Alert>}
    <StaffProfileHeader account={account} text={text}
      items={actions.items.map((item) => "separator" in item ? item : { ...item,
        disabled: item.disabled || editState.pending, onSelect: () => guard.request(() => {
          setEditVersion((version) => version + 1); item.onSelect?.();
        }) })} />
    <ProfileLayout id="staff-detail-tabs" items={tabs} value={tab} ariaLabel={text.tabs}
      onChange={(value) => {
        if (!tabs.some((item) => item.id === value)) return;
        guard.request(() => { setEditVersion((version) => version + 1); setTab(value as StaffDetailTab); });
      }}>
      <TabPanel id="staff-detail-tabs-panel-overview" labelledBy="staff-detail-tabs-tab-overview"
        active={tab === "overview"} keepMounted className="mt-6">
        <StaffProfileSnapshot account={account} text={text} active={tab === "overview"} />
      </TabPanel>
      {account.roles.includes("PROCTOR") && <TabPanel id="staff-detail-tabs-panel-proctor"
        labelledBy="staff-detail-tabs-tab-proctor" active={tab === "proctor"} keepMounted className="mt-6">
        <ProctorScheduleTab publicId={account.publicId} text={text} active={tab === "proctor"} />
      </TabPanel>}
      {account.roles.includes("EXAMINER") && <TabPanel id="staff-detail-tabs-panel-examiner"
        labelledBy="staff-detail-tabs-tab-examiner" active={tab === "examiner"} keepMounted className="mt-6">
        <ExaminerTrackingTab publicId={account.publicId} text={text} active={tab === "examiner"} />
      </TabPanel>}
      <TabPanel id="staff-detail-tabs-panel-account" labelledBy="staff-detail-tabs-tab-account"
        active={tab === "account"} keepMounted className="mt-6">
        <StaffAccountTab key={`${account.publicId}-${editVersion}`} account={account} text={text} onEditState={onEditState} />
      </TabPanel>
    </ProfileLayout>
    <StaffActionDialogs actions={actions} name={account.fullName || account.username} text={text} />
    <ConfirmDialog open={guard.open} title={text.unsavedTitle} description={text.unsavedDescription}
      confirmLabel={text.discard} cancelLabel={text.cancel} onConfirm={guard.confirm} onClose={guard.close} />
  </div>;
};
