"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AuthSubmitButton,
  AuthTextField,
  EyeIcon,
  LockIcon,
  MailIcon,
  Select,
  useSessionManager,
  useSignInValidation,
  type SignInValidationMessages,
} from "@pte/ui";
import {
  decodeAccessTokenClaims,
  type LoginOrganizationOption,
  type JwtTokenResponse,
} from "@pte/api-client";
import { useLoginHost, useLoginOrganizationOptions } from "../api";
import { AUTH_ROUTES, AUTH_TEXT } from "../constants";
import { resolveWorkspace } from "../resolveWorkspace";
import { decidePortalLogin } from "../sessionRoles";
import { getLoginErrorMessage } from "../loginError";

const LABEL_CLASS = "text-[13px] font-semibold text-[var(--ink-secondary)]";

const VALIDATION_MESSAGES: SignInValidationMessages = {
  usernameRequired: AUTH_TEXT.USERNAME_REQUIRED,
  usernameInvalidEmail: AUTH_TEXT.USERNAME_INVALID_EMAIL,
  passwordRequired: AUTH_TEXT.PASSWORD_REQUIRED,
};

export const LoginView = (): ReactElement => {
  const router = useRouter();
  const { saveSession } = useSessionManager();
  const validation = useSignInValidation(VALIDATION_MESSAGES);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [organizationOptions, setOrganizationOptions] = useState<LoginOrganizationOption[]>([]);
  const [organizationId, setOrganizationId] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  const mutation = useLoginHost();
  const organizationMutation = useLoginOrganizationOptions();

  const handleLoginSuccess = (data: JwtTokenResponse): void => {
    const claims = decodeAccessTokenClaims(data.accessToken);
    if (!claims) {
      setErrorMessage(AUTH_TEXT.GENERIC_ERROR);
      return;
    }
    // No session is saved in either refusal below.
    const decision = decidePortalLogin(claims.roles);
    if (decision.kind === "student") {
      // A student's scores arrive by email, never through this portal.
      setErrorMessage(AUTH_TEXT.STUDENT_ACCOUNT_NOT_ALLOWED);
      return;
    }
    if (decision.kind === "denied") {
      // The same copy as a wrong password, so the form does not reveal that the account exists elsewhere.
      setErrorMessage(AUTH_TEXT.INVALID_CREDENTIALS);
      return;
    }
    const { roles } = decision;
    saveSession({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      roles,
      tenantId: claims.tenantId,
      expiresAt: claims.expiresAt || Date.now() + data.expiresInSeconds * 1000,
      mustChangePassword: data.mustChangePassword,
    });
    const { defaultRoute } = resolveWorkspace(roles);
    router.replace(defaultRoute);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const fieldErrors = validation.validateAll({ username, password });
    if (fieldErrors.username || fieldErrors.password) {
      setErrorMessage(undefined);
      document.getElementById(fieldErrors.username ? "username" : "password")?.focus();
      return;
    }
    if (organizationOptions.length > 0 && !organizationId) {
      setErrorMessage(AUTH_TEXT.ORGANIZATION_REQUIRED);
      return;
    }
    setErrorMessage(undefined);
    try {
      const trimmedUsername = username.trim();
      let selectedOrganizationId = organizationId || undefined;
      if (!selectedOrganizationId && organizationOptions.length === 0) {
        const options = await organizationMutation.mutateAsync({
          username: trimmedUsername,
          password,
        });
        if (options.length > 1) {
          setOrganizationOptions(options);
          return;
        }
        selectedOrganizationId = options[0]?.tenantId;
      }
      const data = await mutation.mutateAsync({
        username: trimmedUsername,
        password,
        ...(selectedOrganizationId ? { tenantId: selectedOrganizationId } : {}),
      });
      handleLoginSuccess(data);
    } catch (error) {
      setErrorMessage(getLoginErrorMessage(error));
    }
  };

  return (
    <>
      <div>
        <h1 className="text-[2rem] font-extrabold leading-tight tracking-[-0.025em] text-[var(--ink-primary)]">
          {AUTH_TEXT.WELCOME_TITLE}
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-[var(--ink-secondary)]">
          {AUTH_TEXT.WELCOME_SUBTITLE}
        </p>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="rounded-md bg-[var(--blush-tint)] px-3 py-2 text-sm text-[var(--blush-action)]"
        >
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-[18px]">
        {/* type="text", NOT type="email": a STUDENT's username is
            `{tenant.code}.{random}`, which the browser would reject
            as an invalid email before the request is ever sent. */}
        <AuthTextField
          id="username"
          type="text"
          autoComplete="username"
          label={AUTH_TEXT.USERNAME_LABEL}
          icon={<MailIcon />}
          hint={AUTH_TEXT.USERNAME_HINT}
          error={validation.errors.username}
          value={username}
          onChange={(event) => {
            setUsername(event.target.value);
            validation.onChange("username", event.target.value);
            setOrganizationOptions([]);
            setOrganizationId("");
          }}
          onBlur={(event) => validation.onBlur("username", event.target.value)}
          placeholder={AUTH_TEXT.USERNAME_PLACEHOLDER}
        />

        <div className="flex flex-col gap-2">
          <AuthTextField
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            label={AUTH_TEXT.PASSWORD_LABEL}
            icon={<LockIcon />}
            placeholder={AUTH_TEXT.PASSWORD_PLACEHOLDER}
            error={validation.errors.password}
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              validation.onChange("password", event.target.value);
              setOrganizationOptions([]);
              setOrganizationId("");
            }}
            onBlur={(event) => validation.onBlur("password", event.target.value)}
            trailing={
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? AUTH_TEXT.HIDE_PASSWORD : AUTH_TEXT.SHOW_PASSWORD}
                className="shrink-0 text-[var(--ink-muted)] hover:text-[var(--ink-primary)]"
              >
                <EyeIcon closed={showPassword} className="h-[18px] w-[18px]" />
              </button>
            }
          />
          <Link
            href={AUTH_ROUTES.forgotPassword}
            className="self-end text-[13px] font-semibold text-[var(--brand-ink)] hover:underline"
          >
            {AUTH_TEXT.FORGOT}
          </Link>
        </div>

        {organizationOptions.length > 0 && (
          <div className="flex flex-col gap-1">
            <label htmlFor="organization" className={LABEL_CLASS}>
              {AUTH_TEXT.ORGANIZATION_LABEL}
            </label>
            <Select
              id="organization"
              value={organizationId}
              onChange={(event) => setOrganizationId(event.target.value)}
              placeholder={AUTH_TEXT.ORGANIZATION_PLACEHOLDER}
              options={organizationOptions.map((option) => ({
                value: option.tenantId,
                label: `${option.organizationName} (${option.tenantCode})`,
              }))}
            />
          </div>
        )}

        <AuthSubmitButton disabled={mutation.isPending || organizationMutation.isPending}>
          {mutation.isPending || organizationMutation.isPending
            ? AUTH_TEXT.LOGGING_IN
            : AUTH_TEXT.LOGIN_BUTTON}
        </AuthSubmitButton>
      </form>
    </>
  );
};
