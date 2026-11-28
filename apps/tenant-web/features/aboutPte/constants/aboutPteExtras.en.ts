/** Copy for the sections added to the About PTE page: how PTE differs, quick navigation and the closing call to action. */
export const ABOUT_PTE_EXTRAS_EN = {
  differences: {
    pill: "Why PTE is different",
    title: "Four things that set PTE apart",
    intro: "What a candidate notices first when moving from IELTS or TOEFL.",
    pteLabel: "PTE",
    cards: [
      {
        metric: "AI",
        title: "Scored by AI",
        pte: "Speaking is recorded on a microphone and marked by AI, against the same criteria for every candidate.",
        other: [{ test: "IELTS", text: "marked by an examiner in the room." }, { test: "TOEFL", text: "AI together with human raters." }],
      },
      {
        metric: "~2 days",
        title: "Fast results",
        pte: "Usually within about 2 days, in time for a study or visa application.",
        other: [{ test: "IELTS", text: "a few days to about 2 weeks." }, { test: "TOEFL", text: "about 3 days." }],
      },
      {
        metric: "2 skills",
        title: "One answer, two skills",
        pte: "Some types count towards two skills at once, such as Repeat Sentence (Speaking + Listening) or Write from Dictation (Writing + Listening).",
        other: [{ test: "IELTS", text: "each part counts for one skill only." }],
      },
      {
        metric: "10–90",
        title: "A fine-grained scale",
        pte: "Scores move in steps of one point, so small progress shows up, for the Overall score and all 4 skills.",
        other: [{ test: "IELTS", text: "bands 0–9 in steps of 0.5." }, { test: "TOEFL", text: "a 1–6 scale." }],
      },
    ],
  },
  parts: {
    speakingWriting: "Part 1 · about 76–84 minutes",
    reading: "Part 2 · about 23–30 minutes",
    listening: "Part 3 · about 31–39 minutes",
    note: "Lengths from the Pearson Score Guide; the real time varies with each version of the test.",
  },
  compareFilter: {
    label: "Compare PTE with",
    all: "All tests",
    ielts: "PTE vs IELTS",
    toefl: "PTE vs TOEFL",
    core: "PTE vs PTE Core",
  },
  nav: {
    label: "On this page",
    items: [
      { id: "overview", label: "Overview" },
      { id: "difference", label: "Why PTE" },
      { id: "comparison", label: "Compare" },
      { id: "vietnam", label: "In Vietnam" },
      { id: "basics", label: "Question types" },
      { id: "scoring", label: "Scoring" },
      { id: "simulation", label: "Score lab" },
      { id: "sources", label: "Sources" },
    ],
    tryLab: "Try the score lab",
  },
  conversion: {
    title: "What does my PTE score mean?",
    intro: "Move the slider to compare a PTE Academic score with IELTS, TOEFL iBT and CEFR, using the tables Pearson and ETS publish.",
    sliderLabel: "PTE score",
    pte: "PTE Academic",
    ielts: "IELTS Academic",
    toefl: "TOEFL iBT (1–6)",
    cefr: "CEFR",
    belowIelts: "Below 4.5",
    sourceLink: "Pearson and ETS score tables",
    note: "A guide only. IELTS comes from Pearson's table; TOEFL is the band ETS gives the same CEFR level, because neither company publishes a direct PTE–TOEFL table. Each university or visa programme sets its own accepted tests and minimum scores, so always check theirs.",
  },
  labPresets: {
    label: "Quick start",
    target: (score: number, level: string): string => `Target ${score} · ${level}`,
  },
  sources: {
    show: (count: number): string => `Show ${count} references`,
    hide: "Hide references",
    link: (count: number): string => `Sources (${count})`,
  },
  cta: {
    title: "Ready to run PTE practice for your centre?",
    text: "Register your organisation, get approved, then choose the plan that fits your next exam cycle.",
    register: "Register your centre",
    login: "Sign in",
  },
};

export type AboutPteExtras = typeof ABOUT_PTE_EXTRAS_EN;
