/**
 * While a modal panel is open, makes everything else in <body> inert (the
 * skip link and the page included), so focus and screen readers stay in the
 * panel. Elements that are already inert are left alone. Returns the undo.
 */
export function inertOutside(panel: Element | null): () => void {
  const others = Array.from(document.body.children).filter(
    (el): el is HTMLElement => el instanceof HTMLElement && !el.contains(panel) && !el.inert,
  );
  others.forEach((el) => (el.inert = true));
  return () => others.forEach((el) => (el.inert = false));
}
