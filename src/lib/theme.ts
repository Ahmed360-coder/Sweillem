"use client";

import { useSyncExternalStore } from "react";
import type { Theme, ThemePref } from "./theme-script";

export type { Theme, ThemePref };

declare global {
  interface Window {
    __setTheme?: (pref: ThemePref) => void;
  }
}

function subscribe(onChange: () => void) {
  const mo = new MutationObserver(onChange);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "data-theme-pref"] });
  return () => mo.disconnect();
}

const readTheme = (): Theme => (document.documentElement.dataset.theme === "dark" ? "dark" : "light");
const readPref = (): ThemePref => {
  const v = document.documentElement.dataset.themePref;
  return v === "light" || v === "dark" ? v : "auto";
};

/** The theme in use. The server renders "light"; the client corrects it straight after hydration. */
export const useTheme = () => useSyncExternalStore(subscribe, readTheme, () => "light" as Theme);
/** The visitor's choice: auto, light or dark. */
export const useThemePref = () => useSyncExternalStore(subscribe, readPref, () => "auto" as ThemePref);

export function setThemePref(pref: ThemePref) {
  window.__setTheme?.(pref);
}
