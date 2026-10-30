import { describe, expect, it } from "vitest";
import {
  ACTIVITY_ACTIONS,
  ATTENTION_MESSAGE_KEYS,
  PLAN_TYPE_MESSAGE_KEYS,
  SESSION_STATUS_MESSAGE_KEYS,
  SUBSCRIPTION_STATUS_MESSAGE_KEYS,
} from "../../../../../features/hostDashboard/constants";
import { HOST_DASHBOARD_EN } from "../../../../../features/hostDashboard/messages/en";
import { HOST_DASHBOARD_VI } from "../../../../../features/hostDashboard/messages/vi";

const ORGANISATION_NOUNS = new Set(["program", "programs", "class", "classes", "classLower"]);
const placeholdersOf = (text: string): string[] =>
  [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).filter((name) => !ORGANISATION_NOUNS.has(name)).sort();

describe("host dashboard catalogs", () => {
  const englishKeys = Object.keys(HOST_DASHBOARD_EN).sort();

  it("cover exactly the same keys", () => {
    expect(Object.keys(HOST_DASHBOARD_VI).sort()).toEqual(englishKeys);
  });

  it("have no empty message", () => {
    for (const [key, value] of [...Object.entries(HOST_DASHBOARD_EN), ...Object.entries(HOST_DASHBOARD_VI)]) {
      expect(value.trim(), key).not.toBe("");
    }
  });

  it("use the same run-time placeholders in both languages", () => {
    for (const key of englishKeys as Array<keyof typeof HOST_DASHBOARD_EN>) {
      expect(placeholdersOf(HOST_DASHBOARD_VI[key]), key).toEqual(placeholdersOf(HOST_DASHBOARD_EN[key]));
    }
  });

  it("translate the Vietnamese catalog (no key is a copy of the English text, except symbols)", () => {
    const copied = englishKeys.filter(
      (key) =>
        HOST_DASHBOARD_VI[key as keyof typeof HOST_DASHBOARD_VI] === HOST_DASHBOARD_EN[key as keyof typeof HOST_DASHBOARD_EN] &&
        // Placeholder names are not words: "{enrolled} / {capacity}" is a pure-symbol template.
        /[a-z]{4,}/i.test(HOST_DASHBOARD_EN[key as keyof typeof HOST_DASHBOARD_EN].replace(/\{[^}]*\}/g, "")),
    );
    expect(copied).toEqual([]);
  });

  it("have a key for every displayed status, plan type, attention item and activity action", () => {
    const keys = new Set(englishKeys);
    const referenced = [
      ...Object.values(SESSION_STATUS_MESSAGE_KEYS),
      ...Object.values(SUBSCRIPTION_STATUS_MESSAGE_KEYS),
      ...Object.values(PLAN_TYPE_MESSAGE_KEYS),
      ...Object.values(ATTENTION_MESSAGE_KEYS),
      ...Object.values(ACTIVITY_ACTIONS).map((descriptor) => descriptor.messageKey),
    ];
    for (const key of referenced) expect(keys.has(key), key).toBe(true);
  });
});
