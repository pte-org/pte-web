import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const hoisted = vi.hoisted(() => ({
  locale: "en" as "en" | "vi",
}));

vi.mock("@pte/ui", () => ({
  useLocale: () => ({
    locale: hoisted.locale,
    t: (_key: string, fallback?: string, values?: Record<string, string | number>) => {
      let str = fallback ?? _key;
      if (values) {
        for (const [k, v] of Object.entries(values)) {
          str = str.replace(`{${k}}`, String(v));
        }
      }
      return str;
    },
  }),
}));

import { useExaminerWorkspaceText } from "../../../../features/examiner/hooks/useExaminerWorkspaceText";
import {
  getExaminerBlockingText,
  useExaminerGuidelinesText,
  useExaminerHistoryText,
  useExaminerIssueOptions,
  useExaminerOperationBadges,
  useExaminerWorkText,
} from "../../../../features/examiner/hooks/useExaminerWorkText";
import {
  EXAMINER_WORKSPACE_EN,
} from "../../../../features/examiner/messages/en";
import {
  EXAMINER_WORKSPACE_VI,
} from "../../../../features/examiner/messages/vi";
import {
  EXAMINER_WORK_TEXT,
} from "../../../../features/examiner/constants";
import {
  EXAMINER_WORK_TEXT_VI,
} from "../../../../features/examiner/messages/workVi";

beforeEach(() => {
  hoisted.locale = "en";
});

describe("useExaminerWorkspaceText", () => {
  it("resolves English messages by default", () => {
    let text!: ReturnType<typeof useExaminerWorkspaceText>;
    renderToStaticMarkup(
      createElement(() => {
        text = useExaminerWorkspaceText();
        return null;
      }),
    );

    expect(text.locale).toBe("en");
    expect(text.overviewTitle).toBe(EXAMINER_WORKSPACE_EN.overviewTitle);
    expect(typeof text.format).toBe("function");
  });

  it("resolves Vietnamese messages when locale is vi", () => {
    hoisted.locale = "vi";
    let text!: ReturnType<typeof useExaminerWorkspaceText>;
    renderToStaticMarkup(
      createElement(() => {
        text = useExaminerWorkspaceText();
        return null;
      }),
    );

    expect(text.locale).toBe("vi");
    expect(text.overviewTitle).toBe(EXAMINER_WORKSPACE_VI.overviewTitle);
  });
});

describe("Examiner Work Text Hooks", () => {
  it("resolves work, history, and guidelines texts for both locales", () => {
    let workEn!: ReturnType<typeof useExaminerWorkText>;
    let histEn!: ReturnType<typeof useExaminerHistoryText>;
    let guideEn!: ReturnType<typeof useExaminerGuidelinesText>;

    renderToStaticMarkup(
      createElement(() => {
        workEn = useExaminerWorkText();
        histEn = useExaminerHistoryText();
        guideEn = useExaminerGuidelinesText();
        return null;
      }),
    );

    expect(workEn.TITLE).toBe(EXAMINER_WORK_TEXT.TITLE);
    expect(histEn.TITLE_PREFIX).toBeDefined();
    expect(guideEn.POLICY_TITLE).toBeDefined();

    hoisted.locale = "vi";
    let workVi!: ReturnType<typeof useExaminerWorkText>;
    renderToStaticMarkup(
      createElement(() => {
        workVi = useExaminerWorkText();
        return null;
      }),
    );
    expect(workVi.TITLE).toBe(EXAMINER_WORK_TEXT_VI.TITLE);
  });

  it("provides issue options and operation badges", () => {
    let options!: ReturnType<typeof useExaminerIssueOptions>;
    let badges!: ReturnType<typeof useExaminerOperationBadges>;

    renderToStaticMarkup(
      createElement(() => {
        options = useExaminerIssueOptions();
        badges = useExaminerOperationBadges();
        return null;
      }),
    );

    expect(options).toHaveLength(4);
    expect(options[0].value).toBe("AUDIO_UNAVAILABLE");

    expect(badges.FINALIZE.variant).toBe("success");
    expect(badges.REPORT_ISSUE.variant).toBe("danger");
  });

  it("getExaminerBlockingText translates known codes and preserves unknowns", () => {
    const text = EXAMINER_WORK_TEXT;
    expect(getExaminerBlockingText(text, "ALREADY_PUBLISHED")).toBe(text.BLOCK_ALREADY_PUBLISHED);
    expect(getExaminerBlockingText(text, "WAITING_FOR_HOST_FREEZE")).toBe(text.BLOCK_WAITING_FOR_HOST_FREEZE);
    expect(getExaminerBlockingText(text, "COHORT_NOT_MANUAL_EXAMINER")).toBe(text.BLOCK_COHORT_NOT_MANUAL);
    expect(getExaminerBlockingText(text, "EXCLUDED_FROM_COHORT")).toBe(text.BLOCK_EXCLUDED_FROM_COHORT);
    expect(getExaminerBlockingText(text, "CARRIED_OVER_DRAFTS_UNCONFIRMED")).toBe(text.BLOCK_CARRIED_OVER_DRAFTS);
    expect(getExaminerBlockingText(text, "UNKNOWN_CODE")).toBe("UNKNOWN_CODE");
  });
});
