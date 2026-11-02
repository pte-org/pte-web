import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { LocaleProvider, type ActionMenuProps } from "@pte/ui";

vi.mock("@/features/i18n/adminCopy", () => ({ useAdminCopy: (copy: unknown) => copy }));
// The real menu only renders its entries after a click; expose them so the test can read them.
vi.mock("@pte/ui", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@pte/ui")>()),
  ActionMenu: ({ items, label }: ActionMenuProps) =>
    createElement(
      "ul",
      { "aria-label": label },
      items.map((item) =>
        "label" in item
          ? createElement(
              "li",
              { key: item.label, "data-disabled": String(item.disabled === true) },
              item.label,
            )
          : null,
      ),
    ),
}));

import { TemplateToolbarActions } from "../../../../../features/scoretemplate/components/TemplateToolbarActions";

const noop = (): void => undefined;

const render = (props: {
  canActivate: boolean;
  isActivatable?: boolean;
  isSaving?: boolean;
}): string =>
  renderToStaticMarkup(
    createElement(
      LocaleProvider,
      null,
      createElement(TemplateToolbarActions, {
        onSave: noop,
        onOpenInfo: noop,
        isSaving: props.isSaving ?? false,
        canActivate: props.canActivate,
        isActivatable: props.isActivatable ?? true,
        onActivate: noop,
      }),
    ),
  );

describe("TemplateToolbarActions", () => {
  it("keeps Save as a visible button", () => {
    expect(render({ canActivate: true })).toContain(">Save<");
  });

  it("puts Activate in the actions menu, not in a visible button", () => {
    const html = render({ canActivate: true });
    expect(html).toContain('aria-label="Template actions"');
    expect(html).toContain(">Activate</li>");
    expect(html).not.toContain(">Activate</button>");
    expect(html.match(/<button/g)).toHaveLength(1);
  });

  it("offers the template information to everyone, and Activate only to reviewers", () => {
    const html = render({ canActivate: false });
    expect(html).toContain(">Template information</li>");
    expect(html).not.toContain("Activate");
    expect(html).not.toContain("Add task type");
    expect(render({ canActivate: true })).toContain(">Template information</li>");
  });

  it("disables the Activate entry until the template is ready", () => {
    expect(render({ canActivate: true, isActivatable: false })).toContain(
      'data-disabled="true">Activate',
    );
    expect(render({ canActivate: true, isActivatable: true })).toContain(
      'data-disabled="false">Activate',
    );
  });
});
