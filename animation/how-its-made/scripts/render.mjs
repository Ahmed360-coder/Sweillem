// Renders the animation frame by frame to MP4 (H.264), a poster image and WebVTT captions.
//
//   node scripts/render.mjs [outDir] [--fps 30] [--from 0] [--to 88] [--stills 5,20,40]
//
// Needs Playwright (Chromium) and an ffmpeg binary (FFMPEG env var, or `ffmpeg` on PATH).
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { extname, join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { CHAPTERS, DURATION } from '../how-its-made.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : def; };
const outDir = resolve(args.find((a, i) => !a.startsWith('--') && !args[i - 1]?.startsWith('--')) || join(root, 'out'));
const fps = Number(opt('fps', 30));
const from = Number(opt('from', 0));
const to = Number(opt('to', DURATION));
const stills = opt('stills', '');
const ffmpeg = process.env.FFMPEG || 'ffmpeg';

const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.woff2': 'font/woff2' };
const server = createServer(async (req, res) => {
  try {
    const path = join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (!path.startsWith(root)) throw new Error('outside root');
    res.writeHead(200, { 'content-type': types[extname(path)] || 'application/octet-stream' });
    res.end(await readFile(path));
  } catch { res.writeHead(404); res.end(); }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const url = `http://127.0.0.1:${server.address().port}/index.html?render=1`;

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await page.goto(url);
await page.waitForFunction(() => window.__hm && document.fonts.status === 'loaded');
await page.evaluate(() => Promise.all([...document.images].map((i) => i.decode?.().catch(() => {}))));
const stage = page.locator('.hm-stage');

async function shot(t, type = 'png') {
  await page.evaluate(async (tt) => {
    window.__hm.seek(tt);
    await Promise.all([...document.querySelectorAll('.hm-svg image')].map((i) => i.decode?.().catch(() => {})));
  }, t);
  return stage.screenshot({ type, ...(type === 'jpeg' ? { quality: 92 } : {}) });
}

if (stills) {
  for (const s of stills.split(',').map(Number)) {
    await writeFile(join(outDir, `still-${String(s).padStart(5, '0')}.png`), await shot(s));
  }
} else {
  const mp4 = join(outDir, 'sweillem-how-its-made.mp4');
  const ff = spawn(ffmpeg, ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', mp4],
  { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((r, j) => ff.on('close', (c) => (c === 0 ? r() : j(new Error(`ffmpeg exited ${c}`)))));
  const frames = Math.round((to - from) * fps);
  for (let i = 0; i < frames; i++) {
    const buf = await shot(from + i / fps, 'jpeg');
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (i % (fps * 5) === 0) process.stdout.write(`frame ${i}/${frames}\n`);
  }
  ff.stdin.end();
  await done;
  // Poster: the finished pipe at the end of the firing chapter.
  const fire = CHAPTERS.find((c) => c.id === 'fire');
  await writeFile(join(outDir, 'sweillem-how-its-made-poster.png'), await shot(fire.end - 0.8));
  // Captions.
  const ts = (s) => new Date(s * 1000).toISOString().slice(11, 23);
  const vtt = ['WEBVTT', '', ...CHAPTERS.flatMap((c, i) => [String(i + 1), `${ts(c.start)} --> ${ts(c.end)}`, `${c.n ? `${c.n}. ` : ''}${c.title}: ${c.caption}`, ''])].join('\n');
  await writeFile(join(outDir, 'sweillem-how-its-made.en.vtt'), vtt);
  console.log(`wrote ${mp4}`);
}
await browser.close();
server.close();
