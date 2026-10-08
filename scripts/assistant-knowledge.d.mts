import type { Browser } from "@playwright/test";

export interface PageText {
  path: string;
  title: string;
  text: string;
}

export const KNOWLEDGE_FILE: string;
export function sitePaths(baseURL: string): Promise<string[]>;
export function crawlSite(baseURL: string, browser: Browser): Promise<PageText[]>;
