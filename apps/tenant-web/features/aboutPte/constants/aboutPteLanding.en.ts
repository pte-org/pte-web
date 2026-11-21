/** Landing-style copy for the About PTE page layout (headings, short labels, calls to action). */
export const ABOUT_PTE_LANDING_EN = {
  hero: {
    pill: "PTE Academic explained",
    title: "Understand PTE.",
    titleAccent: "See exactly how it is scored.",
    description:
      "Explore the exam structure, the 22 question types and the scoring rules, then try the scoring yourself with the interactive lab.",
    explore: "Explore PTE",
    tryLab: "Try the score lab",
    stats: [
      { value: "10–90", label: "Score scale", note: "Overall + 4 skills" },
      { value: "22", label: "Question types", note: "PTE Academic" },
    ],
    resultTitle: "Sample score report",
    resultNote: "Student B from the simulation below",
  },
  glance: {
    pill: "PTE overview",
    title: "Get to know PTE at a glance",
    stats: [
      { value: "22", label: "Question types" },
      { value: "10–90", label: "Score range" },
      { value: "~2 hours", label: "Test duration" },
      { value: "4", label: "Skills reported" },
    ],
    conceptsTitle: "4 things to know first",
  },
  types: {
    pill: "22 question types",
    title: "Explore all 22 question types",
    intro: "Grouped by exam part. Integrated types count towards two skills.",
    showDetails: "What the candidate does in each type",
    hideDetails: "Hide descriptions",
  },
  scoring: {
    pill: "Scoring system",
    title: "How does an answer become a score?",
    steps: [
      { title: "Your answer", text: "Spoken or written response, or the options chosen." },
      { title: "Scoring criteria", text: "Traits such as Content, Pronunciation, Fluency — or a count of correct answers." },
      { title: "Item score 0–100", text: "Points achieved ÷ maximum × 100, with the Content/Form zero gate." },
      { title: "Skill & Overall 10–90", text: "Weighted by question type, then mapped to 10–90." },
    ],
    exampleTitle: "Example · Describe Image",
    exampleNote: "Score Guide p. 8",
    exampleResult: "Item score",
    rules: "Scoring rule of every question type",
    technical: "Weights, step-by-step layers and how this platform differs",
  },
  simulator: {
    pill: "Interactive demo",
    title: "Score simulator",
    text: "Adjust each question type's answer and watch the skill and Overall scores change in real time.",
    start: "Start practising",
    sample: "Sample · Student B",
  },
  compare: {
    pill: "Compare English tests",
    title: "PTE vs IELTS vs TOEFL",
    intro: "How PTE compares with the other widely used English tests.",
  },
  vietnam: {
    pill: "PTE in Vietnam",
    cities: ["Ho Chi Minh City", "Hanoi", "Da Nang", "Can Tho"],
  },
  background: {
    pill: "History & recognition",
    title: "Where PTE comes from and where it is accepted",
  },
  sources: { pill: "References" },
  showMore: "Show",
  showLess: "Hide",
};

export type AboutPteLanding = typeof ABOUT_PTE_LANDING_EN;
