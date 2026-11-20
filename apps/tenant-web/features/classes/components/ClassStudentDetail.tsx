"use client";

import type { ReactElement } from "react";
import { StudentDetailView } from "@/features/studentDetail";
import { useClasses } from "../api";
import { classDetailHref } from "../utils/classStudentHref";

interface ClassStudentDetailProps {
  organizationPublicId: string;
  programPublicId: string;
  classPublicId: string;
  studentPublicId: string;
}

/** The learner page opened from a class roster: the same detail, with the class as a breadcrumb step. */
export const ClassStudentDetail = ({
  organizationPublicId,
  programPublicId,
  classPublicId,
  studentPublicId,
}: ClassStudentDetailProps): ReactElement => {
  const classes = useClasses(organizationPublicId, programPublicId);
  const className = classes.data?.find((entry) => entry.publicId === classPublicId)?.name;
  const trail = className
    ? [{ label: className, href: classDetailHref(organizationPublicId, programPublicId, classPublicId) }]
    : undefined;
  return <StudentDetailView studentPublicId={studentPublicId} breadcrumbTrail={trail} />;
};
