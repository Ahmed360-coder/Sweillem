import { useEffect, useRef } from "react";

/** How far the finger travels sideways before the menu opens or closes. */
const DISTANCE = 56;
/** A move this far up or down first is a scroll, not a swipe. */
const SLOP = 14;

/** True when the touch began somewhere that has its own sideways gesture. */
function ownsSideways(target: EventTarget | null): boolean {
  if (document.querySelector("dialog[open]")) return true;
  for (let el = target instanceof Element ? target : null; el; el = el.parentElement) {
    if (el.matches("input, textarea, select, [data-swipe-ignore]")) return true;
    if (el.scrollWidth > el.clientWidth + 1) {
      const { overflowX } = getComputedStyle(el);
      if (overflowX === "auto" || overflowX === "scroll") return true;
    }
  }
  return false;
}

/**
 * Touch swipes for the side menu, which slides in from the start edge: a swipe
 * towards the end edge (left to right, or right to left in Arabic) opens it,
 * and the opposite swipe closes it. Swipes that start in a sideways scroller,
 * a form field or an open dialog are left alone, as is anything mostly vertical.
 * The phone's own edge-swipe back gesture runs before the page sees the touch,
 * so a swipe that starts right at the edge may still go back.
 */
export function useSwipeMenu({
  open,
  disabled,
  onOpen,
  onClose,
}: {
  open: boolean;
  disabled: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  const latest = useRef({ open, disabled, onOpen, onClose });
  useEffect(() => {
    latest.current = { open, disabled, onOpen, onClose };
  });

  useEffect(() => {
    let start: { x: number; y: number } | null = null;

    const onStart = (e: TouchEvent) => {
      start = null;
      if (e.touches.length !== 1 || latest.current.disabled) return;
      if (!latest.current.open && ownsSideways(e.target)) return;
      start = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const onMove = (e: TouchEvent) => {
      if (!start || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - start.x;
      const dy = e.touches[0].clientY - start.y;
      if (Math.abs(dy) > SLOP && Math.abs(dy) > Math.abs(dx)) {
        start = null;
        return;
      }
      if (Math.abs(dx) < DISTANCE || Math.abs(dx) < Math.abs(dy) * 1.6) return;
      start = null;
      const towardsEnd = document.documentElement.dir === "rtl" ? dx < 0 : dx > 0;
      const { open: isOpen, onOpen: openMenu, onClose: closeMenu } = latest.current;
      if (towardsEnd && !isOpen) openMenu();
      else if (!towardsEnd && isOpen) closeMenu();
    };
    const onEnd = () => {
      start = null;
    };

    document.addEventListener("touchstart", onStart, { passive: true });
    document.addEventListener("touchmove", onMove, { passive: true });
    document.addEventListener("touchend", onEnd, { passive: true });
    document.addEventListener("touchcancel", onEnd, { passive: true });
    return () => {
      document.removeEventListener("touchstart", onStart);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", onEnd);
      document.removeEventListener("touchcancel", onEnd);
    };
  }, []);
}
