"use client";

import { useFeedbackToast } from "../hooks/useFeedbackToast";

import { useEffect, useTransition, type ReactElement, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button, ErrorState, Skeleton, TabPanel, Tabs } from "@pte/ui";
import { useAttendanceRoster, useMyProctorAssignment } from "../api";
import { ProctorSessionInfoCard } from "./ProctorSessionInfoCard";
import { AttendanceSummaryCards } from "./AttendanceSummaryCards";
import { useProctorWorkspaceText } from "../hooks/useProctorWorkspaceText";
import {
  getProctorSessionRoute,
  proctorSessionTabHref,
  type ProctorSessionRoute,
  type ProctorSessionTab,
} from "../sessionNavigation";

interface WorkspaceProps {
  children: ReactNode;
}
interface SessionFrameProps extends WorkspaceProps {
  route: ProctorSessionRoute;
}

const ProctorSessionFrame = ({ route, children }: SessionFrameProps): ReactElement => {
  const router = useRouter();
  const [isNavigating, startNavigation] = useTransition();
  useEffect(() => {
    for (const tab of ["attendance", "incidents", "audit-log"] as const) {
      router.prefetch(proctorSessionTabHref(route.sessionPublicId, tab));
    }
  }, [router, route.sessionPublicId]);
  const text = useProctorWorkspaceText();
  const assignment = useMyProctorAssignment(route.sessionPublicId);
  const session = assignment.data;
  const attendance = useAttendanceRoster(session ? route.sessionPublicId : "", {
    page: 0,
    size: 1,
  });
  useFeedbackToast(assignment.isError && session ? text.sessionRefreshError : null, "warning");
  const fatalError = assignment.isError && !session;
  const tabs: { id: ProctorSessionTab; label: string }[] = [
    { id: "attendance", label: text.sessionAttendance },
    { id: "incidents", label: text.sessionIncidents },
    { id: "audit-log", label: text.sessionAuditLog },
  ];
  const tabId = `proctor-session-${route.sessionPublicId}`;

  return (
    <>
      <div className="space-y-4 px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8 lg:pt-8">
        {assignment.isLoading ? (
          <Skeleton className="h-8 w-64" />
        ) : (
          session && <ProctorSessionInfoCard session={session} attendance={attendance.data} />
        )}
        {session && (attendance.data || attendance.isLoading) && (
          <AttendanceSummaryCards
            summary={attendance.data?.summary}
            isLoading={attendance.isLoading}
          />
        )}
        {!fatalError && (
          <Tabs
            id={tabId}
            items={tabs}
            value={route.tab}
            variant="minimal"
            ariaLabel={text.sessionTools}
            onChange={(value) => {
              const selected = tabs.find((tab) => tab.id === value);
              if (!selected || selected.id === route.tab) return;
              startNavigation(() => {
                router.push(proctorSessionTabHref(route.sessionPublicId, selected.id), {
                  scroll: false,
                });
              });
            }}
          />
        )}
      </div>
      {fatalError ? (
        <div className="p-4 sm:p-6 lg:p-8">
          <ErrorState
            title={text.sessionLoadError}
            action={
              <Button variant="secondary" size="sm" onClick={() => void assignment.refetch()}>
                {text.retry}
              </Button>
            }
          />
        </div>
      ) : session ? (
        <div aria-busy={isNavigating} className="min-h-64">
          <TabPanel
            id={`${tabId}-panel-${route.tab}`}
            labelledBy={`${tabId}-tab-${route.tab}`}
            active
          >
            {children}
          </TabPanel>
        </div>
      ) : assignment.isLoading ? (
        <div className="p-4 sm:p-6 lg:p-8">
          <Skeleton className="h-64 w-full" />
        </div>
      ) : null}
    </>
  );
};

export const ProctorSessionWorkspace = ({ children }: WorkspaceProps): ReactElement => {
  const pathname = usePathname();
  const route = getProctorSessionRoute(pathname);
  return route ? (
    <ProctorSessionFrame key={route.sessionPublicId} route={route}>
      {children}
    </ProctorSessionFrame>
  ) : (
    <>{children}</>
  );
};
