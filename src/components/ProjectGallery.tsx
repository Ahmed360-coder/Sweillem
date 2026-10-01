"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import type { Photo } from "@/lib/project-galleries";

/** Thumbnails shown on the card before the "more" tile. */
const SHOWN = 4;

/**
 * A project's photos: a cover, a strip of thumbnails and a full-screen viewer
 * (a native modal dialog, so focus stays inside and Escape closes it). Arrow
 * keys and a swipe move between photos.
 */
export function ProjectGallery({ title, photos }: { title: string; photos: Photo[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState<number | null>(null);
  const swipeFrom = useRef<number | null>(null);
  const count = photos.length;

  const open = (i: number) => {
    setIndex(i);
    dialogRef.current?.showModal();
  };
  const step = (by: number) => setIndex((i) => (i === null ? i : (i + by + count) % count));

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    const onClose = () => setIndex(null);
    d.addEventListener("close", onClose);
    return () => d.removeEventListener("close", onClose);
  }, []);

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") step(1);
    else if (e.key === "ArrowLeft") step(-1);
    else return;
    e.preventDefault();
  };
  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") swipeFrom.current = e.clientX;
  };
  const onPointerUp = (e: PointerEvent) => {
    const from = swipeFrom.current;
    swipeFrom.current = null;
    if (from === null) return;
    const dx = e.clientX - from;
    if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
  };

  const cover = photos[0];
  const thumbs = photos.slice(1, 1 + SHOWN);
  const more = count - 1 - thumbs.length;
  const photo = index === null ? null : photos[index];

  return (
    <div className="grid gap-2">
      <button
        type="button"
        onClick={() => open(0)}
        className="group relative block aspect-[4/3] cursor-zoom-in overflow-hidden rounded-inner bg-sunk"
        aria-label={count > 1 ? `Open the ${count} photos of ${title}` : `Open the photo of ${title}`}
      >
        <Image
          src={cover.src}
          alt={cover.alt}
          fill
          sizes="(min-width: 1024px) 560px, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 ease-glaze group-hover:scale-[1.03]"
        />
        <span className="absolute end-3 bottom-3 rounded-full bg-[rgb(20_10_8/0.72)] px-3 py-1 font-mono text-[12px] font-medium text-white">
          {count} {count === 1 ? "photo" : "photos"}
        </span>
      </button>
      {thumbs.length > 0 && (
        <ul className="grid grid-cols-4 gap-2" aria-label={`More photos of ${title}`}>
          {thumbs.map((p, i) => {
            const last = i === thumbs.length - 1 && more > 0;
            return (
              <li key={p.src}>
                <button
                  type="button"
                  onClick={() => open(i + 1)}
                  aria-label={last ? `Show all ${count} photos, starting with photo ${i + 2}` : `Photo ${i + 2}: ${p.alt}`}
                  className="group relative block aspect-square w-full cursor-zoom-in overflow-hidden rounded-[10px] bg-sunk"
                >
                  <Image src={p.src} alt="" fill sizes="(min-width: 1024px) 130px, 25vw" className="object-cover" />
                  {last && (
                    <span className="absolute inset-0 grid place-items-center bg-[rgb(20_10_8/0.6)] font-semibold text-white">
                      +{more + 1}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <dialog
        ref={dialogRef}
        aria-label={`Photos of ${title}`}
        onKeyDown={onKey}
        onClick={(e) => e.target === e.currentTarget && dialogRef.current?.close()}
        className="gallery m-0 h-dvh border-0 max-h-none w-screen max-w-none bg-transparent p-0 text-white"
      >
        {photo && index !== null && (
          <div className="grid h-full grid-rows-[auto_minmax(0,1fr)_auto] bg-[#0c0807]">
            <div className="flex items-center gap-3 px-4 py-2 md:px-6">
              <p className="min-w-0 flex-1 truncate text-[15px] font-semibold">{title}</p>
              <p className="font-mono text-[13px] text-[#d6cfcb]" aria-live="polite">
                {index + 1} of {count}
              </p>
              <button
                type="button"
                onClick={() => dialogRef.current?.close()}
                aria-label="Close photos"
                className="relative size-11 flex-none cursor-pointer rounded-full transition-transform duration-100 hover:bg-white/10 active:translate-y-px"
                autoFocus
              >
                <span aria-hidden="true" className="absolute inset-x-3 top-1/2 h-0.5 rotate-45 bg-current" />
                <span aria-hidden="true" className="absolute inset-x-3 top-1/2 h-0.5 -rotate-45 bg-current" />
              </button>
            </div>
            <div className="relative touch-pan-y" onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
              <Image key={photo.src} src={photo.src} alt={photo.alt} fill sizes="100vw" className="object-contain" />
            </div>
            <div className="flex items-center gap-3 px-4 py-3 md:px-6">
              {count > 1 && <StepButton dir={-1} onClick={() => step(-1)} />}
              <p className="min-w-0 flex-1 text-center text-[14px] text-[#e7e1dd]">{photo.alt}</p>
              {count > 1 && <StepButton dir={1} onClick={() => step(1)} />}
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
}

function StepButton({ dir, onClick }: { dir: 1 | -1; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir > 0 ? "Next photo" : "Previous photo"}
      className="grid size-11 flex-none cursor-pointer place-items-center rounded-full border border-white/30 transition-transform duration-100 hover:bg-white/10 active:translate-y-px"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={`size-5 ${dir < 0 ? "rotate-180" : ""}`}>
        <path d="M9 6l6 6-6 6" />
      </svg>
    </button>
  );
}
