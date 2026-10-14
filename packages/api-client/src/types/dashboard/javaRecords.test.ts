import { describe, expect, it } from "vitest";
import { parseJavaEnum, parseJavaSource, parseJavaType, stripComments } from "./javaRecords";

/**
 * Guards the Java reader that `contract.test.ts` relies on: if it silently returned empty
 * records, every conformance assertion would pass vacuously.
 */

describe("stripComments", () => {
  it("blanks line and block comments but keeps code, strings and offsets", () => {
    const source = 'int a; // trailing record Fake(long x)\n/* record Hidden(long y) */ String s = "//kept";';
    const stripped = stripComments(source);

    expect(stripped).toHaveLength(source.length);
    expect(stripped).not.toContain("Fake");
    expect(stripped).not.toContain("Hidden");
    expect(stripped).toContain('"//kept"');
    expect(stripped).toContain("int a;");
  });

  it("handles an unterminated block comment without throwing", () => {
    expect(stripComments("record A(long x) /* never closed")).toContain("record A(long x)");
  });
});

describe("parseJavaType", () => {
  it("parses scalars, qualified names and nested generics", () => {
    expect(parseJavaType("long")).toEqual({ name: "long", args: [] });
    expect(parseJavaType("HostSectionData.Learners")).toEqual({ name: "HostSectionData.Learners", args: [] });
    expect(parseJavaType("Map<String, Long>")).toEqual({
      name: "Map",
      args: [
        { name: "String", args: [] },
        { name: "Long", args: [] },
      ],
    });
    expect(parseJavaType("DashboardSection<List<ActivityItem>>")).toEqual({
      name: "DashboardSection",
      args: [{ name: "List", args: [{ name: "ActivityItem", args: [] }] }],
    });
  });

  it("parses arrays as a list-like type", () => {
    expect(parseJavaType("String[]")).toEqual({ name: "[]", args: [{ name: "String", args: [] }] });
  });
});

describe("parseJavaSource", () => {
  const SOURCE = `
    package com.example;

    import com.example.Wrapper.Inner;
    import java.util.Map;

    /** Javadoc with {@code record Ghost(long x)} and braces { } */
    public final class Wrapper {
        /** Nested: Map<String, Long> with a comma, inside a record header. */
        public record Inner(long total, Map<String, Long> counts,
                @Nullable String note) {
            public long twice() { return total * 2; }
        }

        public record Pair<A>(A first, java.util.List<Inner> inners) {
        }
    }

    record Standalone(int n, Double ratio) {}
  `;
  const parsed = parseJavaSource(SOURCE);

  it("reads imports", () => {
    expect(parsed.imports).toEqual(["com.example.Wrapper.Inner", "java.util.Map"]);
  });

  it("finds nested and top-level records and ignores comments", () => {
    expect(parsed.records.map((r) => r.qualifiedName)).toEqual([
      "Wrapper.Inner",
      "Wrapper.Pair",
      "Standalone",
    ]);
    expect(parsed.records[2].outer).toBeNull();
  });

  it("keeps generic components whole and drops annotations", () => {
    const inner = parsed.records[0];

    expect(inner.components.map((c) => c.name)).toEqual(["total", "counts", "note"]);
    expect(inner.components[1].type.name).toBe("Map");
    expect(inner.components[1].type.args).toHaveLength(2);
    expect(inner.components[2].type.name).toBe("String");
  });

  it("supports record type parameters and qualified generic arguments", () => {
    const pair = parsed.records[1];

    expect(pair.components.map((c) => c.name)).toEqual(["first", "inners"]);
    expect(pair.components[1].type).toEqual({
      name: "java.util.List",
      args: [{ name: "Inner", args: [] }],
    });
  });

  it("reports a source without records as empty", () => {
    expect(parseJavaSource("public enum Only { A, B }").records).toEqual([]);
  });
});

describe("parseJavaEnum", () => {
  it("reads constants in declaration order, ignoring comments and trailing members", () => {
    const parsed = parseJavaEnum(`
      package x;
      /** doc */
      public enum Status {
          /** first */ DRAFT,
          READY, // inline
          DONE;

          public boolean terminal() { return this == DONE; }
      }
    `);

    expect(parsed).toEqual({ name: "Status", constants: ["DRAFT", "READY", "DONE"] });
  });

  it("returns null when a file declares no enum", () => {
    expect(parseJavaEnum("public record R(long x) {}")).toBeNull();
  });
});
