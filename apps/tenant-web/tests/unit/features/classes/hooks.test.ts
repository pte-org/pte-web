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

import { useClassActionText } from "../../../../features/classes/hooks/useClassActionText";
import { useClassSectionColumns } from "../../../../features/classes/hooks/useClassSectionColumns";
import { useStudentImportText } from "../../../../features/classes/hooks/useStudentImportText";
import {
  CLASS_ACTION_EN,
  CLASS_ACTION_VI,
} from "../../../../features/classes/constants/actionMessages";
import {
  STUDENT_IMPORT_EN,
  STUDENT_IMPORT_VI,
} from "../../../../features/classes/constants/studentImportMessages";
import type { ClassResponse } from "@pte/api-client";

beforeEach(() => {
  hoisted.locale = "en";
});

describe("useClassActionText", () => {
  it("returns English catalog and format helper", () => {
    let text!: ReturnType<typeof useClassActionText>;
    renderToStaticMarkup(
      createElement(() => {
        text = useClassActionText();
        return null;
      }),
    );

    expect(text.activateSuccess).toBe(CLASS_ACTION_EN.activateSuccess);
    expect(text.archiveSuccess).toBe(CLASS_ACTION_EN.archiveSuccess);
    expect(typeof text.format).toBe("function");
  });

  it("returns Vietnamese catalog when locale is vi", () => {
    hoisted.locale = "vi";
    let text!: ReturnType<typeof useClassActionText>;
    renderToStaticMarkup(
      createElement(() => {
        text = useClassActionText();
        return null;
      }),
    );

    expect(text.activateSuccess).toBe(CLASS_ACTION_VI.activateSuccess);
  });
});

describe("useStudentImportText", () => {
  it("returns English import messages by default", () => {
    let text!: ReturnType<typeof useStudentImportText>;
    renderToStaticMarkup(
      createElement(() => {
        text = useStudentImportText();
        return null;
      }),
    );

    expect(text.title).toBe(STUDENT_IMPORT_EN.title);
  });

  it("returns Vietnamese import messages when locale is vi", () => {
    hoisted.locale = "vi";
    let text!: ReturnType<typeof useStudentImportText>;
    renderToStaticMarkup(
      createElement(() => {
        text = useStudentImportText();
        return null;
      }),
    );

    expect(text.title).toBe(STUDENT_IMPORT_VI.title);
  });
});

describe("useClassSectionColumns", () => {
  it("builds column definitions with student counts and status badge", () => {
    const studentCounts = new Map([["cls-1", 15]]);
    let columns!: ReturnType<typeof useClassSectionColumns>;
    renderToStaticMarkup(
      createElement(() => {
        columns = useClassSectionColumns(studentCounts);
        return null;
      }),
    );

    expect(columns).toHaveLength(3);
    const sampleClass: ClassResponse = {
      publicId: "cls-1",
      name: "Class 1",
      programPublicId: "prog-1",
      status: "ACTIVE",
    };

    expect(columns[0].cell(sampleClass)).toBe("Class 1");
    expect(columns[1].cell(sampleClass)).toBe(15);
    expect(columns[2].filterAccessor?.(sampleClass)).toBe("ACTIVE");
  });
});
