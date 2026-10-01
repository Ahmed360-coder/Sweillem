export const W: number;
export const H: number;
/** Height of the frame without the caption band (compact mode). */
export const COMPACT_H: number;
/** Length of the whole journey in timeline seconds. */
export const DURATION: number;
export const LANGS: string[];

export interface Chapter {
  id: string;
  /** Step number; undefined for the intro and closing cards. */
  n?: number;
  start: number;
  end: number;
  lead: number;
  /** The drawn picture the step opens on: a moment of its scene, cropped and scaled. */
  picture?: { at: number; x: number; y: number; z: number };
  title: string;
  caption: string;
}

export function getChapters(lang?: string): Chapter[];
export function chapterAt(t: number, lang?: string): Chapter;
export function assetUrls(): string[];
/** One complete frame as SVG markup (without the outer <svg>). */
export function frameSVG(t: number, opts?: { compact?: boolean; lang?: string; uid?: string }): string;
