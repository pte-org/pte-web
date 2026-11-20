/** English copy for the public About PTE page. Numbers in `src` refer to ABOUT_PTE_SOURCES ids. */
export const ABOUT_PTE_EN = {
  nav: "About PTE",
  hero: {
    eyebrow: "Understanding the exam behind this project",
    title: "What is PTE, and how is it scored?",
    description:
      "A sourced overview of the Pearson Test of English: who makes it, where it is accepted, how it compares with other tests, and how this platform turns answers into a 10–90 score.",
    toc: ["Overview", "PTE basics", "History", "Recognition", "In Vietnam", "Comparison", "Scoring flow", "Simulation", "Sources"],
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
  basics: {
    title: "PTE for beginners",
    intro:
      "Never seen a PTE exam? These four ideas are all you need to follow the rest of this page.",
    concepts: [
      { title: "1 · One sitting, three parts", text: "The candidate sits at a computer with a headset for about two hours: part 1 Speaking & Writing, part 2 Reading, part 3 Listening. There is no human examiner in the room." },
      { title: "2 · Four skills are reported", text: "The score report shows four skill scores — Speaking, Writing, Reading, Listening — plus one Overall score." },
      { title: "3 · One answer can count twice", text: "Many questions test two skills at once. In Write From Dictation you listen (Listening) and type (Writing), so that answer counts towards both. These are called integrated question types." },
      { title: "4 · Scores run from 10 to 90", text: "10 is the lowest and 90 the highest possible score. Universities and visa programmes ask for a minimum, for example 65 overall." },
    ],
    guideTitle: "The 22 question types at a glance",
    guideIntro: "What the candidate does in each question type and which skill scores it feeds in this platform. Coloured chips are the skills; two chips = integrated.",
    feeds: "Counts for",
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
    title: "How a response becomes a score",
    intro:
      "Scoring happens in four layers. Layers 1–2 follow Pearson's official Score Guide question by question; layers 3–4 are how this platform combines the results (code: RubricScorer and AggregationCore in pte-api).",
    steps: [
      { title: "1 · Score each trait", text: "Speaking and writing answers are judged on several traits, e.g. Content 0–6, Pronunciation 0–5, Oral Fluency 0–5. In this app the traits come from Azure Speech, an LLM, word counting by code, or an examiner." },
      { title: "2 · Item score 0–100", text: "Points achieved ÷ maximum points × 100. If a gated trait (Content, or Form for writing) is 0, the whole item scores 0. Objective items use the points in the table below." },
      { title: "3 · Average per question type", text: "All items of the same question type are averaged. A skipped item counts as 0." },
      { title: "4 · Skill and Overall, 10–90", text: "Each question type adds average × weight ÷ 100 to every skill it tests. The total is divided by the sum of weights and mapped to 10–90: 10 + 80 × percentage." },
    ],
    exampleTitle: "Worked example (Score Guide p. 8)",
    example: [
      "Describe Image: Content 4/6, Pronunciation 3/5, Oral Fluency 2/5 → (4 + 3 + 2) ÷ 16 = 56.25% → item score 56.",
      "If Content is 0 (off-topic or memorised answer), Pearson stops scoring: the item gets 0 no matter how good the pronunciation is.",
    ],
    rulesTitle: "Scoring rule of each question type",
    rulesIntro: "Summarised from the official Score Guide. “Gate” means the item scores 0 if that trait is 0.",
    rulesColumns: ["Question type", "Scoring", "Traits (max points)", "Rule", "Skills", "Page"],
    kinds: { correct: "Correct / incorrect", partial: "Partial credit", trait: "By traits" },
    gate: "Gate",
    integratedTitle: "Integrated tasks feed more than one skill",
    integratedNote: "Lines show where each task type's average flows. Thicker line = larger weight.",
    simplificationsTitle: "Where this platform differs from official PTE scoring",
    simplifications: [
      "Traits and their maximum points follow the Score Guide, but the trait scores come from Azure Speech and an LLM instead of Pearson's own engines (Versant, Intelligent Essay Assessor). The Azure-to-band table (thresholds 30/45/60/75/90) is not yet calibrated against human raters.",
      "Pearson does not publish how item scores add up to 10–90 or the exact weights. This app uses weights from a community-published table (V5) and a linear 10 + 80 × percentage mapping.",
      "Pearson has human experts double-check Content on several tasks; here an examiner review is optional.",
      "Scores are practice estimates, not an official PTE score report.",
    ],
  },
  simulation: {
    title: "Simulation: scoring three students across all 22 question types",
    intro:
      "Three students sit the same exam with all 22 PTE question types. Follow the four steps to see how their answers become a 10–90 score. You can click any answer to change it; every number afterwards is recalculated. Everything runs in your browser.",
    students: ["Student A", "Student B", "Student C"],
    outcomes: { correct: "Correct · 100", partial: "Half · 50", wrong: "Wrong · 0" },
    stages: ["Answers", "Question-type averages", "Skill scores", "Overall"],
    explain: [
      "In the real exam every answer gets a score from 0 to 100 using the rules in the table above (e.g. 3 of 4 blanks right = 75). To keep it easy to follow, this simulation uses three cases: fully correct = 100, half correct = 50, wrong or skipped = 0. Click an answer to change it.",
      "Answers of the same question type are averaged. Example: two Repeat Sentence items scored 100 and 50 give an average of (100 + 50) ÷ 2 = 75. From now on the system works with these 22 averages, not individual answers.",
      "Each question type has a weight for each skill (the small grey number). A cell shows how much that question type adds to the skill: average × weight ÷ 100. A row with two coloured cells is an integrated question type: the same average is counted in both skills, each with its own weight. The bottom rows add the column up and convert it to 10–90.",
      "Overall works exactly like a skill, using the overall weight of each question type (the average of its four skill weights). It is not the average of the four skill scores.",
    ],
    example: "Example",
    exampleText: (task: string, average: string, parts: string) =>
      `${task} has an average of ${average}, so it adds ${parts}.`,
    and: " and ",
    to: "to",
    previous: "Previous step",
    next: "Next step",
    reset: "Reset answers",
    item: "Item",
    task: "Question type",
    weights: "Weights S / W / R / L",
    integrated: "Integrated",
    viewing: "Show the calculation for",
    average: "Average",
    weight: "w",
    totalWeight: "Σ weight (Σw)",
    totalPoints: "Σ points added",
    ratio: "Percentage = Σ points ÷ Σw",
    score: "Score = 10 + 80 × percentage",
    summaryTitle: "Result summary",
  },
  sources: { title: "Sources", note: "Third-party sources are marked; official Pearson, ETS, IELTS and IRCC pages take precedence." },
  skills: { speaking: "Speaking", writing: "Writing", reading: "Reading", listening: "Listening", overall: "Overall" },
  sections: { speakingWriting: "Speaking & Writing", reading: "Reading", listening: "Listening" },
  sourceLabel: "Sources",
};

export type AboutPteCopy = typeof ABOUT_PTE_EN;
