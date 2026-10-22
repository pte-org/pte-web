import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactElement, ReactNode } from "react";
import { cn } from "../utils/cn";
import { CheckIcon } from "./icons";

export interface AuthTextFieldProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "className"
> {
  id: string;
  label: string;
  /** Leading icon; it takes the brand colour and grows slightly while the field has focus. */
  icon: ReactNode;
  /** Helper text under the field. */
  hint?: ReactNode;
  /** Control rendered after the filled tick, e.g. a show-password button. */
  trailing?: ReactNode;
}

/**
 * Sign-in text field: label above a 50px control with a focus glow, an icon that lights up on
 * focus and a tick that pops in once the field has content. The tick means "filled", not "valid".
 */
export const AuthTextField = ({
  id,
  label,
  icon,
  hint,
  trailing,
  value,
  ...inputProps
}: AuthTextFieldProps): ReactElement => {
  const filled =
    typeof value === "string" ? value.length > 0 : value !== undefined && value !== null;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-semibold text-[var(--ink-secondary)]">
        {label}
      </label>
      <div className="group flex h-[50px] items-center gap-2.5 rounded-[10px] border-[1.5px] border-[var(--control-border)] bg-[var(--surface-card)] px-3.5 transition-[border-color,box-shadow] duration-200 focus-within:border-[var(--brand)] focus-within:ring-4 focus-within:ring-[var(--brand)]/15">
        <span className="flex shrink-0 text-[var(--ink-muted)] transition-[color,transform] duration-200 group-focus-within:scale-110 group-focus-within:text-[var(--brand)] [&>svg]:h-[18px] [&>svg]:w-[18px]">
          {icon}
        </span>
        <input
          id={id}
          value={value}
          {...inputProps}
          className="h-full w-full min-w-0 bg-transparent text-[15px] text-[var(--ink-primary)] outline-none placeholder:text-[var(--ink-muted)]"
        />
        <span
          aria-hidden="true"
          className={cn(
            "flex shrink-0 text-[var(--mint-action)] transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.3,1.6,0.5,1)]",
            filled ? "scale-100 opacity-100" : "scale-50 opacity-0",
          )}
        >
          <CheckIcon className="h-[18px] w-[18px]" />
        </span>
        {trailing}
      </div>
      {hint && <p className="text-[12.5px] text-[var(--ink-muted)]">{hint}</p>}
    </div>
  );
};

export type AuthSubmitButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "className" | "type"
>;

/** Full-width sign-in button whose gradient slides on hover and which presses in on click. */
export const AuthSubmitButton = ({
  children,
  ...buttonProps
}: AuthSubmitButtonProps): ReactElement => (
  <button
    type="submit"
    {...buttonProps}
    className="h-[50px] w-full rounded-[10px] bg-[linear-gradient(90deg,var(--action-gradient-start),var(--action-gradient-mid),var(--action-gradient-end),var(--action-gradient-start))] bg-[length:200%_100%] bg-left text-[15px] font-semibold text-white shadow-lg shadow-action/30 transition-[background-position,transform,opacity] duration-500 hover:bg-right active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60"
  >
    {children}
  </button>
);
