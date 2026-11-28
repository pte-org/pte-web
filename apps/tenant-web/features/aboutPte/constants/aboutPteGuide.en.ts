/** Reader-facing extras of the About PTE page: sample questions, test day and a short glossary. */
export interface AboutPteGuide {
  samples: {
    pill: string;
    title: string;
    intro: string;
    onScreen: string;
    scoredOn: string;
    timingLabel: string;
    readAloud: { passage: string; recording: string; timing: string };
    describeImage: { chartTitle: string; months: readonly string[]; recording: string; timing: string };
    dictation: { playing: string; typed: string; answerBox: string; timing: string };
  };
  testDay: {
    pill: string;
    title: string;
    intro: string;
    steps: readonly { title: string; text: string }[];
    note: string;
  };
  glossary: {
    pill: string;
    title: string;
    intro: string;
    terms: readonly { term: string; text: string }[];
  };
}

export const ABOUT_PTE_GUIDE_EN: AboutPteGuide = {
  samples: {
    pill: "Sample questions",
    title: "What does a PTE question look like?",
    intro: "Three examples we wrote ourselves to show the screen and the way you answer. Real Pearson questions are different.",
    onScreen: "On screen",
    scoredOn: "Scored on",
    timingLabel: "Timing",
    readAloud: {
      passage: "Public libraries give people a quiet place to study, borrow books and learn new skills.",
      recording: "Recording",
      timing: "30–40 seconds to read and prepare, then a tone and the microphone opens; one recording only.",
    },
    describeImage: {
      chartTitle: "Students per month",
      months: ["Jan", "Feb", "Mar", "Apr"],
      recording: "Recording",
      timing: "25 seconds to study the image, then a tone and 40 seconds to answer.",
    },
    dictation: {
      playing: "Playing — you hear it once only",
      typed: "The library opens at nine every morning.",
      answerBox: "Response box",
      timing: "The audio is 3–5 seconds and starts by itself; you may take notes on the erasable noteboard.",
    },
  },
  testDay: {
    pill: "Test day",
    title: "How does test day work?",
    intro: "A short summary from Pearson's official PTE Academic page.",
    steps: [
      {
        title: "Go to a test centre",
        text: "PTE Academic is taken on a computer at an authorised PTE test centre, never at home. Rooms have no more than 15 seats.",
      },
      {
        title: "Take one single test",
        text: "One computer-based test of about 2 hours with three parts: Speaking & Writing, Reading and Listening.",
      },
      {
        title: "Receive the Score Report",
        text: "Typically within about 2 days, with an overall score and a score for each of the four skills.",
      },
      {
        title: "Send your scores",
        text: "Sending to institutions is free and unlimited. A score is valid for two years from the test date.",
      },
    ],
    note: "Rules can change, so always check Pearson's site before you book.",
  },
  glossary: {
    pill: "Glossary",
    title: "Terms used on this page",
    intro: "Short definitions, in the order you meet them.",
    terms: [
      { term: "Overall", text: "The total score on the 10–90 scale, reported together with the four skill scores." },
      { term: "Skill score", text: "One 10–90 score each for Speaking, Writing, Reading and Listening." },
      {
        term: "Integrated type",
        text: "A question type that tests two skills at once, for example Write From Dictation (Listening and Writing). Its score counts towards both.",
      },
      {
        term: "Trait",
        text: "One aspect of a spoken or written answer that is scored on its own, such as Content, Pronunciation, Oral Fluency or Grammar.",
      },
      { term: "Gate", text: "A trait that, when it is 0, makes the whole item score 0 — for example Content or Form." },
      { term: "CEFR", text: "The European framework that sorts language level from A1 to C2; Pearson maps PTE scores onto it." },
      { term: "IELTS band", text: "IELTS's 0–9 scale, in steps of 0.5." },
      { term: "Score Guide", text: "Pearson's official document describing how each question type is scored." },
    ],
  },
};
