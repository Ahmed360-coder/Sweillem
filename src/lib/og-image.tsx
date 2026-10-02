// Shared renderer for the per-page Open Graph pictures (the card shown when a
// link is shared on WhatsApp, Facebook or LinkedIn). Each route has a small
// opengraph-image.tsx that calls ogImage(). Rendered once at build time.
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import sharp from "sharp";
import { site } from "./site";

export const ogSize = { width: 1200, height: 630 };
// JPEG keeps each picture well under the 300 KB that WhatsApp accepts for link previews.
export const ogContentType = "image/jpeg";

const root = process.cwd();
const dataUri = async (file: string, type: string) =>
  `data:${type};base64,${(await readFile(join(root, file))).toString("base64")}`;

/** `photo` is a JPEG or PNG under public/ (the renderer cannot read WebP). */
export async function ogImage({ title, kicker, photo }: { title: string; kicker: string; photo: string }) {
  const [regular, semibold, logo, picture] = await Promise.all([
    readFile(join(root, "src/assets/fonts/Jost-Regular.ttf")),
    readFile(join(root, "src/assets/fonts/Jost-SemiBold.ttf")),
    dataUri("public/images/brand/sweillem-logo.svg", "image/svg+xml"),
    dataUri(`public${photo}`, photo.endsWith(".png") ? "image/png" : "image/jpeg"),
  ]);

  const png = new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#f2f2ef", fontFamily: "Jost" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 690, padding: "56px 56px 52px 64px", borderLeft: "16px solid #7a0404" }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- rendered to PNG, not a page */}
          <img src={logo} width={267} height={90} alt="" />
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ fontSize: 26, color: "#7a0404", letterSpacing: 2, textTransform: "uppercase" }}>{kicker}</div>
            <div style={{ fontSize: title.length > 28 ? 58 : 70, fontWeight: 600, lineHeight: 1.05, color: "#1c1818" }}>{title}</div>
          </div>
          <div style={{ fontSize: 24, color: "#5b5757" }}>{`${site.legalName} · Cairo, Egypt`}</div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element -- rendered to PNG, not a page */}
        <img src={picture} width={494} height={630} alt="" style={{ objectFit: "cover" }} />
      </div>
    ),
    {
      ...ogSize,
      fonts: [
        { name: "Jost", data: regular, weight: 400, style: "normal" },
        { name: "Jost", data: semibold, weight: 600, style: "normal" },
      ],
    },
  );
  const jpeg = await sharp(Buffer.from(await png.arrayBuffer())).jpeg({ quality: 82, mozjpeg: true }).toBuffer();
  return new Response(new Uint8Array(jpeg), { headers: { "Content-Type": ogContentType } });
}
