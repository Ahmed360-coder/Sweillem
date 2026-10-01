// Motion tokens shared by CSS (globals.css) and Motion (motion/react).
// Keep these in step with design/motion-spec.md.

export const duration = {
  instant: 0.12,
  quick: 0.2,
  base: 0.32,
  slow: 0.56,
  story: 0.9,
} as const;

export const ease = {
  /** Standard ease-out, most UI. */
  glaze: [0.2, 0.8, 0.2, 1],
  /** Ease-in-out for things that travel. */
  kiln: [0.65, 0, 0.35, 1],
  /** Small overshoot for things that land. */
  set: [0.34, 1.56, 0.64, 1],
} as const satisfies Record<string, readonly [number, number, number, number]>;
