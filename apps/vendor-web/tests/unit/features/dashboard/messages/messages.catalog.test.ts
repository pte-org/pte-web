import { describe, expect, it } from "vitest";
import { ADMIN_DASHBOARD_EN, type AdminDashboardMessageKey } from "../../../../../features/dashboard/messages/en";
import { ADMIN_DASHBOARD_VI } from "../../../../../features/dashboard/messages/vi";

const RUNTIME_PLACEHOLDERS = [
  "name",
  "count",
  "days",
  "used",
  "limit",
  "percent",
  "students",
  "seats",
  "currency",
  "amount",
  "category",
  "type",
  "label",
  "number",
];

const KEYS = Object.keys(ADMIN_DASHBOARD_EN) as AdminDashboardMessageKey[];
const BOTH = [
  ["en", ADMIN_DASHBOARD_EN],
  ["vi", ADMIN_DASHBOARD_VI],
] as const;

const tokensOf = (text: string): string[] =>
  [...text.matchAll(/\{([^}]*)\}/g)].map((match) => match[1]);

describe("admin catalog completeness", () => {
  it.each(BOTH)("%s has a non-blank value for every key", (_name, catalog) => {
    for (const key of KEYS) {
      expect(typeof catalog[key], key).toBe("string");
      expect(catalog[key].trim(), key).not.toBe("");
    }
  });

  it("has the same key set in en and vi, in both directions", () => {
    const vi = Object.keys(ADMIN_DASHBOARD_VI);
    expect(KEYS.filter((key) => !vi.includes(key))).toEqual([]);
    expect(vi.filter((key) => !KEYS.includes(key as AdminDashboardMessageKey))).toEqual([]);
  });

  it.each(BOTH)("%s values carry no stray whitespace or doubled spaces", (_name, catalog) => {
    for (const key of KEYS) {
      expect(catalog[key], key).toBe(catalog[key].trim());
      expect(catalog[key], key).not.toMatch(/\s{2,}/);
    }
  });
});

describe("admin catalog placeholders", () => {
  it("are identical in en and vi for every key", () => {
    for (const key of KEYS) {
      const enTokens = tokensOf(ADMIN_DASHBOARD_EN[key]).sort();
      const viTokens = tokensOf(ADMIN_DASHBOARD_VI[key]).sort();
      expect(viTokens, key).toEqual(enTokens);
    }
  });

  it.each(BOTH)("%s uses only known placeholder names", (_name, catalog) => {
    const known = new Set(RUNTIME_PLACEHOLDERS);
    for (const key of KEYS) {
      for (const token of tokensOf(catalog[key])) {
        expect(known.has(token), `${key}: {${token}}`).toBe(true);
      }
    }
  });

  it.each(BOTH)("%s has balanced braces", (_name, catalog) => {
    for (const key of KEYS) {
      expect(
        (catalog[key].match(/\{/g) ?? []).length,
        key,
      ).toBe((catalog[key].match(/\}/g) ?? []).length);
    }
  });
});

describe("admin catalog copy hygiene", () => {
  it.each(BOTH)("%s has no technical words or raw exception tokens", (_name, catalog) => {
    for (const key of KEYS) {
      expect(catalog[key], key).not.toMatch(/\b(?:null|undefined|NaN|SQL|exception|stack trace)\b/i);
      expect(catalog[key], key).not.toMatch(/https?:\/\/|<[a-z/]/i);
    }
  });

  it("translates every key (Vietnamese differs from English except for pure symbols)", () => {
    const same = KEYS.filter((key) => ADMIN_DASHBOARD_VI[key] === ADMIN_DASHBOARD_EN[key]);
    const words = (text: string): string => text.replace(/\{[^}]*\}/g, "");
    expect(same.filter((key) => /[A-Za-z]{3,}/.test(words(ADMIN_DASHBOARD_EN[key])))).toEqual([]);
  });
});
