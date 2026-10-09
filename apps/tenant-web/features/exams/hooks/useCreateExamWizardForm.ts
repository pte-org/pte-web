"use client";

import { useCallback, useMemo, useReducer } from "react";
import type { CreateExamWorkflowInput, ExamSkill } from "../types";
import {
  applyExamModeChange,
  createEmptyExamWorkflow,
  filterWorkflowErrors,
  getCreateExamStepFields,
  getEffectiveExamWorkflowForm,
  type CreateExamStep,
  type ValidatableCreateExamStep,
} from "../utils/createExamWizard";
import {
  validateCreateExamWorkflow,
  type CreateExamWorkflowErrors,
} from "../utils/validateCreateExamWorkflow";

interface CreateExamWizardFormState {
  form: CreateExamWorkflowInput;
  step: CreateExamStep;
  errors: CreateExamWorkflowErrors;
}

type UpdateFormAction = {
  [K in keyof CreateExamWorkflowInput]: {
    type: "update";
    field: K;
    value: CreateExamWorkflowInput[K];
  };
}[keyof CreateExamWorkflowInput];

type CreateExamWizardFormAction =
  | UpdateFormAction
  | {
      type: "change-mode";
      examMode: CreateExamWorkflowInput["examMode"];
      templateSkills: readonly ExamSkill[];
    }
  | { type: "set-errors"; errors: CreateExamWorkflowErrors }
  | {
      type: "set-field-error";
      field: keyof CreateExamWorkflowErrors;
      message?: string;
    }
  | { type: "set-step"; step: CreateExamStep }
  | { type: "reset"; initialForm: CreateExamWorkflowInput };

export interface UseCreateExamWizardFormOptions {
  initialForm?: CreateExamWorkflowInput;
  activeTemplatePublicId?: string;
  templateSkills: readonly ExamSkill[];
}

function createInitialForm(
  initialForm: CreateExamWorkflowInput | undefined,
): CreateExamWorkflowInput {
  return initialForm ?? createEmptyExamWorkflow();
}

function clearFieldError(
  errors: CreateExamWorkflowErrors,
  field: keyof CreateExamWorkflowInput,
): CreateExamWorkflowErrors {
  switch (field) {
    case "name":
    case "templatePublicId":
    case "subscriptionPublicId":
    case "opensAt":
    case "closesAt":
    case "capacity":
    case "seriesKey":
    case "selectedSkills":
    case "maxRetriesPerStudent":
    case "sources":
      return { ...errors, [field]: undefined };
    default:
      return errors;
  }
}

function createInitialState(initialForm: CreateExamWorkflowInput): CreateExamWizardFormState {
  return {
    form: initialForm,
    step: 1,
    errors: {},
  };
}

function formReducer(
  state: CreateExamWizardFormState,
  action: CreateExamWizardFormAction,
): CreateExamWizardFormState {
  switch (action.type) {
    case "update": {
      const form = {
        ...state.form,
        [action.field]: action.value,
      } as CreateExamWorkflowInput;

      return {
        ...state,
        form,
        errors: clearFieldError(state.errors, action.field),
      };
    }
    case "change-mode":
      return {
        ...state,
        form: applyExamModeChange(state.form, action.examMode, action.templateSkills),
        errors: { ...state.errors, seriesKey: undefined },
      };
    case "set-errors":
      return { ...state, errors: action.errors };
    case "set-field-error":
      return {
        ...state,
        errors: { ...state.errors, [action.field]: action.message },
      };
    case "set-step":
      return { ...state, step: action.step };
    case "reset":
      return createInitialState(action.initialForm);
    default:
      return state;
  }
}

export interface UseCreateExamWizardFormResult {
  form: CreateExamWorkflowInput;
  effectiveForm: CreateExamWorkflowInput;
  step: CreateExamStep;
  errors: CreateExamWorkflowErrors;
  sources: CreateExamWorkflowInput["sources"];
  update: <K extends keyof CreateExamWorkflowInput>(
    field: K,
    value: CreateExamWorkflowInput[K],
  ) => void;
  changeExamMode: (examMode: CreateExamWorkflowInput["examMode"]) => void;
  onSourcesChange: (nextSources: CreateExamWorkflowInput["sources"]) => void;
  setFieldError: (field: keyof CreateExamWorkflowErrors, message?: string) => void;
  validate: (requireAudience?: boolean) => boolean;
  validateStep: (step: ValidatableCreateExamStep) => boolean;
  setStep: (step: CreateExamStep) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  reset: (nextInitialForm?: CreateExamWorkflowInput) => void;
}

export function useCreateExamWizardForm({
  initialForm,
  activeTemplatePublicId,
  templateSkills,
}: UseCreateExamWizardFormOptions): UseCreateExamWizardFormResult {
  const resolvedInitialForm = useMemo(() => createInitialForm(initialForm), [initialForm]);
  const [state, dispatch] = useReducer(formReducer, resolvedInitialForm, createInitialState);

  const effectiveForm = useMemo(
    () => getEffectiveExamWorkflowForm(state.form, activeTemplatePublicId),
    [activeTemplatePublicId, state.form],
  );

  const update = useCallback(
    <K extends keyof CreateExamWorkflowInput>(
      field: K,
      value: CreateExamWorkflowInput[K],
    ): void => {
      dispatch({ type: "update", field, value } as UpdateFormAction);
    },
    [],
  );

  const changeExamMode = useCallback(
    (examMode: CreateExamWorkflowInput["examMode"]): void => {
      dispatch({ type: "change-mode", examMode, templateSkills });
    },
    [templateSkills],
  );

  const onSourcesChange = useCallback((nextSources: CreateExamWorkflowInput["sources"]): void => {
    dispatch({ type: "update", field: "sources", value: nextSources });
  }, []);

  const setFieldError = useCallback(
    (field: keyof CreateExamWorkflowErrors, message?: string): void => {
      dispatch({ type: "set-field-error", field, message });
    },
    [],
  );

  const validate = useCallback(
    (requireAudience = true): boolean => {
      const nextErrors = validateCreateExamWorkflow(
        effectiveForm,
        undefined,
        requireAudience,
        templateSkills,
        requireAudience,
      );
      dispatch({ type: "set-errors", errors: nextErrors });
      return Object.keys(nextErrors).length === 0;
    },
    [effectiveForm, templateSkills],
  );

  const validateStep = useCallback(
    (currentStep: ValidatableCreateExamStep): boolean => {
      const allErrors = validateCreateExamWorkflow(
        effectiveForm,
        undefined,
        currentStep === 3,
        templateSkills,
        currentStep === 3,
      );
      const nextErrors = filterWorkflowErrors(allErrors, getCreateExamStepFields(currentStep));
      dispatch({ type: "set-errors", errors: nextErrors });
      return Object.keys(nextErrors).length === 0;
    },
    [effectiveForm, templateSkills],
  );

  const setStep = useCallback((step: CreateExamStep): void => {
    dispatch({ type: "set-step", step });
  }, []);

  const goToNextStep = useCallback((): void => {
    if (state.step === 4 || !validateStep(state.step)) return;
    dispatch({
      type: "set-step",
      step: (state.step + 1) as CreateExamStep,
    });
  }, [state.step, validateStep]);

  const goToPreviousStep = useCallback((): void => {
    if (state.step === 1) return;
    dispatch({
      type: "set-step",
      step: (state.step - 1) as CreateExamStep,
    });
  }, [state.step]);

  const reset = useCallback(
    (nextInitialForm = resolvedInitialForm): void => {
      dispatch({ type: "reset", initialForm: nextInitialForm });
    },
    [resolvedInitialForm],
  );

  return {
    form: state.form,
    effectiveForm,
    step: state.step,
    errors: state.errors,
    sources: state.form.sources,
    update,
    changeExamMode,
    onSourcesChange,
    setFieldError,
    validate,
    validateStep,
    setStep,
    goToNextStep,
    goToPreviousStep,
    reset,
  };
}
