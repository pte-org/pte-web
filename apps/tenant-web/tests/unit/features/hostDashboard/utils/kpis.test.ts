import { describe, expect, it } from "vitest";
import {
  TREND_FROM_ZERO,
  failed,
  forbidden,
  makeDashboard,
  ok,
} from "../testing/fixtures";
import { buildKpis } from "../../../../../features/hostDashboard/utils/kpis";

describe("buildKpis", () => {
  it("builds the four cards in order from a complete payload", () => {
    const cards = buildKpis(makeDashboard(), "en");
    expect(cards.map((card) => card.key)).toEqual(["totalLearners", "activeLearners", "sessions", "attempts"]);
    expect(cards.every((card) => card.state === "ready")).toBe(true);
  });

  it("formats values with the locale and carries the window in the note", () => {
    const [total] = buildKpis(makeDashboard(), "en");
    expect(total).toMatchObject({
      state: "ready",
      value: "1,200",
      delta: null,
      noteKey: "kpiTotalLearnersNote",
      noteValues: { count: "40", days: 30 },
    });
    const [vi] = buildKpis(makeDashboard(), "vi");
    expect(vi).toMatchObject({ value: "1.200" });
  });

  it("derives each trend delta from its own trend", () => {
    const cards = buildKpis(makeDashboard(), "en");
    const byKey = Object.fromEntries(cards.map((card) => [card.key, card]));
    expect(byKey.activeLearners).toMatchObject({ delta: { change: "+100%", direction: "up", tone: "good" } });
    expect(byKey.sessions).toMatchObject({ delta: { change: "-50%", direction: "down", tone: "neutral" } });
    expect(byKey.attempts).toMatchObject({ delta: { change: "0%", direction: "flat" } });
  });

  it("keeps a card with a null change so the dash shows instead of a fake percentage", () => {
    const cards = buildKpis(
      makeDashboard({
        learners: ok({
          total: 12,
          active: 12,
          suspended: 0,
          newInWindow: TREND_FROM_ZERO,
          activeLearners: TREND_FROM_ZERO,
          unassigned: 12,
        }),
      }),
      "en",
    );
    expect(cards[1]).toMatchObject({ key: "activeLearners", value: "12", delta: { change: null } });
  });

  it("shows zero as 0, not as missing", () => {
    const cards = buildKpis(
      makeDashboard({
        attempts: ok({ submitted: { current: 0, previous: 0, changePct: null }, inProgressNow: 0, monthlySubmitted: [] }),
      }),
      "en",
    );
    expect(cards.at(-1)).toMatchObject({ key: "attempts", value: "0", noteValues: { count: "0" } });
  });

  it("drops cards whose section is forbidden", () => {
    const cards = buildKpis(makeDashboard({ learners: forbidden(), exams: forbidden() }), "en");
    expect(cards.map((card) => card.key)).toEqual(["attempts"]);
  });

  it("returns no card at all when every source is forbidden", () => {
    expect(
      buildKpis(makeDashboard({ learners: forbidden(), exams: forbidden(), attempts: forbidden() }), "en"),
    ).toEqual([]);
  });

  it("marks cards of a failed section unavailable and keeps the others", () => {
    const cards = buildKpis(makeDashboard({ learners: failed(), attempts: failed() }), "en");
    expect(cards).toEqual([
      { key: "totalLearners", state: "unavailable", labelKey: "kpiTotalLearners" },
      { key: "activeLearners", state: "unavailable", labelKey: "kpiActiveLearners" },
      expect.objectContaining({ key: "sessions", state: "ready" }),
      { key: "attempts", state: "unavailable", labelKey: "kpiAttempts" },
    ]);
  });
});
