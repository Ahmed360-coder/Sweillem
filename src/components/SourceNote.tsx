import type { ReactNode } from "react";

/** Small print that says where a figure or claim comes from. */
export function SourceNote({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`max-w-[75ch] font-mono text-[12.5px] leading-relaxed tracking-[.02em] text-muted ${className}`}>{children}</p>;
}
