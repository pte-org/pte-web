"use client";

import type { ReactElement } from "react";
import { PublicShell } from "@/features/public/components/PublicShell";
import { AboutBackground } from "./AboutIntroSections";
import { AboutVietnam } from "./AboutVietnam";
import { ComparisonTable } from "./ComparisonTable";
import { ScoringFlow } from "./ScoringFlow";
import { ScoringSimulation } from "./ScoringSimulation";
import { SourcesList } from "./SourcesList";
import { AboutCta } from "./_AboutCta";
import { AboutGlance } from "./_AboutGlance";
import { AboutHero } from "./_AboutHero";
import { AboutQuestionTypes } from "./_AboutQuestionTypes";
import { CoreDifferences } from "./_CoreDifferences";
import { SectionNav } from "./_SectionNav";

export const AboutPteView = (): ReactElement => (
  <PublicShell home stickyHeader={false}>
    <AboutHero />
    <SectionNav />
    <AboutGlance />
    <CoreDifferences />
    <ComparisonTable />
    <AboutVietnam />
    <AboutQuestionTypes />
    <ScoringFlow />
    <ScoringSimulation />
    <AboutBackground />
    <SourcesList />
    <AboutCta />
  </PublicShell>
);
