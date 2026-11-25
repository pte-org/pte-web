"use client";

import { useLocale } from "@pte/ui";
import {
  CREATE_PROGRAM_EN,
  CREATE_PROGRAM_VI,
  type CreateProgramMessages,
} from "../constants/createProgramMessages";

export const useCreateProgramText = (programLabel = "Program") => {
  const { locale, t } = useLocale();
  const catalog = locale === "vi" ? CREATE_PROGRAM_VI : CREATE_PROGRAM_EN;
  const values = {
    program: programLabel,
    programLower: programLabel.toLowerCase(),
  };

  const getText = (key: keyof CreateProgramMessages): string =>
    t(`tenant.programs.${key}`, catalog[key], values);

  return {
    locale,
    title: getText("createModalTitle"),
    nameLabel: getText("nameLabel"),
    namePlaceholder: getText("namePlaceholder"),
    descriptionLabel: getText("descriptionLabel"),
    startDateLabel: getText("startDateLabel"),
    endDateLabel: getText("endDateLabel"),
    cancel: getText("cancel"),
    submit: getText("submit"),
    submitting: getText("submitting"),
    nameRequired: getText("nameRequired"),
    endDateBeforeStartDate: getText("endDateBeforeStartDate"),
  };
};
