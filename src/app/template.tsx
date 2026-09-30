import type { ReactNode } from "react";

// M01 page transition: each route change remounts this wrapper, so the view
// rises 14 px and fades in. Reduced motion turns it into an instant swap.
export default function Template({ children }: { children: ReactNode }) {
  return <div className="view-enter">{children}</div>;
}
