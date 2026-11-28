"use client";

import { useLocale } from "@pte/ui";
import { USER_MANAGEMENT_TEXT as T } from "../constants";

const KEY = "tenant.userManagement.";

export interface UserManagementText {
  accountDetailsTitle: string;
  passwordsNotShown: string;
  username: string;
  email: string;
  fullName: string;
  roles: string;
  status: string;
  passwordChange: string;
  studentCode: string;
  className: string;
  phone: string;
  dateOfBirth: string;
  suspended: string;
  active: string;
  required: string;
  notRequired: string;
  emptyValue: string;
  credentialsTitle: string;
  done: string;
  temporaryPassword: string;
  emailDelivery: (email: string) => string;
  noEmailDelivery: string;
}

/** The account dialogs' copy in the viewer's language; the English fallbacks live in `constants.ts`. */
export const useUserManagementText = (): UserManagementText => {
  const { t } = useLocale();
  return {
    accountDetailsTitle: t(`${KEY}accountDetailsTitle`, T.ACCOUNT_DETAILS_TITLE),
    passwordsNotShown: t(`${KEY}passwordsNotShown`, T.PASSWORDS_NOT_SHOWN),
    username: t(`${KEY}username`, T.USERNAME),
    email: t(`${KEY}email`, T.EMAIL),
    fullName: t(`${KEY}fullName`, T.FULL_NAME),
    roles: t(`${KEY}roles`, T.ROLES),
    status: t(`${KEY}status`, T.STATUS),
    passwordChange: t(`${KEY}passwordChange`, T.PASSWORD_CHANGE),
    studentCode: t(`${KEY}studentCode`, T.STUDENT_CODE),
    className: t(`${KEY}class`, T.CLASS),
    phone: t(`${KEY}phone`, T.PHONE),
    dateOfBirth: t(`${KEY}dateOfBirth`, T.DATE_OF_BIRTH),
    suspended: t(`${KEY}suspended`, T.SUSPENDED),
    active: t(`${KEY}active`, T.ACTIVE),
    required: t(`${KEY}required`, T.REQUIRED),
    notRequired: t(`${KEY}notRequired`, T.NOT_REQUIRED),
    emptyValue: T.EMPTY_VALUE,
    credentialsTitle: t(`${KEY}credentialsTitle`, T.CREDENTIALS_TITLE),
    done: t("common.done", T.DONE),
    temporaryPassword: t(`${KEY}temporaryPassword`, T.TEMPORARY_PASSWORD),
    emailDelivery: (email) => t(`${KEY}emailDelivery`, T.EMAIL_DELIVERY(email), { email }),
    noEmailDelivery: t(`${KEY}noEmailDelivery`, T.NO_EMAIL_DELIVERY),
  };
};
