import { describe, expect, it } from "vitest";
import {
  CEFR_MINIMUMS,
  IELTS_MINIMUMS,
  PTE_SCORE_EXAMPLES,
  PTE_SCORE_MAX,
  PTE_SCORE_MIN,
} from "../../../../features/aboutPte/constants/scoreConversion";
import {
  cefrLevelFor,
  clampPteScore,
  formatIeltsBand,
  ieltsBandFor,
  toeflBandFor,
} from "../../../../features/aboutPte/utils/scoreConversion";

describe("PTE to IELTS (Pearson, July 2025)", () => {
  it("returns the band whose minimum the score reaches", () => {
    expect(ieltsBandFor(47)).toBe(6);
    expect(ieltsBandFor(54)).toBe(6);
    expect(ieltsBandFor(55)).toBe(6.5);
    expect(ieltsBandFor(65)).toBe(7);
    expect(ieltsBandFor(79)).toBe(8);
    expect(ieltsBandFor(90)).toBe(9);
  });

  it("lists no band below 4.5", () => {
    expect(ieltsBandFor(23)).toBeNull();
    expect(ieltsBandFor(PTE_SCORE_MIN)).toBeNull();
    expect(ieltsBandFor(24)).toBe(4.5);
  });

  it("never goes down as the score goes up", () => {
    let previous = 0;
    for (let score = PTE_SCORE_MIN; score <= PTE_SCORE_MAX; score += 1) {
      const band = ieltsBandFor(score) ?? 0;
      expect(band).toBeGreaterThanOrEqual(previous);
      previous = band;
    }
  });

  it("keeps the table sorted from the lowest band up", () => {
    const pte = IELTS_MINIMUMS.map((row) => row.pte);
    expect(pte).toEqual([...pte].sort((a, b) => a - b));
  });
});

describe("PTE to CEFR (Pearson)", () => {
  it("puts the level boundaries where Pearson does", () => {
    expect(cefrLevelFor(29)).toBe("A1");
    expect(cefrLevelFor(30)).toBe("A2");
    expect(cefrLevelFor(43)).toBe("B1");
    expect(cefrLevelFor(58)).toBe("B1");
    expect(cefrLevelFor(59)).toBe("B2");
    expect(cefrLevelFor(75)).toBe("B2");
    expect(cefrLevelFor(76)).toBe("C1");
    expect(cefrLevelFor(84)).toBe("C1");
    expect(cefrLevelFor(85)).toBe("C2");
  });

  it("covers every score on the scale", () => {
    expect(CEFR_MINIMUMS[0].pte).toBe(PTE_SCORE_MIN);
    for (let score = PTE_SCORE_MIN; score <= PTE_SCORE_MAX; score += 1) {
      expect(cefrLevelFor(score)).toBeTruthy();
    }
  });

  it("gives the example scores the levels the page promises", () => {
    expect(PTE_SCORE_EXAMPLES.map(cefrLevelFor)).toEqual(["B1", "B2", "C1"]);
    expect(PTE_SCORE_EXAMPLES.map((score) => ieltsBandFor(score))).toEqual([6, 7, 8]);
  });
});

describe("score helpers", () => {
  it("keeps a score on the 10–90 scale in whole points", () => {
    expect(clampPteScore(4)).toBe(PTE_SCORE_MIN);
    expect(clampPteScore(120)).toBe(PTE_SCORE_MAX);
    expect(clampPteScore(64.6)).toBe(65);
  });

  it("writes IELTS bands with one decimal", () => {
    expect(formatIeltsBand(6)).toBe("6.0");
    expect(formatIeltsBand(6.5)).toBe("6.5");
  });
});

describe("PTE to TOEFL iBT (through CEFR, ETS 1–6 scale)", () => {
  it("gives the band ETS assigns to the same CEFR level", () => {
    expect(toeflBandFor(50)).toBe("3–3.5");
    expect(toeflBandFor(65)).toBe("4–4.5");
    expect(toeflBandFor(79)).toBe("5–5.5");
    expect(toeflBandFor(85)).toBe("6");
    expect(toeflBandFor(PTE_SCORE_MIN)).toBe("1–1.5");
  });

  it("never goes down as the score goes up", () => {
    let previous = 0;
    for (let score = PTE_SCORE_MIN; score <= PTE_SCORE_MAX; score += 1) {
      const lowest = Number.parseFloat(toeflBandFor(score));
      expect(lowest).toBeGreaterThanOrEqual(previous);
      previous = lowest;
    }
  });
});
