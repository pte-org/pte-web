import type { HostDashboardResponse } from "@pte/api-client";
import type { Locale } from "@pte/ui";
import type { KpiViewModel } from "../types";
import { formatNumber } from "./format";
import { sectionAvailability } from "./sections";
import { buildDelta } from "./trend";

/**
 * KPI cards in display order. A forbidden source section drops its card; a failed one yields an
 * `unavailable` card so the row keeps its shape and the failure stays visible.
 */
export function buildKpis(dashboard: HostDashboardResponse, locale: Locale): KpiViewModel[] {
  const { learners, exams, attempts, meta } = dashboard;
  const cards: KpiViewModel[] = [];

  if (sectionAvailability(learners) !== "forbidden") {
    cards.push(
      learners.status === "OK"
        ? {
            key: "totalLearners",
            state: "ready",
            labelKey: "kpiTotalLearners",
            value: formatNumber(learners.data.total, locale),
            delta: null,
            noteKey: "kpiTotalLearnersNote",
            noteValues: {
              count: formatNumber(learners.data.newInWindow.current, locale),
              days: meta.windowDays,
            },
          }
        : { key: "totalLearners", state: "unavailable", labelKey: "kpiTotalLearners" },
      learners.status === "OK"
        ? {
            key: "activeLearners",
            state: "ready",
            labelKey: "kpiActiveLearners",
            value: formatNumber(learners.data.activeLearners.current, locale),
            delta: buildDelta(learners.data.activeLearners, locale),
            noteKey: "kpiActiveLearnersNote",
          }
        : { key: "activeLearners", state: "unavailable", labelKey: "kpiActiveLearners" },
    );
  }

  if (exams.status === "OK") {
    cards.push({
      key: "sessions",
      state: "ready",
      labelKey: "kpiSessions",
      value: formatNumber(exams.data.created.current, locale),
      delta: buildDelta(exams.data.created, locale),
    });
  } else if (exams.status === "ERROR") {
    cards.push({ key: "sessions", state: "unavailable", labelKey: "kpiSessions" });
  }

  if (attempts.status === "OK") {
    cards.push({
      key: "attempts",
      state: "ready",
      labelKey: "kpiAttempts",
      value: formatNumber(attempts.data.submitted.current, locale),
      delta: buildDelta(attempts.data.submitted, locale),
      noteKey: "kpiAttemptsNote",
      noteValues: { count: formatNumber(attempts.data.inProgressNow, locale) },
    });
  } else if (attempts.status === "ERROR") {
    cards.push({ key: "attempts", state: "unavailable", labelKey: "kpiAttempts" });
  }

  return cards;
}
