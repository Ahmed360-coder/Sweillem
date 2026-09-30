import type { ReactNode } from "react";
import { HexIcon } from "./icons";

/**
 * Tidy "arrives in Milestone N" panel for pages whose content is still being
 * rebuilt. Used only on preview builds; each milestone removes its notes.
 */
export function BuildNote({ milestone, children }: { milestone: number; children: ReactNode }) {
  return (
    <div className="wrap py-10">
      <div className="relative grid gap-3 overflow-hidden rounded-[20px] border border-dashed border-line bg-surface p-[clamp(20px,3vw,32px)] sm:grid-cols-[auto_1fr] sm:items-start sm:gap-5">
        <HexIcon className="size-10 text-sunk" />
        <div className="grid gap-2">
          <p className="font-mono text-xs font-medium tracking-[.12em] text-muted uppercase">
            Being rebuilt · Milestone {milestone}
          </p>
          <div className="max-w-[62ch] text-muted [&_a]:text-maroon">{children}</div>
        </div>
      </div>
    </div>
  );
}
