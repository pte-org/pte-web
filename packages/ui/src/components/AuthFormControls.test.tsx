import { describe, expect, it } from "vitest";
import { countMatches, renderHtml } from "../testing/renderHtml";
import { AuthSubmitButton, AuthTextField, type AuthTextFieldProps } from "./AuthFormControls";

const renderField = (props: Partial<AuthTextFieldProps> = {}): string =>
  renderHtml(
    <AuthTextField
      id="username"
      label="Username"
      icon={<svg data-testid="icon" />}
      value=""
      onChange={() => undefined}
      {...props}
    />,
  );

describe("AuthTextField", () => {
  it("labels the input by id and forwards input attributes", () => {
    const html = renderField({ autoComplete: "username", placeholder: "host@school.edu.vn" });
    expect(html).toMatch(/<label for="username"[^>]*>Username<\/label>/);
    expect(html).toMatch(/<input id="username"[^>]*autoComplete="username"/i);
    expect(html).toContain('placeholder="host@school.edu.vn"');
    expect(html).toContain('data-testid="icon"');
  });

  it("hides the filled tick while the field is empty", () => {
    expect(renderField({ value: "" })).toMatch(/aria-hidden="true" class="[^"]*scale-50 opacity-0/);
  });

  it("pops the filled tick in once the field has content", () => {
    expect(renderField({ value: "admin" })).toMatch(
      /aria-hidden="true" class="[^"]*scale-100 opacity-100/,
    );
  });

  it("renders the hint and the trailing control only when given", () => {
    expect(renderField()).not.toMatch(/<p[\s>]/);
    const html = renderField({
      hint: "Use your email",
      trailing: <button type="button">EYE</button>,
    });
    expect(html).toContain(">Use your email</p>");
    expect(html).toContain('<button type="button">EYE</button>');
  });
});

describe("AuthTextField error state", () => {
  it("marks the input invalid, links the message and replaces the hint", () => {
    const html = renderField({
      value: "",
      hint: "Use your email",
      error: "Please enter your username.",
    });
    expect(html).toMatch(/<input[^>]*aria-invalid="true"/);
    expect(html).toMatch(/<input[^>]*aria-describedby="username-error"/);
    expect(html).toMatch(/<p id="username-error"[^>]*>Please enter your username\.<\/p>/);
    expect(html).not.toContain("Use your email");
  });

  it("hides the tick while the field has an error even if it has content", () => {
    expect(renderField({ value: "a b", error: "No spaces" })).toMatch(
      /aria-hidden="true" class="[^"]*scale-50 opacity-0/,
    );
  });

  it("links the hint when there is no error", () => {
    const html = renderField({ hint: "Use your email" });
    expect(html).not.toContain("aria-invalid");
    expect(html).toMatch(/<input[^>]*aria-describedby="username-hint"/);
    expect(html).toMatch(/<p id="username-hint"[^>]*>Use your email<\/p>/);
  });
});

describe("AuthSubmitButton", () => {
  it("is always a submit button and forwards disabled", () => {
    const html = renderHtml(<AuthSubmitButton disabled>Login</AuthSubmitButton>);
    expect(html).toMatch(/<button type="submit" disabled=""[^>]*>Login<\/button>/);
    expect(countMatches(html, /<button/)).toBe(1);
  });
});
