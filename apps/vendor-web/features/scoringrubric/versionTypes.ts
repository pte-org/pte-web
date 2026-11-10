export interface VersionActions { edit: boolean; submit: boolean; activate: boolean; reject: boolean; discard: boolean }
export type RubricEditText = { [K in keyof typeof import("./versionConstants").RUBRIC_EDIT_TEXT.en]: string };
