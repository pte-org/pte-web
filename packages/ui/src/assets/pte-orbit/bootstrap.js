import { TEXT } from "./constants.js";

const host = document.querySelector("#canvas-host");
const loading = document.querySelector("#loading");
const fallback = document.querySelector("#fallback");
const motionButton = document.querySelector("#motion-toggle");
const themeButton = document.querySelector("#theme-toggle");
const resetButton = document.querySelector("#reset-view");
const renderState = document.querySelector("#render-state");
const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
let scene = null;
let playing = !motionPreference.matches;
let dark = false;
let starting = false;

const setButton = (button, label, symbol) => {
  const icon = document.createElement("span");
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = symbol;
  button.replaceChildren(document.createTextNode(label + " "), icon);
};

const updateMotion = () => {
  scene?.setMotion(playing);
  motionButton.setAttribute("aria-pressed", String(!playing));
  setButton(motionButton, playing ? TEXT.pause : TEXT.resume, playing ? "Ⅱ" : "▷");
  renderState.textContent = playing ? TEXT.live : TEXT.paused;
};

const showFailure = () => {
  loading.hidden = true;
  fallback.hidden = false;
  motionButton.disabled = true;
  resetButton.disabled = true;
  host.dataset.ready = "false";
  document.querySelector("#fallback-detail").textContent = TEXT.loadError;
};

const start = async () => {
  if (starting) return;
  starting = true;
  loading.hidden = false;
  fallback.hidden = true;
  try {
    scene?.dispose();
    scene = null;
    const { mountScene } = await import("./scene.js");
    scene = mountScene(host, motionPreference.matches);
    scene.setTheme(dark ? "dark" : "light");
    updateMotion();
    loading.hidden = true;
    motionButton.disabled = false;
    resetButton.disabled = false;
  } catch (error) {
    console.error("PTE Orbit could not start:", error);
    showFailure();
  } finally {
    starting = false;
  }
};

motionButton.addEventListener("click", () => {
  playing = !playing;
  updateMotion();
});
resetButton.addEventListener("click", () => scene?.reset());
themeButton.addEventListener("click", () => {
  dark = !dark;
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  themeButton.setAttribute("aria-pressed", String(dark));
  setButton(themeButton, dark ? TEXT.lightTheme : TEXT.darkTheme, "◐");
  scene?.setTheme(dark ? "dark" : "light");
});
motionPreference.addEventListener("change", () => {
  playing = !motionPreference.matches;
  updateMotion();
});
host.addEventListener("scene-error", showFailure);
document.querySelector("#retry").addEventListener("click", () => window.location.reload());
window.addEventListener("pagehide", (event) => {
  if (!event.persisted) scene?.dispose();
});
start();
