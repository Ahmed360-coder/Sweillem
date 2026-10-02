import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Jost } from "next/font/google";
import type { ReactNode } from "react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Intro, introGateScript } from "@/components/Intro";
import { MotionProvider } from "@/components/MotionProvider";
import { RevealObserver } from "@/components/RevealObserver";
import { TopBar } from "@/components/TopBar";
import { baseOpenGraph } from "@/lib/metadata";
import { mapData } from "@/lib/projects-map";
import { revealEarlyScript } from "@/lib/reveal-early";
import { site, siteUrl } from "@/lib/site";
import { THEME_COLORS, themeScript } from "@/lib/theme-script";
import "./globals.css";
import "./intro.css";

const jost = Jost({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-jost" });
const plexSans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-plex-sans" });
// Mono is only used for small labels and spec values, so it is not preloaded ahead of the body fonts.
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-plex-mono", preload: false });

const isProduction = process.env.VERCEL_ENV === "production";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${site.name} · Vitrified clay pipes since 1935`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  // The name under the icon on an iPhone home screen; the page title would be cut to "SWEILLEM·Vitri…".
  appleWebApp: { title: site.name },
  // Pages set their own title, description and canonical; the share picture is each route's opengraph-image.tsx.
  openGraph: { ...baseOpenGraph, url: "/" },
  twitter: { card: "summary_large_image" },
  // Previews stay out of search engines until launch (Milestone 8).
  robots: isProduction ? undefined : { index: false, follow: false },
};

export const viewport: Viewport = {
  // The theme script repaints both to the chosen theme's colour when a visitor picks one.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: THEME_COLORS.light },
    { media: "(prefers-color-scheme: dark)", color: THEME_COLORS.dark },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${jost.variable} ${plexSans.variable} ${plexMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script dangerouslySetInnerHTML={{ __html: introGateScript }} />
        <noscript>
          <style>{".reveal,.joint-spigot{opacity:1!important;transform:none!important}.joint-seal{opacity:1!important}.grow-x{transform:scaleX(var(--v,1))!important}"}</style>
        </noscript>
      </head>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <MotionProvider>
          <TopBar />
          <Header mapData={mapData} />
          <main id="main" tabIndex={-1} className="flex-1 outline-none">
            {children}
          </main>
          <Footer />
          <script dangerouslySetInnerHTML={{ __html: revealEarlyScript }} />
          <RevealObserver />
        </MotionProvider>
        <Intro />
      </body>
    </html>
  );
}
