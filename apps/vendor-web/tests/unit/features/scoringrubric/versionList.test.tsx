import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LocaleProvider } from "@pte/ui";
import type { RubricVersionResponse } from "@pte/api-client";
import { RUBRIC_EDIT_TEXT } from "../../../../features/scoringrubric/versionConstants";

const hoisted = vi.hoisted(() => ({ roles: [] as string[], versions: [] as RubricVersionResponse[] }));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: () => undefined }), usePathname: () => "/admin/scoring-rubric/versions" }));
vi.mock("@/features/auth/api", () => ({ useCurrentUser: () => ({ data: { roles: hoisted.roles } }) }));
vi.mock("../../../../features/scoringrubric/api", () => ({
  useRubricVersions: () => ({ data: hoisted.versions, isLoading: false, isError: false }),
  useRubricTaskTypes: () => ({ data: [], isError: false }),
}));
vi.mock("../../../../features/scoringrubric/versionApi", () => ({
  useCreateRubricVersion: () => ({ mutate: () => undefined, isPending: false, isError: false }),
  useRubricVersionStatusById: () => ({ mutate: () => undefined, isPending: false, isError: false }),
  useCloneRubricVersion: () => ({ mutate: () => undefined, isPending: false, isError: false }),
}));

import { RubricVersionListView } from "../../../../features/scoringrubric/components/RubricVersionListView";

const T = RUBRIC_EDIT_TEXT.vi;
const version = (versionNo: number, status: string): RubricVersionResponse => ({
  publicId: `id-${versionNo}`, versionNo, status, catalogVersion: 1, authorUserPublicId: null, approverUserPublicId: null,
  rejectionReason: null, submittedAt: null, decidedAt: null, activatedAt: null, retiredAt: null,
});
const render = (): string => renderToStaticMarkup(<LocaleProvider><RubricVersionListView /></LocaleProvider>);

describe("RubricVersionListView", () => {
  beforeEach(() => {
    hoisted.roles = ["PLATFORM_ADMIN"];
    hoisted.versions = [version(1, "RETIRED"), version(2, "ACTIVE"), version(3, "DRAFT")];
  });

  it("lists every version with its status in words", () => {
    const html = render();

    for (const label of [T.statusRETIRED, T.statusACTIVE, T.statusDRAFT]) expect(html).toContain(label);
    for (const name of ["v1", "v2", "v3"]) expect(html).toContain(`>${name}<`);
    expect(html).not.toContain(">DRAFT<");
  });

  it("gives every row the same kind of menu, so even the active version can be acted on", () => {
    const html = render();

    expect(html.match(new RegExp(`aria-label="${T.rowActions}"`, "g"))).toHaveLength(3);
  });

  it("shows who last changed each version and when, not a dash for a draft", () => {
    hoisted.versions = [{ ...version(3, "DRAFT"), updatedAt: "2026-11-07T10:30:00Z", updatedByName: "Binh Editor", authorName: "An Author" }];

    const html = render();

    expect(html).toContain(T.updatedBy);
    expect(html).toContain("Binh Editor");
    expect(html).not.toMatch(/>—</);
  });

  it("falls back to the author when nobody else changed the version", () => {
    hoisted.versions = [{ ...version(3, "DRAFT"), updatedAt: "2026-11-07T10:30:00Z", authorName: "An Author" }];

    expect(render()).toContain("An Author");
  });

  it("offers to start a draft from the toolbar to those who may edit", () => {
    expect(render()).toContain(T.create);
  });

  it("is read only for a user who may not edit", () => {
    hoisted.roles = ["EXAMINER"];

    const html = render();

    expect(html).not.toContain(T.create);
  });
});
