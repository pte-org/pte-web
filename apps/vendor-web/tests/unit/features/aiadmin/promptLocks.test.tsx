import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { LocaleProvider } from "@pte/ui";
import { PromptDocumentEditor } from "../../../../features/aiadmin/components/_PromptDocumentEditor";
import { PROMPT_EDIT_COPY } from "../../../../features/aiadmin/promptEditConstants";
import { toContent, type PromptDocumentDraft } from "../../../../features/aiadmin/promptText";

const DRAFT: PromptDocumentDraft = {
  title: "Answer Short Question",
  intro: "",
  sections: [
    { id: "requirements", title: "Requirements", text: "- Keep it short", fields: null },
    { id: "output", title: "Output", text: "", fields: [
      { id: "0", name: "topic", value: "Environmental Science" },
      { id: "1", name: "answer", value: "wind power" },
    ] },
    { id: "instructions", title: "Instructions", text: "Return ONLY the JSON object.", fields: null },
  ],
};

const render = (lockedIds: string[]): string => renderToStaticMarkup(
  <LocaleProvider>
    <PromptDocumentEditor draft={DRAFT} copy={PROMPT_EDIT_COPY.en} readOnly={false} lockedIds={lockedIds}
      onChange={() => undefined} />
  </LocaleProvider>,
);

describe("locked prompt parts", () => {
  it("shows each output field under its plain label with an editable value", () => {
    const html = render([]);
    expect(html).toMatch(/Chủ đề|Topic/);
    expect(html).toContain("Environmental Science");
    expect(html).not.toContain("<code");
  });

  it("keeps the field name when only its value changes", () => {
    const output = DRAFT.sections[1];
    const edited = { ...DRAFT, sections: [DRAFT.sections[0],
      { ...output, fields: output.fields!.map((row) => (row.name === "topic" ? { ...row, value: "Health" } : row)) },
      DRAFT.sections[2]] };
    const block = toContent(edited).sections[1].blocks.find((item) => item.type === "FIELDS");
    expect(block?.items).toEqual(["topic: Health", "answer: wind power"]);
  });
});
