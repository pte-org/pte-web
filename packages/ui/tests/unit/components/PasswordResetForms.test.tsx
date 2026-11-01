import { describe, expect, it } from "vitest";
import { renderHtml } from "../testing/renderHtml";
import {
  ForgotPasswordForm,
  ResetPasswordForm,
  type ForgotPasswordFormText,
  type ResetPasswordFormText,
} from "../../../src/components/PasswordResetForms";

const forgotText: ForgotPasswordFormText = {
  title: "Forgot your password?",
  subtitle: "Enter your email and we will send you a link.",
  emailLabel: "Email",
  submit: "Send reset link",
  submitting: "Sending...",
  required: "Enter your email address.",
  sentTitle: "Check your inbox",
  sentMessage: "If the email is registered, a reset link is on its way.",
};

const resetText: ResetPasswordFormText = {
  title: "Choose a new password",
  subtitle: "The link works once.",
  newLabel: "New password",
  confirmLabel: "Confirm new password",
  submit: "Reset password",
  submitting: "Saving...",
  required: "Enter both password fields.",
  tooShort: "Use at least 8 characters.",
  mismatch: "The passwords do not match.",
  invalidLinkTitle: "This link cannot be used",
  invalidLinkMessage: "The link is invalid or has expired.",
  showPassword: "Show password",
  hidePassword: "Hide password",
  checkingTitle: "Checking your link",
  checkingMessage: "One moment while we make sure it can still be used.",
};

describe("ForgotPasswordForm", () => {
  it("asks for an email and offers the footer link", () => {
    const html = renderHtml(
      <ForgotPasswordForm text={forgotText} onSubmit={async () => undefined} footer={<a href="/login">Back</a>} />,
    );

    expect(html).toContain("Forgot your password?");
    expect(html).toMatch(/<label for="forgot-email"[^>]*>Email<\/label>/);
    expect(html).toContain("Send reset link");
    expect(html).toContain('href="/login"');
    expect(html).not.toContain("Check your inbox");
  });

  it("renders only the form content so the sign-in frame can host it", () => {
    const html = renderHtml(<ForgotPasswordForm text={forgotText} onSubmit={async () => undefined} />);

    expect(html).not.toContain("<main");
    expect(html).not.toContain("min-h-screen");
  });
});

describe("ResetPasswordForm", () => {
  it("shows both password fields for a link that carries a token", () => {
    const html = renderHtml(
      <ResetPasswordForm text={resetText} hasToken onSubmit={async () => undefined} error={undefined} />,
    );

    expect(html).toContain("Choose a new password");
    expect(html).toMatch(/<label for="reset-new-password"[^>]*>New password<\/label>/);
    expect(html).toMatch(/<label for="reset-confirm-password"[^>]*>Confirm new password<\/label>/);
    expect(html).not.toContain("This link cannot be used");
  });

  it("offers a show-password control on the fields", () => {
    const html = renderHtml(
      <ResetPasswordForm text={resetText} hasToken onSubmit={async () => undefined} />,
    );

    expect(html).toContain('aria-label="Show password"');
  });

  it("renders only the form content so the sign-in frame can host it", () => {
    const html = renderHtml(
      <ResetPasswordForm text={resetText} hasToken onSubmit={async () => undefined} />,
    );

    expect(html).not.toContain("<main");
  });

  it("explains an unusable link instead of showing the form when the token is missing", () => {
    const html = renderHtml(
      <ResetPasswordForm
        text={resetText}
        hasToken={false}
        onSubmit={async () => undefined}
        footer={<a href="/forgot-password">Request a new link</a>}
      />,
    );

    expect(html).toContain("This link cannot be used");
    expect(html).toContain("Request a new link");
    expect(html).not.toContain("Confirm new password");
  });

  it("shows the error the server returned", () => {
    const html = renderHtml(
      <ResetPasswordForm text={resetText} hasToken onSubmit={async () => undefined} error="Link expired" />,
    );

    expect(html).toContain("Link expired");
    expect(html).toContain('role="alert"');
  });
});

describe("motion", () => {
  it("leaves the animation to the sign-in frame, so nothing plays twice", () => {
    const forgot = renderHtml(<ForgotPasswordForm text={forgotText} onSubmit={async () => undefined} />);
    const reset = renderHtml(<ResetPasswordForm text={resetText} hasToken onSubmit={async () => undefined} />);
    const unusable = renderHtml(
      <ResetPasswordForm text={resetText} hasToken={false} onSubmit={async () => undefined} />,
    );

    for (const html of [forgot, reset, unusable]) {
      expect(html).not.toContain("animate-pte-fade-up");
      expect(html).not.toContain("animate-pte-fade-in");
    }
  });
});

describe("ResetPasswordForm while the link is being checked", () => {
  it("shows a neutral wait, not the form and not an error", () => {
    const html = renderHtml(<ResetPasswordForm text={resetText} hasToken checking onSubmit={async () => undefined} />);

    expect(html).toContain("Checking your link");
    expect(html).toContain("One moment");
    expect(html).not.toContain("Confirm new password");
    expect(html).not.toContain("This link cannot be used");
  });

  it("goes back to the form once the check says the link is fine", () => {
    const html = renderHtml(<ResetPasswordForm text={resetText} hasToken onSubmit={async () => undefined} />);

    expect(html).not.toContain("Checking your link");
    expect(html).toContain("Confirm new password");
  });
});
