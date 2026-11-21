"use client";

import type { ReactElement } from "react";
import { PublicShell } from "@/features/public/components/PublicShell";
import { AboutBackground } from "./AboutIntroSections";
import { ComparisonTable } from "./ComparisonTable";
import { ScoringFlow } from "./ScoringFlow";
import { ScoringSimulation } from "./ScoringSimulation";
import { SourcesList } from "./SourcesList";
import { AboutGlance } from "./_AboutGlance";
import { AboutHero } from "./_AboutHero";
import { AboutQuestionTypes } from "./_AboutQuestionTypes";

export const AboutPteView = (): ReactElement => (
  <PublicShell home>
    <AboutHero />
    <AboutGlance />
    <AboutQuestionTypes />
    <ScoringFlow />
    <ScoringSimulation />
    <ComparisonTable />
    <AboutBackground />
    <SourcesList />
  </PublicShell>
);
