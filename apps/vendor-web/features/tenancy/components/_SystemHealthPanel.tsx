import type { ReactElement } from "react";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import { SYSTEM_HEALTH_TEXT as RAW_SYSTEM_HEALTH_TEXT } from "../constants";
import type { SystemHealth } from "../types";

interface SystemHealthPanelProps {
  health?: SystemHealth;
}

const Metric = ({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit?: string;
}): ReactElement => (
  <div className="rounded-xl border border-gray-200 bg-white p-4">
    <p className="text-xs uppercase tracking-wide text-gray-400">{label}</p>
    <p className="mt-1 text-xl font-bold text-gray-900">
      {value}
      {unit && <span className="ml-1 text-sm font-normal text-gray-500">{unit}</span>}
    </p>
  </div>
);

export const SystemHealthPanel = ({ health }: SystemHealthPanelProps): ReactElement => {
  const T = useAdminCopy(RAW_SYSTEM_HEALTH_TEXT);
  return (
    <aside className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-gray-700">{T.TITLE}</h2>
      <Metric label={T.API_ERROR_RATE} value={health?.apiErrorRate ?? T.EMPTY_VALUE} />
      <Metric
        label={T.AI_QUEUE}
        value={String(health?.aiQueueDepth ?? T.EMPTY_VALUE)}
        unit={T.AI_QUEUE_UNIT}
      />
      <Metric
        label={T.DELIVERY_ERRORS}
        value={String(health?.deliveryErrors ?? T.EMPTY_VALUE)}
        unit={T.DELIVERY_ERRORS_UNIT}
      />
      <div className="rounded-xl bg-blue-700 p-4 text-white">
        <p className="text-sm font-semibold">{T.SERVER_STATUS}</p>
        <p className="mt-1 text-xs text-blue-100">{T.OPERATIONAL}</p>
        <button
          type="button"
          className="mt-3 rounded-md bg-white/15 px-3 py-1.5 text-xs font-medium hover:bg-white/25"
        >
          {T.VIEW_LOGS}
        </button>
      </div>
    </aside>
  );
};
