import { redirect } from "next/navigation";

/**
 * Roster import now lives on each exam session's detail page (it needs to
 * know which exam it's enrolling into — see features/exams's
 * SessionDetailView). This route is kept only as a legacy entry point
 * (e.g. an old bookmark or nav link) — redirect to the exam list to pick
 * one.
 */
export default function RosterPage() {
  redirect("/host/exams");
}
