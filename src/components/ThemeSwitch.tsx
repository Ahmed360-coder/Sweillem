"use client";

import { setThemePref, useTheme, useThemePref, type ThemePref } from "@/lib/theme";
import { DeviceIcon, MoonIcon, SunIcon } from "./icons";

/**
 * Header button: one tap swaps light and dark, and the choice is remembered.
 * Both icons are rendered and CSS shows the one for the theme in use, so the
 * first paint is right before hydration.
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const theme = useTheme();
  const next = theme === "dark" ? "light" : "dark";
  return (
    <button
      type="button"
      onClick={() => setThemePref(next)}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      data-theme-toggle
      className={`group/theme relative inline-flex size-11 flex-none cursor-pointer items-center justify-center rounded-full border border-line text-ink transition-[background-color,transform] duration-100 hover:bg-sunk active:translate-y-px ${className}`}
    >
      <MoonIcon className="only-light transition-transform duration-500 ease-glaze group-hover/theme:-rotate-[20deg]" />
      <SunIcon className="only-dark text-[var(--fire)] transition-transform duration-500 ease-glaze group-hover/theme:rotate-45" />
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
            className="relative flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-pill text-[14px] font-semibold text-muted transition-colors duration-200 has-checked:bg-maroon has-checked:text-on-maroon has-focus-visible:outline-2 has-focus-visible:outline-maroon"
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
