import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@pte/ui", () => ({
  useLocale: () => ({
    locale: "en",
    t: (_key: string, fallback?: string) => fallback ?? _key,
  }),
}));

import {
  useEditorText,
  useListText,
  useModeText,
  useSkillLabels,
} from "../../../../features/hostTemplates/hooks/useTemplateText";
import {
  EDITOR_TEXT,
  HOST_TEMPLATES_TEXT,
  SKILL_LABELS,
} from "../../../../features/hostTemplates/constants";

describe("Host Template Text Hooks", () => {
  it("useListText returns list texts", () => {
    let text!: ReturnType<typeof useListText>;
    renderToStaticMarkup(
      createElement(() => {
        text = useListText();
        return null;
      }),
    );

    expect(text.TITLE).toBe(HOST_TEMPLATES_TEXT.TITLE);
    expect(text.CREATE).toBe(HOST_TEMPLATES_TEXT.CREATE);
  });

  it("useEditorText returns editor texts", () => {
    let text!: ReturnType<typeof useEditorText>;
    renderToStaticMarkup(
      createElement(() => {
        text = useEditorText();
        return null;
      }),
    );

    expect(text.BACK).toBe(EDITOR_TEXT.BACK);
    expect(text.SAVE).toBe(EDITOR_TEXT.SAVE);
  });

  it("useSkillLabels returns labels for all skills", () => {
    let labels!: ReturnType<typeof useSkillLabels>;
    renderToStaticMarkup(
      createElement(() => {
        labels = useSkillLabels();
        return null;
      }),
    );

    expect(labels.SPEAKING).toBe(SKILL_LABELS.SPEAKING);
    expect(labels.WRITING).toBe(SKILL_LABELS.WRITING);
    expect(labels.READING).toBe(SKILL_LABELS.READING);
    expect(labels.LISTENING).toBe(SKILL_LABELS.LISTENING);
  });

  it("useModeText returns mode definitions", () => {
    let modes!: ReturnType<typeof useModeText>;
    renderToStaticMarkup(
      createElement(() => {
        modes = useModeText();
        return null;
      }),
    );

    expect(modes.PROPORTIONAL.label).toBeDefined();
    expect(modes.EQUAL.label).toBeDefined();
    expect(modes.MANUAL.label).toBeDefined();
  });
});

