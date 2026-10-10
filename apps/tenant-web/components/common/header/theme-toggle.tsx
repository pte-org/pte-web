"use client";
import { MoonIcon, SunIcon } from "@/components/common/header/icons";
import { Button } from "@/components/ui/core/button";
import { useTheme } from "@pte/ui";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      iconOnly
      appearance="outline"
      onClick={toggleTheme}
      className="size-10 rounded-lg border border-card-border bg-card-background text-icon-primary shadow-xs outline-none focus-visible:border-input-primary-focus-border focus-visible:ring-4 focus-visible:ring-input-primary-focus-border/20 [&>svg]:size-auto"
    >
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
    </Button>
  );
}
