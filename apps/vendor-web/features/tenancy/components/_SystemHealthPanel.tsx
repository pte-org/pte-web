import type { ReactElement } from "react";
import { SYSTEM_HEALTH_TEXT } from "../constants";
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

export const SystemHealthPanel = ({
  health,
}: SystemHealthPanelProps): ReactElement => (
  <aside className="flex flex-col gap-3">
    <h2 className="text-sm font-semibold text-gray-700">
      {SYSTEM_HEALTH_TEXT.TITLE}
    </h2>
    <Metric
      label={SYSTEM_HEALTH_TEXT.API_ERROR_RATE}
      value={health?.apiErrorRate ?? "—"}
    />
    <Metric
      label={SYSTEM_HEALTH_TEXT.AI_QUEUE}
      value={String(health?.aiQueueDepth ?? "—")}
      unit={SYSTEM_HEALTH_TEXT.AI_QUEUE_UNIT}
    />
    <Metric
      label={SYSTEM_HEALTH_TEXT.DELIVERY_ERRORS}
      value={String(health?.deliveryErrors ?? "—")}
      unit={SYSTEM_HEALTH_TEXT.DELIVERY_ERRORS_UNIT}
    />
    <div className="rounded-xl bg-blue-700 p-4 text-white">
      <p className="text-sm font-semibold">{SYSTEM_HEALTH_TEXT.SERVER_STATUS}</p>
      <p className="mt-1 text-xs text-blue-100">
        {SYSTEM_HEALTH_TEXT.OPERATIONAL}
      </p>
      <button
        type="button"
        className="mt-3 rounded-md bg-white/15 px-3 py-1.5 text-xs font-medium hover:bg-white/25"
      >
        {SYSTEM_HEALTH_TEXT.VIEW_LOGS}
      </button>
    </div>
  </aside>
);
