"use client";

import Link from "next/link";
import type { ReactElement } from "react";
import { BackButton, type BackButtonProps } from "@pte/ui";

export const AppBackButton = (props: BackButtonProps): ReactElement => (
  <BackButton {...props} renderLink={(linkProps) => <Link {...linkProps} />} />
);
