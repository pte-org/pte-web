"use client";

import { useLocale } from "@pte/ui";
import { MANAGE_STUDENTS_TEXT } from "../constants";
import { MANAGE_STUDENTS_TEXT_VI } from "../messages/manageStudentsVi";

type Widen<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => infer R ? (...args: A) => R : string;
};

/** Same shape as the English constants, widened so a Vietnamese catalog can satisfy it. */
export type ManageStudentsText = Widen<typeof MANAGE_STUDENTS_TEXT>;

export const useManageStudentsText = (): ManageStudentsText => {
  const { locale } = useLocale();
  return locale === "vi" ? MANAGE_STUDENTS_TEXT_VI : MANAGE_STUDENTS_TEXT;
};
