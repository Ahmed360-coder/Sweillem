/** What the visitor picked. "auto" follows the phone or computer's own setting. */
export type ThemePref = "auto" | "light" | "dark";
export type Theme = "light" | "dark";

export const THEME_KEY = "sweillem.theme";
/** Browser bar colour per theme, matching --paper. */
export const THEME_COLORS: Record<Theme, string> = { light: "#f2f2ef", dark: "#141011" };

/**
 * Runs in <head> before the first paint, so a remembered choice never flashes
 * the other theme. It sets <html data-theme> to the theme in use and
 * data-theme-pref to the choice, keeps "auto" in step with the device, and
 * exposes window.__setTheme for the switches (src/lib/theme.ts).
 */
export const themeScript = `(()=>{var d=document.documentElement,k=${JSON.stringify(THEME_KEY)},c=${JSON.stringify(THEME_COLORS)},m=matchMedia("(prefers-color-scheme: dark)");function p(){try{var v=localStorage.getItem(k);return v==="light"||v==="dark"?v:"auto"}catch(e){return"auto"}}function a(){var v=p(),t=v==="auto"?(m.matches?"dark":"light"):v;d.dataset.theme=t;d.dataset.themePref=v;d.style.colorScheme=t;document.querySelectorAll('meta[name="theme-color"]').forEach(function(e){e.setAttribute("content",c[t])})}window.__setTheme=function(v){try{v==="auto"?localStorage.removeItem(k):localStorage.setItem(k,v)}catch(e){}a()};m.addEventListener("change",a);addEventListener("storage",function(e){if(e.key===k)a()});a()})()`;
