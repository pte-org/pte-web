import { redirect } from "next/navigation";

/** Roster import now lives on each session's detail page (needs to know which exam). Kept as a legacy redirect for old bookmarks/links. */
export default function RosterPage() {
  redirect("/host/exams");
}
