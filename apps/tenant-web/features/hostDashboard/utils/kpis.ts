import type { HostDashboardResponse } from "@pte/api-client";
import type { Locale } from "@pte/ui";
import type { KpiViewModel } from "../types";
import { formatNumber } from "./format";
import { sectionAvailability, sectionData } from "./sections";
import { buildDelta } from "./trend";

/**
 * KPI cards in display order. A forbidden (or missing) source section drops its card; a failed one
 * yields an `unavailable` card so the row keeps its shape and the failure stays visible.
 */
export function buildKpis(dashboard: HostDashboardResponse, locale: Locale): KpiViewModel[] {
  const { meta } = dashboard;
  const learners = sectionData(dashboard.learners);
  const exams = sectionData(dashboard.exams);
  const attempts = sectionData(dashboard.attempts);
  const cards: KpiViewModel[] = [];

  if (sectionAvailability(dashboard.learners) !== "forbidden") {
    cards.push(
      learners
        ? {
            key: "totalLearners",
            state: "ready",
            labelKey: "kpiTotalLearners",
            value: formatNumber(learners.total, locale),
            delta: null,
            noteKey: "kpiTotalLearnersNote",
            noteValues: {
              count: formatNumber(learners.newInWindow.current, locale),
              days: meta.windowDays,
            },
          }
        : { key: "totalLearners", state: "unavailable", labelKey: "kpiTotalLearners" },
      learners
        ? {
            key: "activeLearners",
            state: "ready",
            labelKey: "kpiActiveLearners",
            value: formatNumber(learners.activeLearners.current, locale),
            delta: buildDelta(learners.activeLearners, locale),
            noteKey: "kpiActiveLearnersNote",
          }
        : { key: "activeLearners", state: "unavailable", labelKey: "kpiActiveLearners" },
    );
  }

  if (exams) {
    cards.push({
      key: "sessions",
      state: "ready",
      labelKey: "kpiSessions",
      value: formatNumber(exams.created.current, locale),
      delta: buildDelta(exams.created, locale),
    });
  } else if (sectionAvailability(dashboard.exams) === "error") {
    cards.push({ key: "sessions", state: "unavailable", labelKey: "kpiSessions" });
  }

  if (attempts) {
    cards.push({
      key: "attempts",
      state: "ready",
      labelKey: "kpiAttempts",
      value: formatNumber(attempts.submitted.current, locale),
      delta: buildDelta(attempts.submitted, locale),
      noteKey: "kpiAttemptsNote",
      noteValues: { count: formatNumber(attempts.inProgressNow, locale) },
    });
  } else if (sectionAvailability(dashboard.attempts) === "error") {
    cards.push({ key: "attempts", state: "unavailable", labelKey: "kpiAttempts" });
  }

  return cards;
}
