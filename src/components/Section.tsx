import type { ReactNode } from "react";

export function Section({
  id,
  eyebrow,
  title,
  lede,
  action,
  children,
  className = "",
}: {
  id?: string;
  eyebrow?: string;
  title?: string;
  lede?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  const headingId = id ? `${id}-title` : undefined;
  return (
    <section id={id} aria-labelledby={title ? headingId : undefined} className={`py-[clamp(48px,7vw,96px)] ${className}`}>
      <div className="wrap">
        {(eyebrow || title) && (
          <div className="mb-9 flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
            <div className="grid min-w-0 gap-3">
              {eyebrow && <p className="eyebrow">{eyebrow}</p>}
              {title && (
                <h2 id={headingId} className="text-[clamp(26px,3.4vw,42px)]">
                  {title}
                </h2>
              )}
              {lede && <p className="lede">{lede}</p>}
            </div>
            {action}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
