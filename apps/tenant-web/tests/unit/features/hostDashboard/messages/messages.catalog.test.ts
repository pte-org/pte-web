import { describe, expect, it } from "vitest";
import { HOST_DASHBOARD_EN, type HostDashboardMessageKey } from "../../../../../features/hostDashboard/messages/en";
import { HOST_DASHBOARD_VI } from "../../../../../features/hostDashboard/messages/vi";

const ORGANISATION_NOUNS = ["program", "programs", "class", "classes", "classLower"];
/** Run-time values the components pass to `format`; any other token is a typo. */
const RUNTIME_PLACEHOLDERS = [
  "count",
  "days",
  "used",
  "limit",
  "percent",
  "date",
  "enrolled",
  "capacity",
  "type",
  "expires",
  "label",
  "share",
];

const KEYS = Object.keys(HOST_DASHBOARD_EN) as HostDashboardMessageKey[];
const BOTH = [
  ["en", HOST_DASHBOARD_EN],
  ["vi", HOST_DASHBOARD_VI],
] as const;

const tokensOf = (text: string): string[] => [...text.matchAll(/\{([^}]*)\}/g)].map((match) => match[1]);
const runtimeTokens = (text: string): string[] =>
  tokensOf(text).filter((token) => !ORGANISATION_NOUNS.includes(token)).sort();

describe("catalog completeness", () => {
  it.each(BOTH)("%s has a non-blank value for every key", (_name, catalog) => {
    for (const key of KEYS) {
      expect(typeof catalog[key], key).toBe("string");
      expect(catalog[key].trim(), key).not.toBe("");
    }
  });

  it("has the same key set in en and vi, in both directions", () => {
    const vi = Object.keys(HOST_DASHBOARD_VI);
    expect(KEYS.filter((key) => !vi.includes(key))).toEqual([]);
    expect(vi.filter((key) => !KEYS.includes(key as HostDashboardMessageKey))).toEqual([]);
  });

  it.each(BOTH)("%s values carry no stray whitespace or doubled spaces", (_name, catalog) => {
    for (const key of KEYS) {
      expect(catalog[key], key).toBe(catalog[key].trim());
      expect(catalog[key], key).not.toMatch(/\s{2,}/);
    }
  });
});

describe("placeholders", () => {
  it("are identical (same names, same number of occurrences) in en and vi for every key", () => {
    for (const key of KEYS) {
      expect(runtimeTokens(HOST_DASHBOARD_VI[key]), key).toEqual(runtimeTokens(HOST_DASHBOARD_EN[key]));
    }
  });

  it.each(BOTH)("%s uses only known placeholder names", (_name, catalog) => {
    const known = new Set([...RUNTIME_PLACEHOLDERS, ...ORGANISATION_NOUNS]);
    for (const key of KEYS) {
      for (const token of tokensOf(catalog[key])) expect(known.has(token), `${key}: {${token}}`).toBe(true);
    }
  });

  it.each(BOTH)("%s has balanced braces", (_name, catalog) => {
    for (const key of KEYS) {
      expect((catalog[key].match(/\{/g) ?? []).length, key).toBe((catalog[key].match(/\}/g) ?? []).length);
    }
  });

  it("only English copy takes the tenant's program/class nouns (Vietnamese keeps its own words)", () => {
    for (const key of KEYS) {
      expect(tokensOf(HOST_DASHBOARD_VI[key]).filter((token) => ORGANISATION_NOUNS.includes(token)), key).toEqual([]);
    }
  });
});

describe("copy never contains machine strings", () => {
  it.each(BOTH)("%s has no enum codes, ids or technical words in user-facing text", (_name, catalog) => {
    for (const key of KEYS) {
      expect(catalog[key], key).not.toMatch(/\b[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+\b/);
      expect(catalog[key], key).not.toMatch(/\b(?:null|undefined|NaN|SQL|exception|stack trace)\b/i);
      expect(catalog[key], key).not.toMatch(/https?:\/\/|<[a-z/]/i);
    }
  });

  it("translates every key (Vietnamese differs from English except for pure symbols)", () => {
    const same = KEYS.filter((key) => HOST_DASHBOARD_VI[key] === HOST_DASHBOARD_EN[key]);
    // Placeholder names are not words: "{enrolled} / {capacity}" is a pure-symbol template.
    const words = (text: string): string => text.replace(/\{[^}]*\}/g, "");
    expect(same.filter((key) => /[A-Za-z]{3,}/.test(words(HOST_DASHBOARD_EN[key])))).toEqual([]);
  });

  it("has a singular entry next to every plural day-count entry, and Vietnamese keeps one wording", () => {
    const PAIRS = [
      ["expiryDay", "expiryDays"],
      ["attentionUnitDay", "attentionUnitDays"],
    ] as const;
    for (const [singular, plural] of PAIRS) {
      expect(HOST_DASHBOARD_EN[singular], singular).not.toBe(HOST_DASHBOARD_EN[plural]);
      expect(HOST_DASHBOARD_EN[singular], singular).toMatch(/ day\b/);
      expect(HOST_DASHBOARD_EN[plural], plural).toMatch(/ days\b/);
      expect(HOST_DASHBOARD_VI[singular], singular).toBe(HOST_DASHBOARD_VI[plural]);
    }
  });

  it("no longer carries the removed quick-actions label and uses the product spelling", () => {
    expect(Object.keys(HOST_DASHBOARD_EN)).not.toContain("quickActionsLabel");
    expect(Object.keys(HOST_DASHBOARD_VI)).not.toContain("quickActionsLabel");
    for (const key of KEYS) expect(HOST_DASHBOARD_EN[key], key).not.toMatch(/finalisation/i);
  });
});
