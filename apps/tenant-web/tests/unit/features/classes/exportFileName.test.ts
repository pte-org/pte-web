import { describe, expect, it, vi } from "vitest";

vi.mock("xlsx", () => ({ utils: {}, writeFile: vi.fn() }));

import { safeFileName } from "../../../../features/classes/exportClassRoster";
import { CLASS_FLOW_EN, CLASS_FLOW_VI } from "../../../../features/classes/constants/classFlowMessages";

describe("roster export file name", () => {
  it("is named after the class and the export date", () => {
    expect(CLASS_FLOW_VI.exportFileName).toContain("{className}");
    expect(CLASS_FLOW_EN.exportFileName).toContain("{date}");
  });

  it("replaces characters a file name cannot hold", () => {
    expect(safeFileName(String.raw`PTE/50B: A\B - Danh sách học viên`)).toBe("PTE-50B- A-B - Danh sách học viên");
  });
});
