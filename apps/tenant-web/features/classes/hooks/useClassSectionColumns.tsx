"use client";

import { Badge, useLocale, type DataTableColumn } from "@pte/ui";
import type { ClassResponse } from "@pte/api-client";
import { CLASS_STATUS_LABELS, CLASS_STATUS_VARIANT, CLASS_TABLE_HEADERS } from "../constants";

export const useClassSectionColumns = (
  studentCounts?: ReadonlyMap<string, number>,
): DataTableColumn<ClassResponse>[] => {
  const { t } = useLocale();
  return [
    { key: "name", header: t("tenant.classes.name", CLASS_TABLE_HEADERS.NAME), headerClassName: "whitespace-nowrap",
      cell: studentClass => studentClass.name },
    ...(studentCounts ? [{ key: "students", header: t("tenant.participants.students"), headerClassName: "whitespace-nowrap",
      sortAccessor: (studentClass: ClassResponse) => studentCounts.get(studentClass.publicId) ?? 0,
      cell: (studentClass: ClassResponse) => studentCounts.get(studentClass.publicId) ?? 0,
    }] : []),
    { key: "status", header: t("tenant.classes.status", CLASS_TABLE_HEADERS.STATUS), headerClassName: "whitespace-nowrap",
      filterOptions: [
        { value: "", label: t("tenant.classes.allStatuses") },
        { value: "ACTIVE", label: t("tenant.classes.active") },
        { value: "INACTIVE", label: t("tenant.classes.inactive") },
        { value: "SUSPENDED", label: t("tenant.classes.suspended") },
      ],
      filterAccessor: studentClass => studentClass.status,
      cell: studentClass => <Badge variant={CLASS_STATUS_VARIANT[studentClass.status]}>
        {t(`tenant.classes.${studentClass.status.toLowerCase()}`, CLASS_STATUS_LABELS[studentClass.status])}
      </Badge>,
    },
  ];
};
