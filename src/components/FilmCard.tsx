"use client";

import Image from "next/image";
import { useRef } from "react";
import { FilmPlayer } from "./FilmPlayer";

/**
 * Home film card: the poster opens the "How it's made" film in a modal
 * dialog. Native <dialog> gives focus trapping, Escape and the backdrop;
 * closing pauses the film.
 */
export function FilmCard() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const close = () => {
    dialogRef.current?.querySelector("video")?.pause();
    dialogRef.current?.close();
  };
  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="group relative block aspect-video w-full cursor-pointer overflow-hidden rounded-card bg-glaze text-start shadow-card"
        aria-haspopup="dialog"
      >
        <Image
          src="/video/how-its-made-poster.png"
          alt=""
          fill
          sizes="(min-width: 1180px) 1100px, 100vw"
          className="object-cover transition-transform duration-700 ease-glaze group-hover:scale-[1.03]"
        />
        <span className="absolute end-3 bottom-3 flex items-center gap-3 rounded-full bg-ink/85 py-1 ps-1 pe-4 text-paper shadow-card backdrop-blur-sm sm:end-4 sm:bottom-4 sm:py-1.5 sm:ps-1.5 sm:pe-5">
          <span className="hex grid size-10 place-content-center sm:size-12 bg-maroon text-on-maroon transition-transform duration-300 ease-set group-hover:scale-110">
            <svg viewBox="0 0 24 24" className="ms-0.5 size-5" fill="currentColor" aria-hidden="true">
              <path d="M7 4.5v15l12-7.5z" />
            </svg>
          </span>
          <span className="grid">
            <span className="font-display text-base font-semibold sm:text-lg">Watch the film</span>
            <span className="hidden text-[13px] opacity-80 sm:block">1 min 45 s · captions</span>
          </span>
        </span>
      </button>
      <dialog
        ref={dialogRef}
        aria-label="How it’s made film"
        onClose={() => dialogRef.current?.querySelector("video")?.pause()}
        onClick={(e) => e.target === dialogRef.current && close()}
        className="m-auto w-[min(1100px,calc(100vw-32px))] max-w-none bg-transparent p-0 backdrop:bg-black/75 backdrop:backdrop-blur-sm"
      >
        <div className="grid gap-3 rounded-card bg-paper p-[clamp(12px,2vw,20px)]">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl">How a SWEILLEM pipe is made</h2>
            <button
              type="button"
              onClick={close}
              className="inline-flex min-h-11 cursor-pointer items-center rounded-full border border-line bg-surface px-4 font-semibold hover:border-ink"
            >
              Close
            </button>
          </div>
          <FilmPlayer id="home-film" />
        </div>
      </dialog>
    </>
  );
}
