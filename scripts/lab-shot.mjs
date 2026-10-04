// Uso: node scripts/lab-shot.mjs <outDir> pose[:w:h:samples:aperture] ...
// Requiere el servidor de desarrollo en marcha (npm run dev).
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const [outDir, ...specs] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage();
page.on('console', (m) => console.log('[page]', m.text()));
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
const q = process.env.Q || 'full';
await page.goto(`http://127.0.0.1:5173/render.html?q=${q}`);
await page.waitForFunction(() => window.__ready === true, null, { timeout: 60000 });
for (const [idx, spec] of specs.entries()) {
  const [pose, w = 900, h = 900, samples = 1, aperture = 0, extra] = spec.split(':');
  const rig = extra ? JSON.parse(Buffer.from(extra, 'base64').toString()) : {};
  const t0 = Date.now();
  const url = await page.evaluate((o) => window.__renderShot(o), { pose, w: +w, h: +h, samples: +samples, aperture: +aperture, rig, alpha: false });
  const file = path.join(outDir, `${pose}${extra ? '-' + idx : ''}.png`);
  fs.writeFileSync(file, Buffer.from(url.split(',')[1], 'base64'));
  console.log(file, `${Date.now() - t0}ms`);
}
await browser.close();
