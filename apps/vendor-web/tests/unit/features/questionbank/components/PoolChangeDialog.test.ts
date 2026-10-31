import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@pte/ui", () => ({
  ConfirmDialog: ({
    open,
    title,
    description,
    confirmLabel,
    cancelLabel,
  }: {
    open: boolean;
    title: string;
    description: ReactNode;
    confirmLabel: string;
    cancelLabel: string;
  }) =>
    open ? createElement("div", null, title, description, confirmLabel, cancelLabel) : null,
}));
vi.mock("@/features/i18n/adminCopy", () => ({ useAdminCopy: (copy: unknown) => copy }));

import { PoolChangeDialog } from "../../../../../features/questionbank/components/_PoolChangeDialog";

const render = (props: {
  open?: boolean;
  targetPool: "EXAM" | "PRACTICE";
  previouslyPublished: boolean;
}): string =>
  renderToStaticMarkup(
    createElement(PoolChangeDialog, {
      open: true,
      isConfirming: false,
      onConfirm: () => {},
      onClose: () => {},
      ...props,
    }),
  );

describe("pool change warning dialog", () => {
  it("warns about leaked exam content when a published question moves to Practice", () => {
    const html = render({ targetPool: "PRACTICE", previouslyPublished: true });

    expect(html).toContain("Move this question to Practice?");
    expect(html).toContain("may leak exam content");
  });

  it("omits the leak warning for a question that was never published", () => {
    const html = render({ targetPool: "PRACTICE", previouslyPublished: false });

    expect(html).toContain("Move this question to Practice?");
    expect(html).not.toContain("may leak exam content");
  });

  it("asks for exam-standard review when moving to Official", () => {
    const html = render({ targetPool: "EXAM", previouslyPublished: true });

    expect(html).toContain("Move this question to Official?");
    expect(html).toContain("reviewed to exam standard");
    expect(html).not.toContain("may leak exam content");
  });

  it("renders nothing while closed", () => {
    const html = renderToStaticMarkup(
      createElement(PoolChangeDialog, {
        open: false,
        targetPool: "PRACTICE",
        previouslyPublished: true,
        isConfirming: false,
        onConfirm: () => {},
        onClose: () => {},
      }),
    );

    expect(html).toBe("");
  });
});
