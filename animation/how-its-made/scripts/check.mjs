// Smoke test for the interactive player: no console errors, controls work in English and Arabic,
// fits a phone screen, and reduced motion does not autoplay.
//   node scripts/check.mjs
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { DURATION } from '../how-its-made.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const server = createServer(async (req, res) => {
  try {
    const path = join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    res.writeHead(200, { 'content-type': types[extname(path)] || 'application/octet-stream' });
    res.end(await readFile(path));
  } catch { res.writeHead(404); res.end(); }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const url = `http://127.0.0.1:${server.address().port}/index.html`;

const failures = [];
const ok = (cond, msg) => { console.log(`${cond ? 'ok  ' : 'FAIL'} ${msg}`); if (!cond) failures.push(msg); };
const browser = await chromium.launch();
const watch = (page) => {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('requestfailed', (r) => errors.push(`request failed: ${r.url()}`));
  page.on('response', (r) => r.status() >= 400 && errors.push(`${r.status()} ${r.url()}`));
  return errors;
};

// Desktop: autoplay, pause, chapter jump.
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = watch(page);
  await page.goto(url);
  await page.waitForTimeout(1500);
  const t1 = await page.evaluate(() => window.__hm.time);
  ok(t1 > 0.5, `autoplays when visible (t=${t1.toFixed(2)})`);
  await page.getByRole('button', { name: 'Pause' }).click();
  const t2 = await page.evaluate(() => window.__hm.time);
  await page.waitForTimeout(500);
  const t3 = await page.evaluate(() => window.__hm.time);
  ok(t3 === t2, 'pause stops playback');
  await page.getByRole('button', { name: /Final firing/ }).click();
  const cur = await page.locator('.hm-chapters button[aria-current]').innerText();
  ok(/Final firing/.test(cur), 'chapter button jumps and marks itself current');
  const live = await page.locator('.hm-sr').innerText();
  ok(/1200/.test(live), 'live region announces the chapter caption');
  await page.evaluate(() => window.__hm.seek(9999));
  ok((await page.evaluate(() => window.__hm.time)) === DURATION, `seek clamps to the end (${DURATION}s)`);
  ok(errors.length === 0, `no console errors${errors.length ? ': ' + errors.join('; ') : ''}`);
  await page.close();
}

// Arabic: right-to-left page, Arabic controls and captions.
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = watch(page);
  await page.goto(`${url}?lang=ar`);
  await page.waitForTimeout(800);
  ok(await page.evaluate(() => document.documentElement.dir === 'rtl' && window.__hm.lang === 'ar' && document.querySelector('.hm').dir === 'rtl'
    && !!document.querySelector('.hm-svg text[direction="rtl"]')), 'Arabic page and film run right to left');
  await page.getByRole('button', { name: 'إيقاف مؤقت' }).click();
  await page.getByRole('button', { name: /الحرق النهائي/ }).click();
  const cur = await page.locator('.hm-chapters button[aria-current]').innerText();
  ok(/الحرق النهائي/.test(cur), 'Arabic chapter button jumps and marks itself current');
  const live = await page.locator('.hm-sr').innerText();
  ok(/الأفران المكوكية/.test(live), 'live region announces the Arabic caption');
  ok(errors.length === 0, `no console errors in Arabic${errors.length ? ': ' + errors.join('; ') : ''}`);
  await page.close();
}

// Phone: no horizontal overflow, 44px targets, captions move below the picture.
for (const lang of ['en', 'ar']) {
  const page = await browser.newPage({ viewport: { width: 375, height: 740 }, deviceScaleFactor: 2 });
  await page.goto(`${url}?lang=${lang}`);
  await page.waitForTimeout(500);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  ok(overflow <= 0, `no horizontal page scroll at 375px, ${lang} (overflow ${overflow}px)`);
  const small = await page.evaluate(() => [...document.querySelectorAll('.hm button')].filter((b) => b.getBoundingClientRect().height < 44).length);
  ok(small === 0, `all buttons are at least 44px tall, ${lang}`);
  ok(await page.evaluate(() => document.querySelector('.hm').classList.contains('hm-compact')), `compact layout on a phone, ${lang}`);
  await page.screenshot({ path: join(root, 'out', `phone-${lang}.png`) });
  await page.close();
}

// Reduced motion: no autoplay.
{
  const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(url);
  await page.waitForTimeout(1200);
  ok(!(await page.evaluate(() => window.__hm.playing)), 'reduced motion does not autoplay');
  await ctx.close();
}

await browser.close();
server.close();
if (failures.length) { console.error(`${failures.length} check(s) failed`); process.exit(1); }
