import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  lede,
  children,
}: {
  eyebrow: string;
  title: string;
  lede?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="wrap grid gap-3.5 pt-[clamp(24px,4vw,56px)] pb-2">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="text-[clamp(34px,5vw,60px)] tracking-[-.01em]">{title}</h1>
      {lede && <p className="lede">{lede}</p>}
      {children}
    </header>
  );
}
