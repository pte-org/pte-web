"use client";

import { useState, type FormEvent, type ReactElement, type ReactNode } from "react";
import {
  submitForgotPassword,
  validateNewPassword,
  type NewPasswordProblem,
} from "../utils/passwordReset";
import { AuthSubmitButton, AuthTextField } from "./AuthFormControls";
import { EyeIcon, LockIcon, MailIcon } from "./AuthIcons";

const EMAIL_FIELD_ID = "forgot-email";

// These forms render only their content. The app places them in `AuthBrandShell`, the same frame as the
// sign-in page (artwork, animated backdrop, theme toggle), so the content must not bring its own page.

const Heading = ({ title, subtitle }: { title: string; subtitle: string }): ReactElement => (
  <div>
    <h1 className="text-[2rem] font-extrabold leading-tight tracking-[-0.025em] text-[var(--ink-primary)]">
      {title}
    </h1>
    <p className="mt-2 text-[15px] leading-relaxed text-[var(--ink-secondary)]">{subtitle}</p>
  </div>
);

const ErrorNotice = ({ message }: { message: string }): ReactElement => (
  <div
    role="alert"
    className="rounded-md bg-[var(--blush-tint)] px-3 py-2 text-sm text-[var(--blush-action)]"
  >
    {message}
  </div>
);

export interface ForgotPasswordFormText {
  title: string;
  subtitle: string;
  emailLabel: string;
  submit: string;
  submitting: string;
  required: string;
  sentTitle: string;
  sentMessage: string;
}

export interface ForgotPasswordFormProps {
  text: ForgotPasswordFormText;
  /** Asks the server for a reset link. Any failure is hidden from the user on purpose. */
  onSubmit: (email: string) => Promise<unknown>;
  /** Usually the "back to sign in" link, rendered by the app so it can use its own router link. */
  footer?: ReactNode;
}

/** Asks for an email and always ends on the same "check your inbox" notice. */
export const ForgotPasswordForm = ({
  text,
  onSubmit,
  footer,
}: ForgotPasswordFormProps): ReactElement => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setPending(true);
    const outcome = await submitForgotPassword(email, onSubmit);
    setPending(false);
    if (outcome === "EMAIL_REQUIRED") {
      setError(text.required);
      return;
    }
    setError(undefined);
    setSent(true);
  };

  if (sent) {
    return (
      <>
        <Heading title={text.sentTitle} subtitle={text.sentMessage} />
        {footer}
      </>
    );
  }

  return (
    <>
      <Heading title={text.title} subtitle={text.subtitle} />
      {error && <ErrorNotice message={error} />}
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-[18px]">
        <AuthTextField
          id={EMAIL_FIELD_ID}
          type="email"
          autoComplete="email"
          label={text.emailLabel}
          icon={<MailIcon />}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <AuthSubmitButton disabled={pending}>{pending ? text.submitting : text.submit}</AuthSubmitButton>
      </form>
      {footer}
    </>
  );
};

export interface ResetPasswordFormText {
  title: string;
  subtitle: string;
  newLabel: string;
  confirmLabel: string;
  submit: string;
  submitting: string;
  required: string;
  tooShort: string;
  mismatch: string;
  invalidLinkTitle: string;
  invalidLinkMessage: string;
  showPassword: string;
  hidePassword: string;
}

export interface ResetPasswordFormProps {
  text: ResetPasswordFormText;
  /** False when the link carries no token; the form is replaced by an explanation. */
  hasToken: boolean;
  /** Spends the link. The parent shows a failure through {@link error}; this promise must not reject. */
  onSubmit: (newPassword: string) => Promise<void>;
  /** Server-side failure to show above the form, e.g. an expired link. */
  error?: string;
  footer?: ReactNode;
}

const problemText = (text: ResetPasswordFormText, problem: NewPasswordProblem): string =>
  problem === "TOO_SHORT" ? text.tooShort : problem === "MISMATCH" ? text.mismatch : text.required;

/** Chooses a new password for a link that arrived by email. */
export const ResetPasswordForm = ({
  text,
  hasToken,
  onSubmit,
  error,
  footer,
}: ResetPasswordFormProps): ReactElement => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string>();
  const [pending, setPending] = useState(false);

  if (!hasToken) {
    return (
      <>
        <Heading title={text.invalidLinkTitle} subtitle={text.invalidLinkMessage} />
        {footer}
      </>
    );
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const problem = validateNewPassword(newPassword, confirmation);
    if (problem) {
      setLocalError(problemText(text, problem));
      return;
    }
    setLocalError(undefined);
    setPending(true);
    try {
      await onSubmit(newPassword);
    } finally {
      setPending(false);
    }
  };

  const shownError = localError ?? error;
  const toggle = (
    <button
      type="button"
      onClick={() => setShowPassword((value) => !value)}
      aria-label={showPassword ? text.hidePassword : text.showPassword}
      className="shrink-0 text-[var(--ink-muted)] hover:text-[var(--ink-primary)]"
    >
      <EyeIcon closed={showPassword} className="h-[18px] w-[18px]" />
    </button>
  );

  return (
    <>
      <Heading title={text.title} subtitle={text.subtitle} />
      {shownError && <ErrorNotice message={shownError} />}
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-[18px]">
        <AuthTextField
          id="reset-new-password"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          label={text.newLabel}
          icon={<LockIcon />}
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          trailing={toggle}
        />
        <AuthTextField
          id="reset-confirm-password"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          label={text.confirmLabel}
          icon={<LockIcon />}
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
        />
        <AuthSubmitButton disabled={pending}>{pending ? text.submitting : text.submit}</AuthSubmitButton>
      </form>
      {footer}
    </>
  );
};
