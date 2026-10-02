"use client";

import { setThemePref, useTheme, useThemePref, type ThemePref } from "@/lib/theme";
import { DeviceIcon, MoonIcon, SunIcon } from "./icons";

/**
 * Light / Dark switch for the top bar of every page. The filled segment shows
 * the mode in use; a tap picks the other and the choice is remembered. Which
 * segment is filled comes from CSS (the dark: variant reads <html data-theme>),
 * so the first paint is right before hydration.
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const theme = useTheme();
  const segment =
    "tap relative inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-full px-2.5 text-[13px] font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-1";
  return (
    <div role="group" aria-label="Colour mode" data-theme-toggle className={`inline-flex items-center gap-0.5 rounded-full border border-line bg-surface p-[3px] ${className}`}>
      <button
        type="button"
        aria-pressed={theme === "light"}
        onClick={() => setThemePref("light")}
        className={`${segment} bg-brand text-on-brand dark:bg-transparent dark:text-muted dark:hover:text-ink`}
      >
        <SunIcon className="size-4" />
        Light
      </button>
      <button
        type="button"
        aria-pressed={theme === "dark"}
        onClick={() => setThemePref("dark")}
        className={`${segment} text-muted hover:text-ink dark:bg-brand dark:text-on-brand dark:hover:text-on-brand`}
      >
        <MoonIcon className="size-4" />
        Dark
      </button>
    </div>
  );
}

const options: { value: ThemePref; label: string; Icon: typeof SunIcon }[] = [
  { value: "auto", label: "Auto", Icon: DeviceIcon },
  { value: "light", label: "Light", Icon: SunIcon },
  { value: "dark", label: "Dark", Icon: MoonIcon },
];

/** Side menu control: Auto (the device's setting), Light or Dark. */
export function ThemeChoice() {
  const pref = useThemePref();
  return (
    <fieldset className="mt-3 grid gap-2 rounded-inner border border-line bg-paper p-3">
      <legend className="sr-only">Appearance</legend>
      <p aria-hidden="true" className="font-mono text-[12px] font-medium tracking-[.12em] text-muted uppercase">
        Appearance
      </p>
      <div className="grid grid-cols-3 gap-1 rounded-pill bg-sunk p-1">
        {options.map(({ value, label, Icon }) => (
          <label
            key={value}
            className="relative flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-pill text-[14px] font-semibold text-muted transition-colors duration-200 has-checked:bg-brand has-checked:text-on-brand has-focus-visible:outline-2 has-focus-visible:outline-maroon"
          >
            <input
              type="radio"
              name="theme"
              value={value}
              checked={pref === value}
              onChange={() => setThemePref(value)}
              className="sr-only"
            />
            <Icon className="size-4" />
            {label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
