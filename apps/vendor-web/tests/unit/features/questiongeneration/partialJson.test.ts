import { describe, expect, it } from "vitest";
import { lastTopLevelKey, parsePartialJson } from "../../../../features/questiongeneration/utils/partialJson";

describe("parsePartialJson", () => {
  it("shows a string value as far as it is written", () => {
    expect(parsePartialJson('{"topic":"Bees","passage":"The city coun')).toEqual({
      topic: "Bees",
      passage: "The city coun",
    });
  });

  it("leaves out a key whose value has not started", () => {
    expect(parsePartialJson('{"topic":"Bees","passage":')).toEqual({ topic: "Bees" });
    expect(parsePartialJson('{"topic":"Bees","pass')).toEqual({ topic: "Bees" });
    expect(parsePartialJson('{"to')).toEqual({});
  });

  it("closes open arrays and nested objects", () => {
    expect(parsePartialJson('{"options":["red","gre')).toEqual({ options: ["red", "gre"] });
    expect(parsePartialJson('{"slots":[{"answer":"cat","distractors":["dog",')).toEqual({
      slots: [{ answer: "cat", distractors: ["dog"] }],
    });
  });

  it("drops a number or literal cut in the middle", () => {
    expect(parsePartialJson('{"correctIndexes":[1,')).toEqual({ correctIndexes: [1] });
    expect(parsePartialJson('{"ok":tr')).toEqual({});
    expect(parsePartialJson('{"value":12.')).toEqual({});
  });

  it("drops an escape cut in the middle", () => {
    expect(parsePartialJson('{"text":"say \\"hi\\" and \\')).toEqual({ text: 'say "hi" and ' });
    expect(parsePartialJson('{"text":"caf\\u00')).toEqual({ text: "caf" });
  });

  it("reads a fenced answer and a complete one", () => {
    expect(parsePartialJson('```json\n{"a":1}\n```')).toEqual({ a: 1 });
    expect(parsePartialJson('```json\n{"a":"b')).toEqual({ a: "b" });
  });

  it("has nothing to show before the object starts", () => {
    expect(parsePartialJson("")).toBeUndefined();
    expect(parsePartialJson("```json\n")).toBeUndefined();
  });
});

describe("lastTopLevelKey", () => {
  it("names the field written last", () => {
    expect(lastTopLevelKey({ topic: "a", passage: "b" })).toBe("passage");
    expect(lastTopLevelKey({})).toBeNull();
    expect(lastTopLevelKey(["a"])).toBeNull();
  });
});
