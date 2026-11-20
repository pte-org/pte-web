/** English copy for the public About PTE page. Numbers in `src` refer to ABOUT_PTE_SOURCES ids. */
export const ABOUT_PTE_EN = {
  nav: "About PTE",
  hero: {
    eyebrow: "Understanding the exam behind this project",
    title: "What is PTE, and how is it scored?",
    description:
      "A sourced overview of the Pearson Test of English: who makes it, where it is accepted, how it compares with other tests, and how this platform turns answers into a 10–90 score.",
    toc: ["Overview", "History", "Recognition", "In Vietnam", "Comparison", "Scoring flow", "Simulation", "Sources"],
  },
  what: {
    title: "What PTE is",
    body: [
      "PTE (Pearson Test of English) is a family of computer-based English tests owned and delivered by Pearson, the UK-based education company. PTE Academic is the flagship four-skill test used for study abroad and migration.",
      "PTE Academic is a single test of about two hours in three parts — Speaking & Writing, Reading, and Listening — with 22 question types. Responses are scored by Pearson's automated scoring, and results are typically available within about two days.",
      "Scores are reported on a 10–90 scale: an overall score plus four communicative skill scores (Speaking, Writing, Reading, Listening).",
    ],
    src: [1, 14],
    facts: [
      { label: "Owner", value: "Pearson plc" },
      { label: "Format", value: "Computer-based, ~2 hours" },
      { label: "Score scale", value: "10–90" },
      { label: "Results", value: "Typically ~2 days" },
    ],
  },
  history: {
    title: "History",
    items: [
      { year: "2009", text: "Pearson launches PTE Academic in late 2009, built on feedback from universities.", src: [3] },
      { year: "2014", text: "Accepted by the Australian government for visa purposes (later also New Zealand and the UK).", src: [4, 7] },
      { year: "2019", text: "PTE Academic marks ten years of delivery.", src: [4] },
      { year: "2024", text: "PTE Core launches as Pearson's general-English test approved by IRCC for Canadian economic immigration.", src: [5, 6] },
      { year: "2025", text: "Two new Speaking question types — Summarize Group Discussion and Respond to a Situation — apply to tests from 7 August 2025.", src: [2] },
    ],
  },
  recognition: {
    title: "Where it is accepted",
    rows: [
      { region: "Australia & New Zealand", text: "Accepted for study, work and migration visas; all Australian and New Zealand universities accept PTE Academic.", src: [4, 7] },
      { region: "United Kingdom", text: "Accepted by almost all UK universities; PTE Academic UKVI is the Home Office Secure English Language Test (SELT) variant for visas.", src: [3, 4] },
      { region: "Canada", text: "IRCC accepts PTE Core (not PTE Academic) for economic immigration and citizenship. Universities set their own policy.", src: [5, 6] },
      { region: "United States", text: "Accepted by many US universities for admission; acceptance is set by each institution, so verify with the school.", src: [1] },
      { region: "Vietnam", text: "Used mainly by students and workers heading to Australia, NZ and the UK. We could not find a verified national market-share figure, so none is shown.", src: [] },
    ],
  },
  vietnam: {
    title: "Taking PTE in Vietnam",
    points: [
      "Tests run year-round in Ho Chi Minh City and Hanoi, with fewer centres in Da Nang and Can Tho; each centre offers several sessions per month.",
      "One authorised centre reports sessions Monday to Saturday mornings (excluding public holidays and Tết), with 2–3 sessions per day.",
      "Third-party fee trackers report USD 185 for PTE Academic in Vietnam (October 2026). Always confirm the price on Pearson's booking site.",
    ],
    src: [11, 12, 13],
    caveat:
      "Centre counts differ between sources (2 to 9) and Pearson does not publish a national session count, so exact frequency is not verified.",
  },
  comparison: {
    title: "PTE vs other English tests",
    caption: "Official figures where available; costs vary by country.",
    headers: ["", "PTE Academic", "IELTS Academic", "TOEFL iBT", "PTE Core"],
    rows: [
      ["Organisation", "Pearson", "British Council, IDP, Cambridge", "ETS", "Pearson"],
      ["Format", "Computer, test centre", "Paper or computer, test centre", "Computer, centre or at home", "Computer, test centre"],
      ["Duration", "~2 hours", "~2 h 45 min", "Under ~2 hours (2026 format)", "~2 hours"],
      ["Score scale", "10–90", "Band 0–9", "1–6 (since Jan 2026)", "10–90"],
      ["Speaking", "Into a microphone, AI-scored", "Face-to-face with an examiner", "Recorded, AI + human", "Into a microphone, AI-scored"],
      ["Results", "Typically ~2 days", "Days to ~2 weeks (by format)", "~3 days", "Typically ~2 days"],
      ["Fee in Vietnam", "~USD 185 (reported)", "Check the provider", "Check ETS", "Not offered in Vietnam (reported)"],
    ],
    src: [1, 8, 9, 10, 13],
  },
  flow: {
    title: "How this platform scores an attempt",
    intro:
      "The flow below is exactly what the pte-api aggregation does (AggregationCore). Weights come from the platform's standard exam template, which hosts can copy and adjust.",
    steps: [
      { title: "1 · Item score", text: "Each answer gets a 0–100 score: objective items are auto-marked (partial credit for multi-answer), open items are scored by AI and can be reviewed by an examiner." },
      { title: "2 · Task-type average", text: "Scores are averaged per task type. A skipped item counts as 0; an item not scored yet is left out." },
      { title: "3 · Weighted skill score", text: "Each skill = 10 + 80 × Σ(weight × average / 100) / Σweight, rounded half-up, over task types with weight for that skill." },
      { title: "4 · Overall", text: "Overall uses the same formula with each task type's overall weight (the mean of its four skill weights). It needs all four skills tested." },
    ],
    integratedTitle: "Integrated tasks feed more than one skill",
    integratedNote: "Lines show where each task type's average flows. Thicker line = larger weight.",
    simplificationsTitle: "Where this model simplifies official PTE scoring",
    simplifications: [
      "Pearson scores traits (content, oral fluency, pronunciation, grammar…) with proprietary models and scales them to 10–90; this app uses a linear 10 + 80 × weighted-percentage mapping.",
      "Weights come from a community-published question-type table (V5), not from Pearson. Pearson does not publish exact weights.",
      "Pearson can contribute single items to several skills at the item level; this app weights task-type averages.",
      "Scores here are practice estimates and are not equivalent to an official PTE score report.",
    ],
  },
  simulation: {
    title: "Simulation: 50 students",
    intro:
      "Generates 50 mock students with random ability, simulates every item answer, then scores them step by step with the same formula. Runs entirely in your browser — nothing is sent to the server.",
    generate: "Generate 50 students",
    regenerate: "New random cohort",
    next: "Next step",
    runAll: "Score everything",
    stages: ["Answers submitted", "Task-type averages", "Skill scores", "Overall score"],
    empty: "Generate a cohort to start.",
    mean: "Mean overall",
    median: "Median overall",
    highest: "Highest",
    lowest: "Lowest",
    distribution: "Overall score distribution",
    distributionHint: "Students per 10-point band",
    table: { student: "Student", ability: "Ability %", items: "Items answered", overall: "Overall" },
    selected: "Score trace",
    selectHint: "Select a student in the table to see their trace.",
    taskColumn: "Task type",
    averageColumn: "Average",
    seed: "Seed",
  },
  sources: { title: "Sources", note: "Third-party sources are marked; official Pearson, ETS, IELTS and IRCC pages take precedence." },
  skills: { speaking: "Speaking", writing: "Writing", reading: "Reading", listening: "Listening", overall: "Overall" },
  sections: { speakingWriting: "Speaking & Writing", reading: "Reading", listening: "Listening" },
  sourceLabel: "Sources",
};

export type AboutPteCopy = typeof ABOUT_PTE_EN;
