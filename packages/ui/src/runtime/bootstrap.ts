/**
 * Runs before hydration so stored presentation preferences do not flash the
 * default palette or language. It reads only the two enum-backed UI keys.
 */
export const PTE_UI_BOOTSTRAP_SCRIPT = `(() => {
  try {
    const theme = window.localStorage.getItem("pte-web.theme");
    const locale = window.localStorage.getItem("pte-web.locale");
    if (theme === "dark" || theme === "light") {
      document.documentElement.dataset.theme = theme;
      document.documentElement.style.colorScheme = theme;
    } else {
      document.documentElement.dataset.theme = "light";
    }
    document.documentElement.lang = locale === "en" ? "en" : "vi";
  } catch {
    document.documentElement.dataset.theme = "light";
    document.documentElement.lang = "vi";
  }
})();`;
