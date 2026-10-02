"use client";

import { setThemePref, useTheme, useThemePref, type ThemePref } from "@/lib/theme";
import { DeviceIcon, MoonIcon, SunIcon } from "./icons";

/**
 * Header switch, on every page: a sun and a moon on a track, with the logo-red
 * knob over the mode in use. One tap swaps light and dark, and the choice is
 * remembered. The knob position comes from CSS (the dark: variant reads
 * <html data-theme>), so the first paint is right before hydration.
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const theme = useTheme();
  const dark = theme === "dark";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label="Dark mode"
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setThemePref(dark ? "light" : "dark")}
      data-theme-toggle
      className={`group/theme relative inline-flex h-11 w-[60px] flex-none cursor-pointer items-center ${className}`}
    >
      <span
        aria-hidden="true"
        className="relative flex h-8 w-full items-center justify-between rounded-full border border-line bg-sunk px-[7px] text-muted transition-colors duration-200 group-hover/theme:border-ink"
      >
        <SunIcon className="size-4" />
        <MoonIcon className="size-4" />
        <span className="absolute start-[3px] top-[3px] grid size-6 place-items-center rounded-full bg-brand text-on-brand shadow-[0_1px_3px_rgb(0_0_0/0.35)] transition-transform duration-300 ease-set dark:translate-x-[26px] rtl:dark:-translate-x-[26px]">
          <SunIcon className="size-3.5 dark:hidden" />
          <MoonIcon className="hidden size-3.5 dark:block" />
        </span>
      </span>
    </button>
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
