import type { ReactElement } from "react";
import { useRouter } from "next/navigation";
import type { ExaminerSessionResponse } from "@pte/api-client";
import { ActionMenu, CollapsibleSection, DashboardCard, DescriptionList, EyeIcon, StatusBadge } from "@pte/ui";
import { STAFF_DETAIL_ROUTES } from "../constants";
import type { StaffDetailText } from "../hooks/useStaffDetailText";
import { formatStaffDate } from "../utils";
import { ExaminerProgress } from "./ExaminerProgress";

interface ExaminerSessionCardProps { row: ExaminerSessionResponse; text: StaffDetailText }

export const ExaminerSessionCard = ({ row: { session, progress }, text }: ExaminerSessionCardProps): ReactElement => {
  const router = useRouter();
  return <DashboardCard>
    <CollapsibleSection title={session.name} actions={<ActionMenu label={text.details} items={[{ label: text.details, icon: EyeIcon, onSelect: () => router.push(STAFF_DETAIL_ROUTES.session(session.sessionPublicId)) }]} />}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          <StatusBadge label={text[session.sessionStatus]} variant="neutral" />
          <StatusBadge label={text[progress.publicationStatus]} variant={progress.publicationStatus === "PUBLISHED" ? "success" : "neutral"} />
        </div>
        <DescriptionList items={[
          { label: text.start, value: formatStaffDate(session.opensAt, text.locale, text.unscheduled) },
          { label: text.end, value: formatStaffDate(session.closesAt, text.locale, text.unscheduled) },
          { label: text.assignedAttempts, value: progress.assignedAttemptCount },
          { label: text.batches, value: progress.batchCount },
        ]} />
        <ExaminerProgress eligible={progress.eligibleAnswerCount} submitted={progress.submittedAnswerCount}
          percent={progress.progressPercent} text={text} />
      </div>
    </CollapsibleSection>
  </DashboardCard>;
};
