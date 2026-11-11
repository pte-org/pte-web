"use client";

import { useLocale } from "@pte/ui";

/** Route-specific text of a failed page; the shared error page supplies the title and the generic text. */
const ROUTE_ERROR_TEXT_EN = {
  PAGE_DESCRIPTION: "We could not load this page. Please try again.",
  EXAM_DESCRIPTION: "We could not load this exam. Please try again.",
  EXAMINER_DESCRIPTION: "We could not load your marking work. Please try again.",
  PROCTOR_DESCRIPTION: "We could not load the proctor console. Please try again.",
  PROGRAM_DESCRIPTION: "We could not load this program. Please try again.",
  CLASS_DESCRIPTION: "We could not load this class. Please try again.",
  CLASSES_DESCRIPTION: "We could not load the classes list. Please try again.",
} as const;

export type RouteErrorTextKey = keyof typeof ROUTE_ERROR_TEXT_EN;

const ERROR_PAGE_TEXT_VI: Record<RouteErrorTextKey, string> = {
  PAGE_DESCRIPTION: "Không tải được trang này. Vui lòng thử lại.",
  EXAM_DESCRIPTION: "Không tải được bài thi này. Vui lòng thử lại.",
  EXAMINER_DESCRIPTION: "Không tải được bài chấm của bạn. Vui lòng thử lại.",
  PROCTOR_DESCRIPTION: "Không tải được màn hình giám thị. Vui lòng thử lại.",
  PROGRAM_DESCRIPTION: "Không tải được chương trình này. Vui lòng thử lại.",
  CLASS_DESCRIPTION: "Không tải được lớp này. Vui lòng thử lại.",
  CLASSES_DESCRIPTION: "Không tải được danh sách lớp. Vui lòng thử lại.",
};

/** The route-specific text of a failed page in the current language. */
export function useRouteErrorText(key: RouteErrorTextKey): string {
  const { locale } = useLocale();
  return locale === "vi" ? ERROR_PAGE_TEXT_VI[key] : ROUTE_ERROR_TEXT_EN[key];
}
