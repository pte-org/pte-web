import { describe, expect, it } from "vitest";
import { ABOUT_PTE_EXTRAS_EN } from "../../../../features/aboutPte/constants/aboutPteExtras.en";
import { ABOUT_PTE_EXTRAS_VI } from "../../../../features/aboutPte/constants/aboutPteExtras.vi";
import { ABOUT_PTE_EN } from "../../../../features/aboutPte/constants/aboutPteCopy.en";
import { ABOUT_PTE_VI } from "../../../../features/aboutPte/constants/aboutPteCopy.vi";
import { ABOUT_PTE_SOURCES } from "../../../../features/aboutPte/constants/aboutPteSources";
import { COMPARE_VIEWS } from "../../../../features/aboutPte/constants/compareViews";
import { pickActiveSection } from "../../../../features/aboutPte/utils/activeSection";

describe("About PTE extra copy", () => {
  it("has the same structure in both languages", () => {
    expect(ABOUT_PTE_EXTRAS_VI.differences.cards).toHaveLength(ABOUT_PTE_EXTRAS_EN.differences.cards.length);
    expect(ABOUT_PTE_EXTRAS_VI.nav.items.map((item) => item.id)).toEqual(ABOUT_PTE_EXTRAS_EN.nav.items.map((item) => item.id));
    expect(Object.keys(ABOUT_PTE_EXTRAS_VI.conversion)).toEqual(Object.keys(ABOUT_PTE_EXTRAS_EN.conversion));
  });

  it("shows four differences, each set against the other tests", () => {
    for (const extras of [ABOUT_PTE_EXTRAS_EN, ABOUT_PTE_EXTRAS_VI]) {
      expect(extras.differences.cards).toHaveLength(4);
      for (const card of extras.differences.cards) {
        expect(card.pte.length).toBeGreaterThan(0);
        expect(card.other.length).toBeGreaterThan(0);
        for (const entry of card.other) expect(entry.text.length).toBeGreaterThan(0);
        expect(card.metric.length).toBeGreaterThan(0);
      }
    }
  });

  it("has a nav entry for every section it links to", () => {
    expect(ABOUT_PTE_EXTRAS_EN.nav.items.map((item) => item.id)).toContain("difference");
  });

  it("fills the reference count into the toggle", () => {
    expect(ABOUT_PTE_EXTRAS_VI.sources.show(16)).toContain("16");
    expect(ABOUT_PTE_EXTRAS_EN.sources.show(16)).toContain("16");
  });

  it("cites Pearson's score pages as sources 15 and 16", () => {
    const urls = Object.fromEntries(ABOUT_PTE_SOURCES.map((source) => [source.id, source.url]));
    expect(urls[15]).toContain("pearsonpte.com/pte-academic/scoring");
    expect(urls[16]).toContain("understand-your-score");
  });
});

describe("public copy", () => {
  it("keeps code names and internal notes out of the page text", () => {
    const text = JSON.stringify([ABOUT_PTE_EN, ABOUT_PTE_VI, ABOUT_PTE_EXTRAS_EN, ABOUT_PTE_EXTRAS_VI]);
    expect(text).not.toMatch(/RubricScorer|AggregationCore|pte-api|\(V5\)/);
  });
});

describe("comparison views", () => {
  it("always keep PTE Academic and never show more than the matrix has", () => {
    for (const columns of Object.values(COMPARE_VIEWS)) {
      expect(columns).toContain(1);
      expect(Math.max(...columns)).toBeLessThanOrEqual(4);
    }
  });
});

describe("active section", () => {
  const order = ["overview", "comparison", "scoring"];

  it("is the section in the reading band", () => {
    expect(pickActiveSection(order, new Set(["comparison"]))).toBe("comparison");
  });

  it("prefers the section coming into view when two overlap the band", () => {
    expect(pickActiveSection(order, new Set(["overview", "comparison"]))).toBe("comparison");
  });

  it("is none when nothing is in the band", () => {
    expect(pickActiveSection(order, new Set())).toBeNull();
  });
});
