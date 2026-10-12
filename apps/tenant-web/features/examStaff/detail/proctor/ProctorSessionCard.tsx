import type { ReactElement } from "react";
import { useRouter } from "next/navigation";
import type { StaffSessionResponse, StaffSessionStatus } from "@pte/api-client";
import { ActionMenu, DashboardCard, DescriptionList, EyeIcon, StatusBadge } from "@pte/ui";
import { STAFF_DETAIL_ROUTES } from "../constants";
import type { StaffDetailText } from "../hooks/useStaffDetailText";
import { formatStaffDate } from "../utils";

interface ProctorSessionCardProps {
  row: StaffSessionResponse;
  text: StaffDetailText;
}

const statusVariant = (status: StaffSessionStatus): "success" | "warning" | "info" | "neutral" => {
  if (status === "OPEN") return "success";
  if (status === "CANCELLED") return "warning";
  if (status === "CLOSED") return "info";
  if (status === "SCHEDULED") return "info";
  return "neutral";
};

export const ProctorSessionCard = ({ row, text }: ProctorSessionCardProps): ReactElement => {
  const router = useRouter();
  return (
    <DashboardCard>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="break-words text-sm font-semibold text-[var(--ink-primary)]">
            {row.name}
          </h3>
          {row.sessionCode && (
            <p className="mt-1 text-xs text-[var(--ink-secondary)]">{row.sessionCode}</p>
          )}
        </div>
        <ActionMenu
          label={text.details}
          items={[
            {
              label: text.details,
              icon: EyeIcon,
              onSelect: () => router.push(STAFF_DETAIL_ROUTES.session(row.sessionPublicId)),
            },
          ]}
        />
      </div>
      <div className="mt-4 border-t border-[var(--divider)] pt-4">
        <DescriptionList
          items={[
            {
              label: text.start,
              value: formatStaffDate(row.opensAt, text.locale, text.unscheduled),
            },
            {
              label: text.end,
              value: formatStaffDate(row.closesAt, text.locale, text.unscheduled),
            },
          ]}
        />
      </div>
      <div className="mt-4 border-t border-[var(--divider)] pt-4">
        <StatusBadge label={text[row.sessionStatus]} variant={statusVariant(row.sessionStatus)} />
      </div>
    </DashboardCard>
  );
};
