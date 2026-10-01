import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Jost } from "next/font/google";
import type { ReactNode } from "react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Intro, introGateScript } from "@/components/Intro";
import { MotionProvider } from "@/components/MotionProvider";
import { RevealObserver } from "@/components/RevealObserver";
import { mapData } from "@/lib/projects-map";
import { site, siteUrl } from "@/lib/site";
import "./globals.css";
import "./intro.css";

const jost = Jost({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-jost" });
const plexSans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-plex-sans" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-plex-mono" });

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
  openGraph: {
    type: "website",
    siteName: site.legalName,
    locale: "en",
    images: [{ url: "/images/site/hero.webp", width: 1227, height: 920, alt: "SWEILLEM vitrified clay pipes on a site in Germany" }],
  },
  // Previews stay out of search engines until launch (Milestone 8).
  robots: isProduction ? undefined : { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2f2ef" },
    { media: "(prefers-color-scheme: dark)", color: "#141011" },
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
          <Header mapData={mapData} />
          <main id="main" tabIndex={-1} className="flex-1 outline-none">
            {children}
          </main>
          <Footer />
          <RevealObserver />
        </MotionProvider>
        <Intro />
      </body>
    </html>
  );
}
