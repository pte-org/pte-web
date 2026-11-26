import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LocaleProvider } from "@pte/ui";
import { ProgramsListView } from "../../../../features/programs/components/ProgramsListView";
import type { CreateProgramInput } from "../../../../features/programs/types";

const hoisted = vi.hoisted(() => ({
  showToast: vi.fn(),
  mutate: vi.fn(),
  capturedOnSubmit: null as ((input: CreateProgramInput) => void) | null,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@pte/ui", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@pte/ui")>()),
  useToast: () => ({ showToast: hoisted.showToast }),
  DataTable: ({ toolbarActions }: { toolbarActions: ReactNode }) => (
    <div data-testid="data-table">{toolbarActions}</div>
  ),
}));

vi.mock("../../../../features/programs/components/CreateProgramModal", () => ({
  CreateProgramModal: ({ onSubmit }: { onSubmit: (input: CreateProgramInput) => void }) => {
    hoisted.capturedOnSubmit = onSubmit;
    return <div data-testid="create-program-modal" />;
  },
}));

vi.mock("@/features/orgLabels/useOrgLabels", () => ({
  useOrgLabels: () => ({ program: "Program", class: "Class", isLoading: false }),
}));

vi.mock("../../../../features/programs/api", () => ({
  useMyOrganizations: () => ({
    data: [{ publicId: "org-1", name: "Org 1" }],
    isLoading: false,
  }),
  usePrograms: () => ({
    data: [],
    isLoading: false,
  }),
  useCreateProgram: () => ({
    mutate: hoisted.mutate,
    reset: vi.fn(),
    error: null,
    isPending: false,
  }),
}));

describe("ProgramsListView toast on create success", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("triggers toast with localized success message when create succeeds", () => {
    hoisted.mutate.mockImplementation(
      (_payload: unknown, options: { onSuccess?: () => void }) => {
        options?.onSuccess?.();
      },
    );

    renderToStaticMarkup(
      <LocaleProvider>
        <ProgramsListView />
      </LocaleProvider>,
    );

    expect(hoisted.capturedOnSubmit).toBeTypeOf("function");
    hoisted.capturedOnSubmit!({
      name: "Chương trình mới",
      description: "Mô tả",
      startDate: "2026-11-25",
      endDate: "2026-12-25",
    });

    expect(hoisted.mutate).toHaveBeenCalledTimes(1);
    expect(hoisted.showToast).toHaveBeenCalledTimes(1);
    expect(hoisted.showToast).toHaveBeenCalledWith("Tạo chương trình thành công.", {
      tone: "success",
    });
  });
});
