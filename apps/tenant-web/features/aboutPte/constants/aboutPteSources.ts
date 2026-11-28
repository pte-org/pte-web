/** Sources cited on the About PTE page, referenced by `id` from the copy catalogs. Checked 2026-11-20. */
export interface AboutPteSource {
  id: number;
  label: string;
  url: string;
  /** Marks sources that are not Pearson, ETS, IELTS or IRCC themselves, or that open as a file. */
  kind?: "thirdParty" | "pdf";
}

/** Pearson's own booking page, where live test-centre availability and the price are shown. */
export const PEARSON_BOOKING_URL = "https://www.pearsonpte.com/book-now/";

export const ABOUT_PTE_SOURCES: readonly AboutPteSource[] = [
  { id: 1, label: "Pearson — PTE Academic", url: "https://www.pearsonpte.com/pte-academic/" },
  { id: 2, label: "Pearson — PTE Academic updates 2025", url: "https://www.pearsonpte.com/pte-updates-2025/" },
  {
    id: 3,
    label: "Pearson press release — PTE Academic enters fourth year (PR Newswire)",
    url: "https://www.prnewswire.com/news-releases/pearsons-academic-english-language-test-pte-academic-enters-fourth-successful-year-166102656.html",
  },
  {
    id: 4,
    label: "The PIE News — PTE Academic celebrates ten years",
    url: "https://thepienews.com/pte-academic-celebrates-ten-years/",
    kind: "thirdParty",
  },
  { id: 5, label: "Pearson — PTE English tests for Canada", url: "https://www.pearsonpte.com/destination-canada/" },
  {
    id: 6,
    label: "IRCC Help Centre — accepted third-party language tests",
    url: "https://ircc.canada.ca/english/helpcentre/answer.asp?qnum=572&top=5",
  },
  {
    id: 7,
    label: "Pearson — English tests for work visas and skilled migration",
    url: "https://www.pearsonpte.com/articles/english-language-tests-for-work-visas-and-skilled-migration/",
  },
  { id: 8, label: "ETS — TOEFL iBT score scale update (1–6)", url: "https://www.ets.org/toefl/institutions/ibt/score-scale-update.html" },
  { id: 9, label: "ETS — TOEFL iBT scores", url: "https://www.ets.org/toefl/test-takers/ibt/scores/understand-scores.html" },
  { id: 10, label: "IELTS — ielts.org", url: "https://ielts.org/" },
  { id: 11, label: "EnglishTestPortal — PTE Academic in Vietnam", url: "https://englishtestportal.com/pte/vietnam", kind: "thirdParty" },
  { id: 12, label: "EMG Education — PTE Academic test centre", url: "https://emg.vn/en/pte-academic-test", kind: "thirdParty" },
  { id: 13, label: "BandLadder — PTE fee in Vietnam", url: "https://bandladder.com/guides/pte-exam-fee-in-vietnam", kind: "thirdParty" },
  { id: 14, label: "Pearson — PTE Academic Test Taker Score Guide, 2026 edition",
    url: "https://www.pearsonpte.com/content/dam/ELL/pte/pearsonpte/pdfs/pte-academic-pdfs/PTE-Academic-Test-Taker-Score-Guide.pdf",
    kind: "pdf",
  },
  { id: 15, label: "Pearson — PTE Academic scoring and IELTS comparison (updated July 2025)", url: "https://www.pearsonpte.com/pte-academic/scoring/" },
  { id: 16, label: "Pearson — PTE Academic: understand your score (CEFR levels)", url: "https://www.pearsonpte.com/pte-academic/scoring/understand-your-score/" },
  { id: 17, label: "Pearson — PTE Academic test format: Speaking & Writing", url: "https://www.pearsonpte.com/pte-academic/test-format/speaking-writing/" },
  { id: 18, label: "Pearson — PTE Academic test format: Listening", url: "https://www.pearsonpte.com/pte-academic/test-format/listening/" },
];
