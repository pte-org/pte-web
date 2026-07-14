"use client";

import { useState, type ReactElement } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { EyeIcon } from "./AuthIcons";
import { Input } from "./Input";

interface PasswordInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
}

const SHOW_PASSWORD_LABEL = "Show password";
const HIDE_PASSWORD_LABEL = "Hide password";

export const PasswordInput = ({
  leftIcon,
  ...props
}: PasswordInputProps): ReactElement => {
  const [visible, setVisible] = useState(false);

  return (
    <Input
      {...props}
      type={visible ? "text" : "password"}
      leftIcon={leftIcon}
      rightAction={
        <button
          type="button"
          aria-label={visible ? HIDE_PASSWORD_LABEL : SHOW_PASSWORD_LABEL}
          className="text-gray-400 hover:text-gray-600"
          onClick={() => setVisible((value) => !value)}
        >
          <EyeIcon closed={visible} className="h-4 w-4" />
        </button>
      }
    />
  );
};
