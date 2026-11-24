export type ProctorSessionTab = "attendance" | "incidents";

export interface ProctorSessionRoute {
  sessionPublicId: string;
  tab: ProctorSessionTab;
}

export const PROCTOR_SESSION_LIST_HREF = "/proctor/sessions?scope=ALL";

export const getProctorSessionRoute = (pathname: string): ProctorSessionRoute | null => {
  const match = /^\/proctor\/(attendance|incidents)\/([^/]+)(?:\/[^/]+)?$/.exec(pathname);
  if (!match) return null;
  const tab = match[1];
  if (tab !== "attendance" && tab !== "incidents") return null;
  return { sessionPublicId: match[2], tab };
};

export const proctorSessionTabHref = (sessionPublicId: string, tab: ProctorSessionTab): string =>
  `/proctor/${tab}/${encodeURIComponent(sessionPublicId)}`;
