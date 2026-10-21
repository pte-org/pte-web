import type { ReactElement } from "react";
import { PublicShell } from "./PublicShell";
import { HomeHero } from "./HomeHero";
import { HomePlans } from "./HomePlans";
import { HomeClosing, HomeTeam, HomeWorkflow } from "./HomeStory";

export const HomeView = (): ReactElement => (
  <PublicShell home>
    <HomeHero />
    <HomeWorkflow />
    <HomeTeam />
    <HomePlans />
    <HomeClosing />
  </PublicShell>
);
